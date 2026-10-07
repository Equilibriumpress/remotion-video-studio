export const quantizeFrame = (
  frame: number,
  compositionFps: number,
  targetFps?: number,
) => {
  if (!targetFps || targetFps >= compositionFps) return frame;
  const safeTarget = Math.max(1, targetFps);
  return Math.floor((frame * safeTarget) / compositionFps) * compositionFps / safeTarget;
};

export const beatPulse = ({
  frame,
  fps,
  beats,
  strength,
  decaySeconds,
}: {
  frame: number;
  fps: number;
  beats: readonly number[];
  strength: number;
  decaySeconds: number;
}) => {
  if (beats.length === 0 || strength <= 0) return 1;

  const time = frame / fps;
  let nearest = Number.NEGATIVE_INFINITY;
  for (const beat of beats) {
    if (beat <= time && beat > nearest) nearest = beat;
  }

  if (!Number.isFinite(nearest)) return 1;
  const elapsed = time - nearest;
  if (elapsed < 0 || elapsed > decaySeconds) return 1;

  const normalized = 1 - elapsed / Math.max(0.001, decaySeconds);
  return 1 + strength * normalized * normalized;
};
