// packages/core/src/sound.ts
// Synthetisierte Töne über die Web Audio API – keine Audiodateien,
// damit keine urheberrechtlich geschützten Original-Sounds nötig sind.
// Nur im Browser verfügbar; ohne AudioContext passiert einfach nichts.

export type LcarsSoundKind = "beep" | "confirm" | "deny" | "alert";

/** [Frequenz in Hz, Dauer in ms] je Ton einer Folge */
export type LcarsSoundPatterns = Record<LcarsSoundKind, [number, number][]>;

export interface LcarsSoundOptions {
  /** Tonfolgen je Art (Standard: Föderations-Töne) */
  patterns?: LcarsSoundPatterns;
  /** Wellenform des Oszillators (Standard: "sine") */
  wave?: OscillatorType;
}

const defaultPatterns: LcarsSoundPatterns = {
  beep: [[1320, 70]],
  confirm: [[880, 70], [1320, 110]],
  deny: [[440, 110], [330, 180]],
  alert: [[620, 220], [880, 220], [620, 220], [880, 220]],
};

export interface LcarsSound {
  play(kind?: LcarsSoundKind): void;
}

export function createLcarsSound(volume = 0.12, { patterns = defaultPatterns, wave = "sine" }: LcarsSoundOptions = {}): LcarsSound {
  let ctx: AudioContext | undefined;

  return {
    play(kind = "beep") {
      if (typeof AudioContext === "undefined") return;
      ctx ??= new AudioContext();

      let t = ctx.currentTime;
      for (const [freq, ms] of patterns[kind]) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const end = t + ms / 1000;

        osc.type = wave;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(volume, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, end);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t);
        osc.stop(end);

        t = end + 0.02;
      }
    },
  };
}
