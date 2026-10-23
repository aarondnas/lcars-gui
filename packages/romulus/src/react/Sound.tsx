import {
  SoundProvider as CoreSoundProvider,
  type SoundProviderProps,
} from "@lcars-gui/core/react";
import { romulanSound } from "..";

export { useLcarsSound, type SoundProviderProps } from "@lcars-gui/core/react";

/** Enables interface sounds (Romulan patterns) for all components below. */
export function SoundProvider(props: SoundProviderProps) {
  return <CoreSoundProvider {...romulanSound} {...props} />;
}
