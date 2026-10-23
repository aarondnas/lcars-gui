// packages/core/src/random.ts

/**
 * Random numbers 0–1, but reproducible (mulberry32):
 * same seed → same sequence, important for server rendering.
 */
export function seededRandom(seed = 47) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
