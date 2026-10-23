// packages/federation/src/button.ts
import type { LcarsColor, LcarsLength } from "./shared";

export type ButtonColor = LcarsColor;
export type ButtonSize = "xs" | "s" | "m" | "l" | "xl";
export type ButtonLength = LcarsLength;
export type ButtonShape = "capsule" | "rect" | "cap-left" | "cap-right";
export type ButtonAlign = "center" | "bottom-right";

/**
 * Plattformneutrale Button-Props (ohne Events/Children,
 * die liefert der jeweilige Renderer).
 */
export interface ButtonProps {
  color?: ButtonColor;
  size?: ButtonSize;
  length?: ButtonLength; // ohne Angabe: Breite passt sich dem Inhalt an
  shape?: ButtonShape;
  align?: ButtonAlign;
  disabled?: boolean;
}

/**
 * Defaultwerte aus Source-of-Truth.
 * (wird in allen Renderern verwendet)
 */
export const defaultButtonProps: Required<Omit<ButtonProps, "length">> = {
  color: 1,
  size: "m",
  shape: "capsule",
  align: "center",
  disabled: false,
};

/** CSS-Klasse aus ui.css */
export const buttonClassName = "lcar-btn-std";

/**
 * Utility-Funktion, die Props mergen & normalisieren kann,
 * bevor die Renderer sie weiterverwenden.
 */
export function normalizeButtonProps<T extends ButtonProps>(props: T) {
  return {
    ...defaultButtonProps,
    ...props,
  };
}

/**
 * Liefert die data-Attribute, auf die das CSS reagiert.
 */
export function buttonDataAttributes(props: ButtonProps) {
  const { color, size, length, shape, align } = normalizeButtonProps(props);
  return {
    "data-color": String(color),
    "data-size": size,
    ...(length && { "data-length": length }),
    ...(shape !== "capsule" && { "data-shape": shape }),
    ...(align === "bottom-right" && { "data-align": "br" }),
  };
}
