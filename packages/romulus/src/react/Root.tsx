import type { HTMLAttributes } from "react";
import type { AlertLevel, RomulusTheme } from "..";

export interface RomulusRootProps extends HTMLAttributes<HTMLDivElement> {
  theme?: RomulusTheme;
  /** Färbt alles darunter rot/gelb und lässt Linien pulsieren */
  alert?: AlertLevel | null;
}

/** Setzt Farbthema und Alarmzustand für alle Komponenten darunter. */
export function RomulusRoot({ theme, alert, ...rest }: RomulusRootProps) {
  return <div data-theme={theme} data-alert={alert ?? undefined} {...rest} />;
}
