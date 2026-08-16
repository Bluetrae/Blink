import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Relative base: works both under the GitHub Pages subpath (/Blink/) and a
// future apex custom domain, with no config change.
export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
});
