import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  // Einige Komponenten nutzen State/Context → als Client-Komponenten markieren (Next.js App Router)
  banner: { js: '"use client";' },
});
