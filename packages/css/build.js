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
.ui-btn {
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--fontSize-md);
  color: var(--colors-text2);
  background: var(--colors-color1);
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  transition: background 0.2s ease;
}

.ui-btn:hover {
  background: var(--colors-color2);
}

.ui-btn-secondary {
  background: var(--colors-color3);
  color: var(--colors-text1);
}

.ui-btn-danger {
  background: var(--colors-color4);
  color: var(--colors-text1);
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
