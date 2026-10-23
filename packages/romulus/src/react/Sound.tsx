import {
  SoundProvider as CoreSoundProvider,
  type SoundProviderProps,
} from "@lcars-gui/core/react";
import { romulanSound } from "..";

export { useLcarsSound, type SoundProviderProps } from "@lcars-gui/core/react";

/** Aktiviert die Bedien-Töne (romulanische Tonfolgen) für alle Komponenten darunter. */
export function SoundProvider(props: SoundProviderProps) {
  return <CoreSoundProvider {...romulanSound} {...props} />;
}
