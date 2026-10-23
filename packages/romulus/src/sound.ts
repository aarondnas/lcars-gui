// packages/romulus/src/sound.ts
import type { LcarsSoundOptions } from "@lcars-gui/core";

/** Romulan interface sounds: lower pitch, triangle wave, descending patterns. */
export const romulanSound: LcarsSoundOptions = {
  wave: "triangle",
  patterns: {
    beep: [[523, 55]],
    confirm: [[392, 60], [523, 60], [784, 100]],
    deny: [[311, 140], [233, 220]],
    alert: [[466, 180], [349, 180], [466, 180], [349, 180]],
  },
};
