// Generates a faction package's CSS from its tokens and component styles.
// Expected folder structure (relative to `root`):
//
//   tokens/base.json          sizes, font sizes, base colors …  → :root variables
//   tokens/themes/<name>.json color palette per theme           → [data-theme="<name>"]
//   tokens/alerts/<name>.json color palette per alert level     → [data-alert="<name>"]
//   css/*.css                 component styles (sorted by file name)
//   themes/<name>/theme.css   theme extras (optional)           → dist/themes/<name>.css
//   fonts/                    fonts (optional)                  → dist/fonts/
//
// Output: dist/ui.css (+ dist/themes/*.css, dist/fonts/).
import crypto from "crypto";
import fs from "fs";
import path from "path";

// Appends a content hash to font URLs so browsers reload changed fonts
function bustFontCache(css, root) {
  return css.replace(/url\('\.\/(fonts\/[^'?]+)'\)/g, (match, rel) => {
    const file = path.join(root, rel);
    if (!fs.existsSync(file)) return match;
    const hash = crypto.createHash("md5").update(fs.readFileSync(file)).digest("hex").slice(0, 8);
    return `url('./${rel}?v=${hash}')`;
  });
}

// Helper function: camelCase → kebab-case
const kebab = (str) =>
  str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();

const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));

// All JSON files in a folder as { name: content }
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

// Palette → --colors-* variables. Missing hover colors are derived.
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
 * @param {string} options.root          the faction's package folder
 * @param {string} options.defaultTheme  theme whose palette is applied to :root
 * @param {string} [options.prefix]      prefix of CSS classes/variables (e.g. "lcar")
 * @param {string} [options.varPrefix]   prefix of token variables (e.g. "rom-" → --rom-colors-color1),
 *                                       so several factions can coexist on one page
 */
export function buildCss({ root, defaultTheme, prefix = "lcar", varPrefix = "" }) {
  const distDir = path.join(root, "dist");
  const base = readJson(path.join(root, "tokens/base.json"));
  const themes = readJsonDir(path.join(root, "tokens/themes"));
  const alerts = readJsonDir(path.join(root, "tokens/alerts"));

  const defaultPalette = themes[defaultTheme];
  if (!defaultPalette) throw new Error(`Theme "${defaultTheme}" is missing in tokens/themes/`);

  const finalCss =
    "/* AUTO-GENERATED FROM tokens/ + css/*.css — DO NOT EDIT */\n\n" +
    `:root {\n${generateCssVars(base, varPrefix)}${generatePalette(defaultPalette, varPrefix)}}\n\n` +
    generateColorStyles(defaultPalette, prefix, varPrefix) +
    "/* Themes */\n" + generatePaletteBlocks(themes, "data-theme", varPrefix) + "\n" +
    "/* Alert palettes */\n" + generatePaletteBlocks(alerts, "data-alert", varPrefix) + "\n" +
    readComponentStyles(path.join(root, "css"));

  fs.mkdirSync(distDir, { recursive: true });
  fs.writeFileSync(path.join(distDir, "ui.css"), bustFontCache(finalCss, root));

  // Theme extras
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
