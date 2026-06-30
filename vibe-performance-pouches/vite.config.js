import { defineConfig } from "vite";
import { readdirSync } from "node:fs";
import { resolve } from "node:path";

// Discover every top-level HTML page so each one is built (not just index.html).
const htmlInputs = Object.fromEntries(
  readdirSync(".")
    .filter((f) => f.endsWith(".html"))
    .map((f) => [f.replace(/\.html$/, ""), resolve(f)])
);

export default defineConfig({
  build: {
    rollupOptions: {
      input: htmlInputs,
    },
  },
});
