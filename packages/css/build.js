import fs from "fs";
import path from "path";

// Pfad zu deinen Tokens
const tokensPath = path.resolve("../tokens/tokens.json");
const tokens = JSON.parse(fs.readFileSync(tokensPath, "utf8"));

// Hilfsfunktion: camelCase → kebab-case
const kebab = (str) =>
  str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();

// Generiere CSS-Variablen aus allen Tokens
function generateCssVars() {
  let css = ":root {\n";

  for (const [group, values] of Object.entries(tokens)) {
    for (const [key, value] of Object.entries(values)) {
      css += `  --${group}-${kebab(key)}: ${value};\n`;
    }
  }

  css += "}\n\n";
  return css;
}

// Beispiel: Button-Komponente
function generateComponentStyles() {
  return `
@font-face {
  font-family: 'HelveticaUltraCompressed';
  src: url('../utils/fonts/HelveticaUltraCompressed/HelveticaUltraCompressed.woff2') format('woff2'),
       url('../utils/fonts/HelveticaUltraCompressed/HelveticaUltraCompressed.woff') format('woff');
  font-weight: normal;
  font-style: normal;
}

.lcar-btn-std[data-color="1"] { --btn-bg: var(--colors-color1); --btn-bg-hover: var(--colors-color1hover); }
.lcar-btn-std[data-color="2"] { --btn-bg: var(--colors-color2); --btn-bg-hover: var(--colors-color2hover); }
.lcar-btn-std[data-color="3"] { --btn-bg: var(--colors-color3); --btn-bg-hover: var(--colors-color3hover); }
.lcar-btn-std[data-color="4"] { --btn-bg: var(--colors-color4); --btn-bg-hover: var(--colors-color4hover); }
.lcar-btn-std[data-color="5"] { --btn-bg: var(--colors-color5); --btn-bg-hover: var(--colors-color5hover); }
.lcar-btn-std[data-color="6"] { --btn-bg: var(--colors-color6); --btn-bg-hover: var(--colors-color6hover); }
.lcar-btn-std[data-color="7"] { --btn-bg: var(--colors-color7); --btn-bg-hover: var(--colors-color7hover); }

.lcar-btn-std {
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--fontSize-md);
  color: var(--colors-text2);
  background: var(--btn-bg, var(--colors-color1));
  border-radius: var(--radius-btn-std);
  border: none;
  cursor: pointer;
  transition: background 0.2s ease;
  font-family: 'HelveticaUltraCompressed', Helvetica, Arial, sans-serif;
  color: var(--colors-text1);
}

.lcar-btn-std:hover {
  background: var(--btn-bg-hover, var(--colors-color1hover));
}
`;
}

// Zusammenbauen und schreiben
const finalCss =
  "/* AUTO-GENERATED FROM tokens.json — DO NOT EDIT */\n\n" +
  generateCssVars() +
  generateComponentStyles();

const outPath = path.resolve("./ui.css");
fs.writeFileSync(outPath, finalCss);

console.log("✔ ui.css erfolgreich generiert!");
