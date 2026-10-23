import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import {
  createLcarsSound,
  type LcarsSound,
  type LcarsSoundKind,
  type LcarsSoundPatterns,
} from "../sound";

const SoundContext = createContext<LcarsSound | null>(null);

export interface SoundProviderProps {
  enabled?: boolean;
  volume?: number;
  /** Custom sound patterns (e.g. a faction's) */
  patterns?: LcarsSoundPatterns;
  wave?: OscillatorType;
  children?: ReactNode;
}

/** Enables interface sounds for all components below. */
export function SoundProvider({ enabled = true, volume, patterns, wave, children }: SoundProviderProps) {
  const sound = useMemo(() => createLcarsSound(volume, { patterns, wave }), [volume, patterns, wave]);
  return (
    <SoundContext.Provider value={enabled ? sound : null}>
      {children}
    </SoundContext.Provider>
  );
}

/** Returns play(kind); without a SoundProvider (or when disabled) nothing happens. */
export function useLcarsSound() {
  const sound = useContext(SoundContext);
  return useCallback((kind?: LcarsSoundKind) => sound?.play(kind), [sound]);
}
