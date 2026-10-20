// packages/core/src/display.ts
export type LcarsTheme = "tng" | "ds9" | "picard";
export type AlertLevel = "red" | "yellow";
export type StatusKind = "ok" | "warn" | "error" | "off";
export type Orientation = "horizontal" | "vertical";

/** CSS-Klassen aus @lcars/css */
export const displayClassNames = {
  cascade: "lcar-cascade",
  cascadeCol: "lcar-cascade-col",
  readout: "lcar-readout",
  number: "lcar-number",
  divider: "lcar-divider",
  grid: "lcar-grid",
  level: "lcar-level",
  gauge: "lcar-gauge",
  sensor: "lcar-sensor",
  blip: "lcar-blip",
  scan: "lcar-scan",
  status: "lcar-status",
  alert: "lcar-alert",
  alertTitle: "lcar-alert-title",
  alertText: "lcar-alert-text",
} as const;

export const controlClassNames = {
  tabs: "lcar-tabs",
  tablist: "lcar-tablist",
  tab: "lcar-tab",
  tabpanel: "lcar-tabpanel",
  field: "lcar-field",
  fieldLabel: "lcar-field-label",
  input: "lcar-input",
  range: "lcar-range",
  keypad: "lcar-keypad",
  keypadDisplay: "lcar-keypad-display",
} as const;

/**
 * Zufällige, aber reproduzierbare Zahlenspalten für die Data Cascade
 * (gleicher Seed → gleiche Zahlen, wichtig für Server-Rendering).
 */
export function cascadeNumbers(columns: number, rows: number, seed = 47): string[][] {
  let state = seed >>> 0;
  const random = () => {
    // mulberry32
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  return Array.from({ length: columns }, (_, col) => {
    const digits = 2 + ((col * 3) % 5); // unterschiedliche Spaltenbreiten
    return Array.from({ length: rows }, () =>
      String(Math.floor(random() * 10 ** digits)).padStart(digits, "0")
    );
  });
}

/** Welche Segmente einer Pegelanzeige leuchten. */
export function levelSegments(value: number, segments = 10, max = 100): boolean[] {
  const lit = Math.round((Math.min(Math.max(value, 0), max) / max) * segments);
  return Array.from({ length: segments }, (_, i) => i < lit);
}

/** Wert auf 0–100 % umrechnen (für die Gauge). */
export function toPercent(value: number, max = 100) {
  return Math.min(Math.max((value / max) * 100, 0), 100);
}
