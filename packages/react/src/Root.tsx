import type { HTMLAttributes } from "react";
import type { AlertLevel, LcarsTheme } from "@lcars/core";

export interface LcarsRootProps extends HTMLAttributes<HTMLDivElement> {
  theme?: LcarsTheme;
  /** Färbt alles darunter rot/gelb und lässt Balken pulsieren */
  alert?: AlertLevel | null;
}

/** Setzt Farbthema und Alarmzustand für alle Komponenten darunter. */
export function LcarsRoot({ theme, alert, ...rest }: LcarsRootProps) {
  return <div data-theme={theme} data-alert={alert ?? undefined} {...rest} />;
}
