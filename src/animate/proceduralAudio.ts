/** Offline procedural score: same project settings always produce the same PCM WAV.
 * Uses no AudioContext and no network, so preview and MP4 share one source.
 */
export type ProceduralScore = {
  bpm: number;
  root: number;
  volume: number;
  waveform: 'sine' | 'soft' | 'pluck';
  seed: number;
};
const sampleRate = 22050;
const TAU = Math.PI * 2;
const clamp = (x: number) => Math.max(-1, Math.min(1, x));
const hash = (n: number, seed: number) => {
  const s = Math.sin(n * 79.91 + seed * 13.15) * 43758.5453;
  return s - Math.floor(s);
};
const osc = (phase: number, waveform: ProceduralScore['waveform']) => {
  if (waveform === 'sine') return Math.sin(phase);
  if (waveform === 'soft') return Math.sin(phase) * .8 + Math.sin(phase * 2) * .12;
  return Math.sin(phase) * .75 + Math.sin(phase * 3) * .13;
};

export function makeProceduralWav(durationSeconds: number, score: ProceduralScore): string {
  const duration = Math.max(.1, Math.min(90, durationSeconds));
  const samples = Math.ceil(duration * sampleRate);
  const bytes = new Uint8Array(44 + samples * 2);
  const view = new DataView(bytes.buffer);
  const put = (offset: number, value: string) => {
    for (let i = 0; i < value.length; i++) bytes[offset + i] = value.charCodeAt(i);
  };
  put(0, 'RIFF'); view.setUint32(4, bytes.length - 8, true);
  put(8, 'WAVE'); put(12, 'fmt ');
  view.setUint32(16, 16, true); view.setUint16(20, 1, true);
  view.setUint16(22, 1, true); view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); view.setUint16(32, 2, true);
  view.setUint16(34, 16, true); put(36, 'data');
  view.setUint32(40, samples * 2, true);

  const beatSeconds = 60 / score.bpm;
  const notes = [0, 7, 12, 4, 9, 7, 2, 4];
  const fade = .04;
  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    const beat = Math.floor(t / beatSeconds);
    const local = t % beatSeconds;
    const pitch = notes[beat % notes.length] + (hash(beat, score.seed) > .85 ? 12 : 0);
    const frequency = score.root * Math.pow(2, pitch / 12);
    const envelope = Math.exp(-local * (score.waveform === 'pluck' ? 8 : 3));
    const fundamental = osc(TAU * frequency * t, score.waveform) * envelope;
    const low = Math.sin(TAU * score.root * .5 * t) * .08;
    const fadeIn = Math.min(1, t / fade);
    const fadeOut = Math.min(1, (duration - t) / .15);
    const sample = clamp((fundamental * .40 + low) * score.volume * fadeIn * Math.max(0, fadeOut));
    view.setInt16(44 + i * 2, Math.round(sample * 32767), true);
  }

  // Incremental base64 encoding avoids a stack overflow with large typed arrays.
  let binary = '';
  for (let start = 0; start < bytes.length; start += 8192) {
    binary += String.fromCharCode(...bytes.subarray(start, start + 8192));
  }
  return 'data:audio/wav;base64,' + btoa(binary);
}
