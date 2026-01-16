import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
  ],

  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "frontend/src"),
      "@shared": path.resolve(process.cwd(), "shared"),
      "@assets": path.resolve(process.cwd(), "attached_assets"),
    },
  },

  root: path.resolve(process.cwd(), "frontend"),

  build: {
    outDir: path.resolve(process.cwd(), "dist/frontend"),
    emptyOutDir: true,
  },

  server: {
    fs: {
      strict: false,
      allow: [".", ".."],
    },
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
