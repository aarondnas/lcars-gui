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
  /** Eigene Tonfolgen (z. B. die einer Fraktion) */
  patterns?: LcarsSoundPatterns;
  wave?: OscillatorType;
  children?: ReactNode;
}

/** Aktiviert die Bedien-Töne für alle Komponenten darunter. */
export function SoundProvider({ enabled = true, volume, patterns, wave, children }: SoundProviderProps) {
  const sound = useMemo(() => createLcarsSound(volume, { patterns, wave }), [volume, patterns, wave]);
  return (
    <SoundContext.Provider value={enabled ? sound : null}>
      {children}
    </SoundContext.Provider>
  );
}

/** Liefert play(kind); ohne SoundProvider (oder deaktiviert) passiert nichts. */
export function useLcarsSound() {
  const sound = useContext(SoundContext);
  return useCallback((kind?: LcarsSoundKind) => sound?.play(kind), [sound]);
}
