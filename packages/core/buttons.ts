// packages/core/button.ts
export interface ButtonProps {
  label: string;
  variant?: "color1" | "color2" | "color7";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  onPress?: () => void; // plattformneutrales Event
}

/**
 * Defaultwerte aus Source-of-Truth.
 * (wird in allen Renderern verwendet)
 */
export const defaultButtonProps: Required<
  Omit<ButtonProps, "onPress" | "label">
> = {
  variant: "color1",
  size: "md",
  disabled: false,
};

/**
 * Utility-Funktion, die Props mergen & normalisieren kann,
 * bevor die Renderer sie weiterverwenden.
 */
export function normalizeButtonProps(props: ButtonProps) {
  return {
    ...defaultButtonProps,
    ...props,
  };
}
