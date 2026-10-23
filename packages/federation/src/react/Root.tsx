import type { HTMLAttributes } from "react";
import type { AlertLevel, LcarsTheme } from "..";

export interface LcarsRootProps extends HTMLAttributes<HTMLDivElement> {
  theme?: LcarsTheme;
  /** Turns everything below red/yellow and makes the bars pulse */
  alert?: AlertLevel | null;
}

/** Sets the color theme and alert state for all components below. */
export function LcarsRoot({ theme, alert, ...rest }: LcarsRootProps) {
  return <div data-theme={theme} data-alert={alert ?? undefined} {...rest} />;
}
