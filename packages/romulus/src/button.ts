// packages/romulus/src/button.ts
import { colorAttribute, type RomulusColor, type RomulusLength } from "./shared";

export type ButtonSize = "xs" | "s" | "m" | "l" | "xl";
export type ButtonShape = "chamfer" | "rect" | "point-left" | "point-right";
export type ButtonVariant = "outline" | "solid";
export type ButtonAlign = "center" | "start";

/**
 * Plattformneutrale Button-Props (ohne Events/Children,
 * die liefert der jeweilige Renderer).
 */
export interface ButtonProps {
  color?: RomulusColor;
  size?: ButtonSize;
  length?: RomulusLength; // ohne Angabe: Breite passt sich dem Inhalt an
  shape?: ButtonShape;
  variant?: ButtonVariant;
  align?: ButtonAlign;
  disabled?: boolean;
}

/** CSS-Klasse aus ui.css */
export const buttonClassName = "rom-btn";

/**
 * Liefert die data-Attribute, auf die das CSS reagiert.
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
