import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: { index: "src/index.ts" },
    format: ["esm"],
    dts: true,
  },
  // SoundProvider nutzt Context → Client-Komponente (Next.js App Router)
  {
    entry: { "react/index": "src/react/index.ts" },
    format: ["esm"],
    dts: true,
    banner: { js: '"use client";' },
  },
]);
