import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Minimal, Vercel-friendly Vite config
export default defineConfig({
  plugins: [react()],
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
});
