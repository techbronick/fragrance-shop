import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

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
    target: "esnext",
    minify: "esbuild",
    chunkSizeWarningLimit: 1000,
    assetsInlineLimit: 4096,
  },
  assetsInclude: ["**/*.webp", "**/*.avif"],
});
