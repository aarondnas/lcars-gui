// packages/romulus/src/behaviors.ts
// Verhalten für reines HTML/JS: verdrahtet Toggles, Tabs, Keypads, Data Cascades
// und Bedien-Töne im Markup, das die React-Komponenten sonst selbst erzeugen.
import { initBehaviors, type InitBehaviorsOptions, type LcarsController } from "@lcars-gui/core";
import { buttonClassName } from "./button";
import { cascadeGlyphs, controlClassNames, displayClassNames } from "./display";
import { romulanSound } from "./sound";

export { pressedChangeEvent, type LcarsController } from "@lcars-gui/core";

export type InitRomulusOptions = InitBehaviorsOptions;

/**
 * Macht statisches romulanisches Markup interaktiv.
 * Der zurückgegebene Controller spielt Töne und entfernt die Listener wieder.
 */
export function initRomulus(options: InitRomulusOptions = {}): LcarsController {
  fillCascades(options.root);
  return initBehaviors(
    {
      control: `.${buttonClassName}, .${controlClassNames.tab}`,
      keypad: `.${controlClassNames.keypad}`,
      keypadKey: `.${buttonClassName}`,
      keypadDisplay: `.${controlClassNames.keypadDisplay}`,
    },
    options,
    romulanSound
  );
}

/** Füllt leere Data Cascades (data-columns / data-rows / data-seed) mit Hex-Gruppen. */
export function fillCascades(root: Document | HTMLElement = document) {
  root.querySelectorAll<HTMLElement>(`.${displayClassNames.cascade}[data-columns]`).forEach((el, k) => {
    const { columns, rows = "6", seed } = el.dataset;
    const data = cascadeGlyphs(Number(columns), Number(rows), seed ? Number(seed) : 1701 + k);
    el.innerHTML = data
      .map((col, c) => `<div class="${displayClassNames.cascadeCol}">${col.map((g, r) => `<span style="--i:${r * 3 + c}">${g}</span>`).join("")}</div>`)
      .join("");
  });
}
