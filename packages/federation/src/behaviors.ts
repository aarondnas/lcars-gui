// packages/federation/src/behaviors.ts
// Verhalten für reines HTML/JS: verdrahtet Toggles, Tabs, Keypads, Data Cascades
// und Bedien-Töne im Markup, das die React-Komponenten sonst selbst erzeugen.
import { initBehaviors, type InitBehaviorsOptions, type LcarsController } from "@lcars-gui/core";
import { buttonClassName } from "./button";
import { cascadeNumbers, controlClassNames, displayClassNames } from "./display";

export { pressedChangeEvent, type LcarsController } from "@lcars-gui/core";

export type InitLcarsOptions = InitBehaviorsOptions;

/**
 * Macht statisches LCARS-Markup interaktiv.
 * Der zurückgegebene Controller spielt Töne und entfernt die Listener wieder.
 */
export function initLcars(options: InitLcarsOptions = {}): LcarsController {
  fillCascades(options.root);
  return initBehaviors(
    {
      control: `.${buttonClassName}, .${controlClassNames.tab}`,
      keypad: `.${controlClassNames.keypad}`,
      keypadKey: `.${buttonClassName}`,
      keypadDisplay: `.${controlClassNames.keypadDisplay}`,
    },
    options
  );
}

/** Füllt leere Data Cascades (data-columns / data-rows / data-seed) mit Zahlen. */
export function fillCascades(root: Document | HTMLElement = document) {
  root.querySelectorAll<HTMLElement>(`.${displayClassNames.cascade}[data-columns]`).forEach((el, k) => {
    const { columns, rows = "6", seed } = el.dataset;
    const data = cascadeNumbers(Number(columns), Number(rows), seed ? Number(seed) : 47 + k);
    el.innerHTML = data
      .map((col, c) => `<div class="${displayClassNames.cascadeCol}">${col.map((n, r) => `<span style="--i:${r * 2 + c}">${n}</span>`).join("")}</div>`)
      .join("");
  });
}
