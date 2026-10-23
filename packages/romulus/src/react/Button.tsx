import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cx, type LcarsSoundKind } from "@lcars-gui/core";
import { useLcarsSound } from "@lcars-gui/core/react";
import {
  buttonClassName,
  buttonDataAttributes,
  type ButtonProps as CoreButtonProps,
} from "..";

export type ButtonProps = CoreButtonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color"> & {
    /** Sound on click (only inside a SoundProvider); false = silent */
    sound?: LcarsSoundKind | false;
  };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { color, size, length, shape, variant, align, sound = "beep", className, type = "button", onClick, ...rest },
    ref
  ) {
    const play = useLcarsSound();
    return (
      <button
        ref={ref}
        type={type}
        className={cx(buttonClassName, className)}
        {...buttonDataAttributes({ color, size, length, shape, variant, align })}
        onClick={(e) => {
          if (sound) play(sound);
          onClick?.(e);
        }}
        {...rest}
      />
    );
  }
);
