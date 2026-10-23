import { existsSync, readdirSync } from "fs";
import { defineConfig } from "tsup";

// Theme extras with code: themes/<name>/index.ts (vanilla) or themes/<name>/react.tsx (React)
const themeEntries = (file: string, out: string) =>
  Object.fromEntries(
    readdirSync("themes")
      .filter((name) => existsSync(`themes/${name}/${file}`))
      .map((name) => [`themes/${name}/${out}`, `themes/${name}/${file}`])
  );

export default defineConfig([
  // Framework-agnostic: class names, data attributes, initLcars()
  {
    entry: { index: "src/index.ts", ...themeEntries("index.ts", "index") },
    format: ["esm"],
    dts: true,
  },
  // React; some components use state/context → mark them as client components (Next.js App Router)
  {
    entry: { "react/index": "src/react/index.ts", ...themeEntries("react.tsx", "react") },
    format: ["esm"],
    dts: true,
    banner: { js: '"use client";' },
  },
  // <script> tag without a bundler: everything in one file as the global LcarsFederation
  {
    entry: { index: "src/index.ts" },
    format: ["iife"],
    globalName: "LcarsFederation",
    noExternal: [/.*/],
  },
]);
