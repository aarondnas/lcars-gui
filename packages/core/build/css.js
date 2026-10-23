// Erzeugt das CSS eines Fraktionspakets aus dessen Tokens und Komponenten-Styles.
// Erwartete Ordnerstruktur (relativ zu `root`):
//
//   tokens/base.json          Maße, Schriftgrößen, Grundfarben … → :root-Variablen
//   tokens/themes/<name>.json Farbpalette pro Theme             → [data-theme="<name>"]
//   tokens/alerts/<name>.json Farbpalette pro Alarmstufe        → [data-alert="<name>"]
//   css/*.css                 Komponenten-Styles (nach Dateiname sortiert)
//   themes/<name>/theme.css   Theme-Extras (optional)           → dist/themes/<name>.css
//   fonts/                    Schriften (optional)              → dist/fonts/
//
// Ergebnis: dist/ui.css (+ dist/themes/*.css, dist/fonts/).
import fs from "fs";
import path from "path";

// Helper function: camelCase → kebab-case
const kebab = (str) =>
  str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();

const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));

// Alle JSON-Dateien eines Ordners als { name: inhalt }
function readJsonDir(dir) {
  if (!fs.existsSync(dir)) return {};
  return Object.fromEntries(
    fs
      .readdirSync(dir)
      .filter((file) => file.endsWith(".json"))
      .sort()
      .map((file) => [path.basename(file, ".json"), readJson(path.join(dir, file))])
  );
}

// Generate css-variables from all base tokens
function generateCssVars(baseTokens, vars) {
  let css = "";
  for (const [group, values] of Object.entries(baseTokens)) {
    for (const [key, value] of Object.entries(values)) {
      css += `  --${vars}${group}-${kebab(key)}: ${value};\n`;
    }
  }
  return css;
}

// Palette → --colors-* Variablen. Fehlende Hover-Farben werden abgeleitet.
function generatePalette(palette, vars) {
  let css = "";
  for (const [key, value] of Object.entries(palette)) {
    if (key.endsWith("hover")) continue;
    const hover = palette[`${key}hover`] ?? `color-mix(in srgb, ${value} 65%, white)`;
    css += `  --${vars}colors-${key}: ${value};\n`;
    css += `  --${vars}colors-${key}hover: ${hover};\n`;
  }
  return css;
}

// Colors: data-color="n" sets --<prefix>-bg / --<prefix>-bg-hover (inherited by children)
function generateColorStyles(palette, prefix, vars) {
  let css = "/* Colors */\n";
  for (let i = 1; palette[`color${i}`]; i++) {
    css += `[data-color="${i}"] { --${prefix}-bg: var(--${vars}colors-color${i}); --${prefix}-bg-hover: var(--${vars}colors-color${i}hover); }\n`;
  }
  return css + "\n";
}

function generatePaletteBlocks(palettes, attribute, vars) {
  return Object.entries(palettes)
    .map(([name, palette]) => `[${attribute}="${name}"] {\n${generatePalette(palette, vars)}}\n`)
    .join("");
}

// Component styles: css/*.css in file name order
function readComponentStyles(cssDir) {
  return fs
    .readdirSync(cssDir)
    .filter((file) => file.endsWith(".css"))
    .sort()
    .map((file) => `/* ==================== ${file} ==================== */\n\n` + fs.readFileSync(path.join(cssDir, file), "utf8"))
    .join("\n");
}

/**
 * @param {object} options
 * @param {string} options.root          Paketordner der Fraktion
 * @param {string} options.defaultTheme  Theme, dessen Palette auf :root liegt
 * @param {string} [options.prefix]      Präfix der CSS-Klassen/-Variablen (z. B. "lcar")
 * @param {string} [options.varPrefix]   Präfix der Token-Variablen (z. B. "rom-" → --rom-colors-color1),
 *                                       damit mehrere Fraktionen auf einer Seite nicht kollidieren
 */
export function buildCss({ root, defaultTheme, prefix = "lcar", varPrefix = "" }) {
  const distDir = path.join(root, "dist");
  const base = readJson(path.join(root, "tokens/base.json"));
  const themes = readJsonDir(path.join(root, "tokens/themes"));
  const alerts = readJsonDir(path.join(root, "tokens/alerts"));

  const defaultPalette = themes[defaultTheme];
  if (!defaultPalette) throw new Error(`Theme "${defaultTheme}" fehlt in tokens/themes/`);

  const finalCss =
    "/* AUTO-GENERATED FROM tokens/ + css/*.css — DO NOT EDIT */\n\n" +
    `:root {\n${generateCssVars(base, varPrefix)}${generatePalette(defaultPalette, varPrefix)}}\n\n` +
    generateColorStyles(defaultPalette, prefix, varPrefix) +
    "/* Themes */\n" + generatePaletteBlocks(themes, "data-theme", varPrefix) + "\n" +
    "/* Alert palettes */\n" + generatePaletteBlocks(alerts, "data-alert", varPrefix) + "\n" +
    readComponentStyles(path.join(root, "css"));

  fs.mkdirSync(distDir, { recursive: true });
  fs.writeFileSync(path.join(distDir, "ui.css"), finalCss);

  // Theme-Extras
  const themesDir = path.join(root, "themes");
  if (fs.existsSync(themesDir)) {
    fs.mkdirSync(path.join(distDir, "themes"), { recursive: true });
    for (const name of fs.readdirSync(themesDir)) {
      const file = path.join(themesDir, name, "theme.css");
      if (fs.existsSync(file)) fs.copyFileSync(file, path.join(distDir, "themes", `${name}.css`));
    }
  }

  const fontsDir = path.join(root, "fonts");
  if (fs.existsSync(fontsDir)) {
    fs.cpSync(fontsDir, path.join(distDir, "fonts"), { recursive: true });
  }
}
