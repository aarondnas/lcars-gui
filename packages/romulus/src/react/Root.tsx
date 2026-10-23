import type { HTMLAttributes } from "react";
import type { AlertLevel, RomulusTheme } from "..";

export interface RomulusRootProps extends HTMLAttributes<HTMLDivElement> {
  theme?: RomulusTheme;
  /** Turns everything below red/yellow and makes the lines pulse */
  alert?: AlertLevel | null;
}

/** Sets the color theme and alert state for all components below. */
export function RomulusRoot({ theme, alert, ...rest }: RomulusRootProps) {
  return <div data-theme={theme} data-alert={alert ?? undefined} {...rest} />;
}
