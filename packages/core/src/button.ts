// packages/core/src/button.ts
export type ButtonColor = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type ButtonSize = "xs" | "s" | "m" | "l" | "xl";
export type ButtonLength = "xs" | "s" | "m" | "l" | "xl";

/**
 * Plattformneutrale Button-Props (ohne Events/Children,
 * die liefert der jeweilige Renderer).
 */
export interface ButtonProps {
  color?: ButtonColor;
  size?: ButtonSize;
  length?: ButtonLength; // ohne Angabe: Breite passt sich dem Inhalt an
  disabled?: boolean;
}

/**
 * Defaultwerte aus Source-of-Truth.
 * (wird in allen Renderern verwendet)
 */
export const defaultButtonProps: Required<Omit<ButtonProps, "length">> = {
  color: 1,
  size: "m",
  disabled: false,
};

/** CSS-Klasse aus @lcars/css */
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
  const { color, size, length } = normalizeButtonProps(props);
  return {
    "data-color": String(color),
    "data-size": size,
    ...(length && { "data-length": length }),
  };
}
