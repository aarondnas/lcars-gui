import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { buildCss } from "@lcars-gui/core/build";

const root = path.dirname(fileURLToPath(import.meta.url));

// Empty dist/; tsup runs afterwards without clean so ui.css is kept
fs.rmSync(path.join(root, "dist"), { recursive: true, force: true });
buildCss({ root, defaultTheme: "tng" });

console.log("✔ ui.css generated");
