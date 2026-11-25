export const MIN_BPM = 30;
export const MAX_BPM = 250;
export const MAX_BEATS = 12;

export const clampBpm = (n) => Math.min(MAX_BPM, Math.max(MIN_BPM, Math.round(Number(n)) || 120));
export const clampBeats = (n) => Math.min(MAX_BEATS, Math.max(1, Math.round(Number(n)) || 4));

export function parseParams(search) {
  const p = new URLSearchParams(search);
  return { bpm: clampBpm(p.get('bpm')), beats: clampBeats(p.get('beats')) };
}

// The light sweeps one way per beat, so it reaches a side exactly on each click.
export const scannerPosition = (count, phase) => (count % 2 === 0 ? phase : 1 - phase);

// taps: timestamps in ms, oldest first.
export function tapTempo(taps) {
  if (taps.length < 2) return null;
  const average = (taps.at(-1) - taps[0]) / (taps.length - 1);
  return clampBpm(60000 / average);
}
