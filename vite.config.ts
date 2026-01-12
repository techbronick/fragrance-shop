import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 8080,
    allowedHosts: true,
    hmr: {
      // Use port 443 only in production/Replit environment
      clientPort: process.env.REPL_ID ? 443 : undefined,
    },
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    global: 'globalThis',
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunk for node_modules
          if (id.includes('node_modules')) {
            // Supabase chunk
            if (id.includes('@supabase')) {
              return 'supabase';
            }
            // React vendor chunk
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            // TanStack Query
            if (id.includes('@tanstack')) {
              return 'query';
            }
            // Radix UI components
            if (id.includes('@radix-ui')) {
              return 'ui-vendor';
            }
            // Lucide icons
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            // React Router
            if (id.includes('react-router')) {
              return 'routing';
            }
            // Other vendor libraries
            return 'vendor';
          }
          // Admin pages chunk
          if (id.includes('/pages/Admin') || id.includes('/admin/')) {
            return 'admin';
          }
          // Discovery pages chunk
          if (id.includes('/pages/DiscoverySet') || id.includes('/discovery/')) {
            return 'discovery';
          }
        }
      }
    },
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production'
      }
    },
    chunkSizeWarningLimit: 1000,
    // Image optimization
    assetsInlineLimit: 4096, // Inline small images as base64
  },
  // Add image optimization for static assets
  assetsInclude: ['**/*.webp', '**/*.avif']
}));
