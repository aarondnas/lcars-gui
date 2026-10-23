// packages/federation/src/button.ts
import type { LcarsColor, LcarsLength } from "./shared";

export type ButtonColor = LcarsColor;
export type ButtonSize = "xs" | "s" | "m" | "l" | "xl";
export type ButtonLength = LcarsLength;
export type ButtonShape = "capsule" | "rect" | "cap-left" | "cap-right";
export type ButtonAlign = "center" | "bottom-right";

/**
 * Platform-neutral button props (without events/children,
 * those come from the respective renderer).
 */
export interface ButtonProps {
  color?: ButtonColor;
  size?: ButtonSize;
  length?: ButtonLength; // if omitted: width fits the content
  shape?: ButtonShape;
  align?: ButtonAlign;
  disabled?: boolean;
}

/**
 * Default values, the single source of truth
 * (used by all renderers).
 */
export const defaultButtonProps: Required<Omit<ButtonProps, "length">> = {
  color: 1,
  size: "m",
  shape: "capsule",
  align: "center",
  disabled: false,
};

/** CSS class from ui.css */
export const buttonClassName = "lcar-btn-std";

/**
 * Merges and normalizes props
 * before the renderers use them.
 */
export function normalizeButtonProps<T extends ButtonProps>(props: T) {
  return {
    ...defaultButtonProps,
    ...props,
  };
}

/**
 * Returns the data attributes the CSS reacts to.
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
