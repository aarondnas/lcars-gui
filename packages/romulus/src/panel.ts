// packages/romulus/src/panel.ts
import { colorAttribute, type RomulusColor, type RomulusLength } from "./shared";

export type BarCap = "left" | "right" | "both";

export interface BarProps {
  color?: RomulusColor;
  cap?: BarCap;
  length?: RomulusLength; // ohne Angabe: füllt den verfügbaren Platz
  segmented?: boolean;
}

export interface BlockProps {
  color?: RomulusColor;
  fill?: boolean; // wächst in einem Stack auf die Resthöhe
}

/** CSS-Klassen aus ui.css */
export const panelClassNames = {
  panel: "rom-panel",
  header: "rom-panel-header",
  code: "rom-panel-code",
  sidebar: "rom-panel-sidebar",
  content: "rom-panel-content",
  footer: "rom-panel-footer",
  bar: "rom-bar",
  block: "rom-block",
  title: "rom-title",
  stack: "rom-stack",
} as const;

export function barDataAttributes({ color, cap, length, segmented }: BarProps) {
  return {
    ...colorAttribute(color),
    ...(cap && { "data-cap": cap }),
    ...(length && { "data-length": length }),
    ...(segmented && { "data-segmented": "" }),
  };
}

export function blockDataAttributes({ color, fill }: BlockProps) {
  return {
    ...colorAttribute(color),
    ...(fill && { "data-fill": "" }),
  };
}
