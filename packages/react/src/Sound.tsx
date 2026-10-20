import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { createLcarsSound, type LcarsSound, type LcarsSoundKind } from "@lcars/core";

const SoundContext = createContext<LcarsSound | null>(null);

export interface SoundProviderProps {
  enabled?: boolean;
  volume?: number;
  children?: ReactNode;
}

/** Aktiviert die Bedien-Töne für alle LCARS-Komponenten darunter. */
export function SoundProvider({ enabled = true, volume, children }: SoundProviderProps) {
  const sound = useMemo(() => createLcarsSound(volume), [volume]);
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
