// packages/core/src/shared.ts
export type LcarsColor = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type LcarsLength = "xs" | "s" | "m" | "l" | "xl";

/** data-color nur setzen, wenn eine Farbe angegeben ist (sonst CSS-Default). */
export function colorAttribute(color?: LcarsColor) {
  return color ? { "data-color": String(color) } : {};
}
