// packages/romulus/src/display.ts
import { seededRandom } from "@lcars-gui/core";

/** CSS classes from ui.css */
export const displayClassNames = {
  cascade: "rom-cascade",
  cascadeCol: "rom-cascade-col",
  readout: "rom-readout",
  number: "rom-number",
  divider: "rom-divider",
  grid: "rom-grid",
  level: "rom-level",
  gauge: "rom-gauge",
  sensor: "rom-sensor",
  blip: "rom-blip",
  scan: "rom-scan",
  status: "rom-status",
  alert: "rom-alert",
  alertTitle: "rom-alert-title",
  alertText: "rom-alert-text",
} as const;

export const controlClassNames = {
  tabs: "rom-tabs",
  tablist: "rom-tablist",
  tab: "rom-tab",
  tabpanel: "rom-tabpanel",
  field: "rom-field",
  fieldLabel: "rom-field-label",
  input: "rom-input",
  range: "rom-range",
  keypad: "rom-keypad",
  keypadDisplay: "rom-keypad-display",
} as const;

/**
 * Columns of hex groups like "3F·A9", random but reproducible
 * (same seed → same values, important for server rendering).
 */
export function cascadeGlyphs(columns: number, rows: number, seed = 1701): string[][] {
  const random = seededRandom(seed);
  const hex = () => Math.floor(random() * 256).toString(16).toUpperCase().padStart(2, "0");

  return Array.from({ length: columns }, (_, col) => {
    const groups = 1 + (col % 3); // varying column widths
    return Array.from({ length: rows }, () => Array.from({ length: groups }, hex).join("·"));
  });
}

/** Which segments of a level bar are lit. */
export function levelSegments(value: number, segments = 12, max = 100): boolean[] {
  const lit = Math.round((Math.min(Math.max(value, 0), max) / max) * segments);
  return Array.from({ length: segments }, (_, i) => i < lit);
}

/** Converts a value to 0–100 % (for the gauge). */
export function toPercent(value: number, max = 100) {
  return Math.min(Math.max((value / max) * 100, 0), 100);
}
