import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: { index: "src/index.ts" },
    format: ["esm"],
    dts: true,
  },
  // SoundProvider uses context → client component (Next.js App Router)
  {
    entry: { "react/index": "src/react/index.ts" },
    format: ["esm"],
    dts: true,
    banner: { js: '"use client";' },
  },
]);
