import 'dotenv/config';
import { createClient } from "@supabase/supabase-js";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { brandSlug, productSlug, setSlug } from "../utils/slugs";

const SITE = "https://modestshop.md";
const langs = ["ro", "ru", "en"] as const;

const STATIC_PATHS: Array<{ p: string; priority: number }> = [
  { p: "", priority: 1.0 },
  { p: "/shop", priority: 0.9 },
  { p: "/discovery-sets", priority: 0.9 },
  { p: "/about", priority: 0.5 },
  { p: "/contact", priority: 0.5 },
  { p: "/faq", priority: 0.5 },
  { p: "/privacy", priority: 0.3 },
  { p: "/terms", priority: 0.3 },
  { p: "/careers", priority: 0.3 },
];

async function fetchAll<T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client: any,
  table: string,
  columns: string,
): Promise<T[]> {
  const pageSize = 1000;
  const all: T[] = [];
  let from = 0;
  while (true) {
    const { data, error } = await client
      .from(table)
      .select(columns)
      .range(from, from + pageSize - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    all.push(...(data as T[]));
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return all;
}

(async () => {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY env vars");
  }
  const client = createClient(url, key);

  const [products, skus, configs] = await Promise.all([
    fetchAll<{ id: string; brand: string; name: string; updated_at: string }>(client, "products", "id,brand,name,updated_at"),
    fetchAll<{ product_id: string }>(client, "skus", "product_id"),
    fetchAll<{ id: string; name: string; updated_at: string; is_active: boolean }>(client, "discovery_set_configs", "id,name,updated_at,is_active"),
  ]);

  const productIdsWithSkus = new Set(skus.map((s) => s.product_id));
  const visibleProducts = products.filter((p) => productIdsWithSkus.has(p.id));
  const visibleSets = configs.filter((c) => c.is_active);
  const brands = Array.from(new Set(visibleProducts.map((p) => p.brand)));

  console.log(
    `[sitemap] DB rows: products: ${products.length}, skus: ${skus.length}, configs: ${configs.length}. ` +
      `Visible: products: ${visibleProducts.length}, brands: ${brands.length}, sets: ${visibleSets.length}.`,
  );

  type UrlEntry = { path: string; lastmod: string; priority: number };
  const entries: UrlEntry[] = [];

  STATIC_PATHS.forEach(({ p, priority }) =>
    entries.push({ path: p, lastmod: new Date().toISOString(), priority }),
  );
  visibleProducts.forEach((p) =>
    entries.push({
      path: `/product/${brandSlug(p.brand)}/${productSlug(p.name)}`,
      lastmod: p.updated_at,
      priority: 0.8,
    }),
  );
  brands.forEach((b) =>
    entries.push({ path: `/brand/${brandSlug(b)}`, lastmod: new Date().toISOString(), priority: 0.7 }),
  );
  visibleSets.forEach((c) =>
    entries.push({ path: `/discovery-set/${setSlug(c.name)}`, lastmod: c.updated_at, priority: 0.7 }),
  );

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
    entries
      .flatMap((e) =>
        langs.map(
          (lang) =>
            `  <url>\n` +
            `    <loc>${SITE}/${lang}${e.path}</loc>\n` +
            `    <lastmod>${e.lastmod}</lastmod>\n` +
            `    <priority>${e.priority}</priority>\n` +
            langs
              .map(
                (alt) =>
                  `    <xhtml:link rel="alternate" hreflang="${alt}" href="${SITE}/${alt}${e.path}"/>`,
              )
              .join("\n") +
            `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}/ro${e.path}"/>\n` +
            `  </url>`,
        ),
      )
      .join("\n") +
    `\n</urlset>\n`;

  mkdirSync(join(process.cwd(), "dist"), { recursive: true });
  writeFileSync(join(process.cwd(), "dist", "sitemap.xml"), xml, "utf-8");
  console.log(`sitemap.xml written: ${entries.length * langs.length} URLs`);
})();
