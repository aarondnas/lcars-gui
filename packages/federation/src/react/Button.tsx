import { forwardRef, type ButtonHTMLAttributes } from "react";
import {
  buttonClassName,
  buttonDataAttributes,
  type ButtonProps as CoreButtonProps,
  type LcarsSoundKind,
} from "..";
import { cx } from "@lcars-gui/core";
import { useLcarsSound } from "@lcars-gui/core/react";

export type ButtonProps = CoreButtonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color"> & {
    /** Ton beim Klicken (nur innerhalb eines SoundProvider); false = stumm */
    sound?: LcarsSoundKind | false;
  };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { color, size, length, shape, align, sound = "beep", className, type = "button", onClick, ...rest },
    ref
  ) {
    const play = useLcarsSound();
    return (
      <button
        ref={ref}
        type={type}
        className={cx(buttonClassName, className)}
        {...buttonDataAttributes({ color, size, length, shape, align })}
        onClick={(e) => {
          if (sound) play(sound);
          onClick?.(e);
        }}
        {...rest}
      />
    );
  }
);
