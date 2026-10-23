// packages/romulus/src/shared.ts
export type RomulusColor = 1 | 2 | 3 | 4 | 5 | 6;
export type RomulusLength = "xs" | "s" | "m" | "l" | "xl";
export type RomulusTheme = "warbird" | "tal-shiar" | "free-state";
export type AlertLevel = "red" | "yellow";
export type StatusKind = "ok" | "warn" | "error" | "off";
export type Orientation = "horizontal" | "vertical";

/** Sets data-color only when a color is given (otherwise the CSS default applies). */
export function colorAttribute(color?: RomulusColor) {
  return color ? { "data-color": String(color) } : {};
}
