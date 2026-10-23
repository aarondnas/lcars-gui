// packages/romulus/src/behaviors.ts
// Behavior for plain HTML/JS: wires up toggles, tabs, keypads, data cascades
// and interface sounds in markup that the React components would otherwise render.
import { initBehaviors, type InitBehaviorsOptions, type LcarsController } from "@lcars-gui/core";
import { buttonClassName } from "./button";
import { cascadeGlyphs, controlClassNames, displayClassNames } from "./display";
import { romulanSound } from "./sound";

export { pressedChangeEvent, type LcarsController } from "@lcars-gui/core";

export type InitRomulusOptions = InitBehaviorsOptions;

/**
 * Makes static Romulan markup interactive.
 * The returned controller plays sounds and removes the listeners again.
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

/** Fills empty data cascades (data-columns / data-rows / data-seed) with hex groups. */
export function fillCascades(root: Document | HTMLElement = document) {
  root.querySelectorAll<HTMLElement>(`.${displayClassNames.cascade}[data-columns]`).forEach((el, k) => {
    const { columns, rows = "6", seed } = el.dataset;
    const data = cascadeGlyphs(Number(columns), Number(rows), seed ? Number(seed) : 1701 + k);
    el.innerHTML = data
      .map((col, c) => `<div class="${displayClassNames.cascadeCol}">${col.map((g, r) => `<span style="--i:${r * 3 + c}">${g}</span>`).join("")}</div>`)
      .join("");
  });
}
