// packages/romulus/src/button.ts
import { colorAttribute, type RomulusColor, type RomulusLength } from "./shared";

export type ButtonSize = "xs" | "s" | "m" | "l" | "xl";
export type ButtonShape = "chamfer" | "rect" | "point-left" | "point-right";
export type ButtonVariant = "outline" | "solid";
export type ButtonAlign = "center" | "start";

/**
 * Platform-neutral button props (without events/children,
 * those come from the respective renderer).
 */
export interface ButtonProps {
  color?: RomulusColor;
  size?: ButtonSize;
  length?: RomulusLength; // if omitted: width fits the content
  shape?: ButtonShape;
  variant?: ButtonVariant;
  align?: ButtonAlign;
  disabled?: boolean;
}

/** CSS class from ui.css */
export const buttonClassName = "rom-btn";

/**
 * Returns the data attributes the CSS reacts to.
 */
export function buttonDataAttributes({ color, size = "m", length, shape = "chamfer", variant = "outline", align = "center" }: ButtonProps) {
  return {
    ...colorAttribute(color),
    "data-size": size,
    ...(length && { "data-length": length }),
    ...(shape !== "chamfer" && { "data-shape": shape }),
    ...(variant !== "outline" && { "data-variant": variant }),
    ...(align !== "center" && { "data-align": align }),
  };
}
