import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { config as loadEnv } from "dotenv";

loadEnv();

// Pure slug helper, mirroring src/utils/slugs.ts. Inlined here so vite.config.ts
// doesn't need path-alias resolution at Node-execution time.
function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[×x](?=\d)/g, "x")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Fetches dynamic routes from Supabase at build time and returns them with
// static routes for pre-rendering.
async function buildRouteList(): Promise<string[]> {
  const langs = ["ro", "ru", "en"];

  const staticSubPaths = [
    "",
    "shop",
    "discovery-sets",
    "discovery-sets/builder",
    "discovery-sets/recommend",
    "about",
    "contact",
    "faq",
    "careers",
    "privacy",
    "terms",
    "login",
  ];

  const staticRoutes = langs.flatMap((lang) =>
    staticSubPaths.map((p) => (p ? `/${lang}/${p}` : `/${lang}`)),
  );
  staticRoutes.unshift("/");

  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.warn("[ssg] Missing VITE_SUPABASE_URL/ANON_KEY — skipping dynamic routes.");
    return staticRoutes;
  }

  const client = createClient(url, key);

  const [productsRes, skusRes, configsRes] = await Promise.all([
    client.from("products").select("id,brand,name"),
    client.from("skus").select("product_id"),
    client.from("discovery_set_configs").select("id,name,is_active"),
  ]);

  const products = productsRes.data ?? [];
  const skus = skusRes.data ?? [];
  const configs = configsRes.data ?? [];

  const productIdsWithSkus = new Set(skus.map((s: { product_id: string }) => s.product_id));
  const visibleProducts = products.filter((p: { id: string }) => productIdsWithSkus.has(p.id));
  const visibleSets = configs.filter((c: { is_active: boolean }) => c.is_active);
  const brands = Array.from(
    new Set(visibleProducts.map((p: { brand: string }) => p.brand)),
  ) as string[];

  const productPaths = langs.flatMap((lang) =>
    visibleProducts.map(
      (p: { brand: string; name: string }) =>
        `/${lang}/product/${slugify(p.brand)}/${slugify(p.name)}`,
    ),
  );
  const brandPaths = langs.flatMap((lang) =>
    brands.map((b) => `/${lang}/brand/${slugify(b)}`),
  );
  const setPaths = langs.flatMap((lang) =>
    visibleSets.map((c: { name: string }) => `/${lang}/discovery-set/${slugify(c.name)}`),
  );

  console.log(
    `[ssg] Pre-rendering ${staticRoutes.length} static + ${productPaths.length} products + ${brandPaths.length} brands + ${setPaths.length} sets`,
  );

  return [...staticRoutes, ...productPaths, ...brandPaths, ...setPaths];
}

// Minimal, Vercel-friendly Vite config
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // expose dev server on LAN (so phones on same Wi-Fi can hit it)
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    global: "globalThis",
  },
  build: {
    // Let Vite/Rollup decide chunking to avoid vendor initialization issues
    target: "esnext",
    minify: "esbuild",
    chunkSizeWarningLimit: 1000,
    assetsInlineLimit: 4096, // Inline small images as base64
  },
  assetsInclude: ["**/*.webp", "**/*.avif"],
  ssr: {
    // Bundle these CJS packages into the SSR output so ESM Node can import them
    noExternal: ["react-helmet-async"],
  },
  ssgOptions: {
    // Produce dist/<lang>/<route>/index.html (not flat .html files)
    dirStyle: "nested",
    // Enumerate every public route to pre-render — static + dynamic data routes
    // (products, brands, discovery sets) fetched from Supabase at build time.
    includedRoutes() {
      return buildRouteList();
    },
  },
});
