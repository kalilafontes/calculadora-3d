import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL("./index.html", import.meta.url)),
        pricingGuide: fileURLToPath(
          new URL(
            "./como-calcular-preco-impressao-3d/index.html",
            import.meta.url,
          ),
        ),
      },
    },
  },
});
