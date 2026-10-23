import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { buildCss } from "@lcars-gui/core/build";

const root = path.dirname(fileURLToPath(import.meta.url));

// dist/ leeren; tsup läuft danach ohne clean, damit ui.css erhalten bleibt
fs.rmSync(path.join(root, "dist"), { recursive: true, force: true });
buildCss({ root, defaultTheme: "warbird", prefix: "rom", varPrefix: "rom-" });

console.log("✔ ui.css erfolgreich generiert!");
