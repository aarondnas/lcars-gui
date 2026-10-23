// packages/federation/src/frame.ts
import { colorAttribute, type LcarsColor, type LcarsLength } from "./shared";

export type ElbowCorner = "tl" | "tr" | "bl" | "br";
export type BarCap = "left" | "right" | "both";

export interface ElbowProps {
  corner?: ElbowCorner;
  color?: LcarsColor;
}

export interface BarProps {
  color?: LcarsColor;
  cap?: BarCap;
  length?: LcarsLength; // if omitted: fills the available space
}

export interface BlockProps {
  color?: LcarsColor;
  fill?: boolean; // grows to the remaining height inside a stack
}

/** CSS classes from ui.css */
export const frameClassNames = {
  elbow: "lcar-elbow",
  bar: "lcar-bar",
  block: "lcar-block",
  title: "lcar-title",
  stack: "lcar-stack",
  frame: "lcar-frame",
  frameTop: "lcar-frame-top",
  frameBottom: "lcar-frame-bottom",
  frameContent: "lcar-frame-content",
  frameHeader: "lcar-frame-header",
} as const;

export function elbowDataAttributes({ corner = "tl", color }: ElbowProps) {
  return { "data-corner": corner, ...colorAttribute(color) };
}

export function barDataAttributes({ color, cap, length }: BarProps) {
  return {
    ...colorAttribute(color),
    ...(cap && { "data-cap": cap }),
    ...(length && { "data-length": length }),
  };
}

export function blockDataAttributes({ color, fill }: BlockProps) {
  return {
    ...colorAttribute(color),
    ...(fill && { "data-fill": "" }),
  };
}
