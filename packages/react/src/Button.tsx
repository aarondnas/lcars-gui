import { forwardRef, type ButtonHTMLAttributes } from "react";
import {
  buttonClassName,
  buttonDataAttributes,
  type ButtonProps as CoreButtonProps,
} from "@lcars/core";

export type ButtonProps = CoreButtonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color">;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { color, size, length, className, type = "button", ...rest },
    ref
  ) {
    return (
      <button
        ref={ref}
        type={type}
        className={className ? `${buttonClassName} ${className}` : buttonClassName}
        {...buttonDataAttributes({ color, size, length })}
        {...rest}
      />
    );
  }
);
