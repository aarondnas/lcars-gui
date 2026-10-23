// packages/federation/src/behaviors.ts
// Behavior for plain HTML/JS: wires up toggles, tabs, keypads, data cascades
// and interface sounds in markup that the React components would otherwise render.
import { initBehaviors, type InitBehaviorsOptions, type LcarsController } from "@lcars-gui/core";
import { buttonClassName } from "./button";
import { cascadeNumbers, controlClassNames, displayClassNames } from "./display";

export { pressedChangeEvent, type LcarsController } from "@lcars-gui/core";

export type InitLcarsOptions = InitBehaviorsOptions;

/**
 * Makes static LCARS markup interactive.
 * The returned controller plays sounds and removes the listeners again.
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

/** Fills empty data cascades (data-columns / data-rows / data-seed) with numbers. */
export function fillCascades(root: Document | HTMLElement = document) {
  root.querySelectorAll<HTMLElement>(`.${displayClassNames.cascade}[data-columns]`).forEach((el, k) => {
    const { columns, rows = "6", seed } = el.dataset;
    const data = cascadeNumbers(Number(columns), Number(rows), seed ? Number(seed) : 47 + k);
    el.innerHTML = data
      .map((col, c) => `<div class="${displayClassNames.cascadeCol}">${col.map((n, r) => `<span style="--i:${r * 2 + c}">${n}</span>`).join("")}</div>`)
      .join("");
  });
}
