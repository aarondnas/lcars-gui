// packages/federation/src/shared.ts
export type LcarsColor = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type LcarsLength = "xs" | "s" | "m" | "l" | "xl";

/** Sets data-color only when a color is given (otherwise the CSS default applies). */
export function colorAttribute(color?: LcarsColor) {
  return color ? { "data-color": String(color) } : {};
}
