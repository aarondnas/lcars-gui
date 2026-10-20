import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const here = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(here, "dist");
const srcDir = path.join(here, "src");

// Path to tokens
const tokensPath = path.join(here, "../tokens/tokens.json");
const tokens = JSON.parse(fs.readFileSync(tokensPath, "utf8"));
const { themes = {}, ...baseTokens } = tokens;

// Helper function: camelCase → kebab-case
const kebab = (str) =>
  str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();

// Generate css-variables from all tokens
function generateCssVars() {
  let css = ":root {\n";

  for (const [group, values] of Object.entries(baseTokens)) {
    for (const [key, value] of Object.entries(values)) {
      css += `  --${group}-${kebab(key)}: ${value};\n`;
    }
  }

  css += "}\n\n";
  return css;
}

// Colors: data-color="n" sets --lcar-bg / --lcar-bg-hover (inherited by children)
function generateColorStyles() {
  let css = "/* Colors */\n";

  for (let i = 1; tokens.colors[`color${i}`]; i++) {
    css += `[data-color="${i}"] { --lcar-bg: var(--colors-color${i}); --lcar-bg-hover: var(--colors-color${i}hover); }\n`;
  }

  return css + "\n";
}

// Themes ("ds9" → data-theme="ds9") and alert palettes ("alert-red" → data-alert="red").
// Hover colors are derived automatically.
function generateThemeStyles() {
  let css = "/* Themes & Alert palettes */\n";

  for (const [name, colors] of Object.entries(themes)) {
    const selector = name.startsWith("alert-")
      ? `[data-alert="${name.slice("alert-".length)}"]`
      : `[data-theme="${name}"]`;

    css += `${selector} {\n`;
    for (const [key, value] of Object.entries(colors)) {
      css += `  --colors-${key}: ${value};\n`;
      css += `  --colors-${key}hover: color-mix(in srgb, ${value} 65%, white);\n`;
    }
    css += "}\n";
  }

  return css + "\n";
}

// Component styles: src/*.css in file name order
function readComponentStyles() {
  return fs
    .readdirSync(srcDir)
    .filter((file) => file.endsWith(".css"))
    .sort()
    .map((file) => `/* ==================== ${file} ==================== */\n\n` + fs.readFileSync(path.join(srcDir, file), "utf8"))
    .join("\n");
}

// Build and write
const finalCss =
  "/* AUTO-GENERATED FROM tokens.json + src/*.css — DO NOT EDIT */\n\n" +
  generateCssVars() +
  generateColorStyles() +
  generateThemeStyles() +
  readComponentStyles();

fs.rmSync(distDir, { recursive: true, force: true });
fs.mkdirSync(distDir, { recursive: true });
fs.writeFileSync(path.join(distDir, "ui.css"), finalCss);
fs.cpSync(path.join(here, "fonts"), path.join(distDir, "fonts"), { recursive: true });

console.log("✔ ui.css erfolgreich generiert!");
