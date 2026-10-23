import { existsSync, readdirSync } from "fs";
import { defineConfig } from "tsup";

// Theme-Extras mit Code: themes/<name>/index.ts (Vanilla) bzw. themes/<name>/react.tsx (React)
const themeEntries = (file: string, out: string) =>
  Object.fromEntries(
    readdirSync("themes")
      .filter((name) => existsSync(`themes/${name}/${file}`))
      .map((name) => [`themes/${name}/${out}`, `themes/${name}/${file}`])
  );

export default defineConfig([
  // Framework-unabhängig: Klassennamen, data-Attribute, initLcars()
  {
    entry: { index: "src/index.ts", ...themeEntries("index.ts", "index") },
    format: ["esm"],
    dts: true,
  },
  // React; einige Komponenten nutzen State/Context → als Client-Komponenten markieren (Next.js App Router)
  {
    entry: { "react/index": "src/react/index.ts", ...themeEntries("react.tsx", "react") },
    format: ["esm"],
    dts: true,
    banner: { js: '"use client";' },
  },
  // <script>-Tag ohne Bundler: alles in einer Datei als globales LcarsFederation
  {
    entry: { index: "src/index.ts" },
    format: ["iife"],
    globalName: "LcarsFederation",
    noExternal: [/.*/],
  },
]);
