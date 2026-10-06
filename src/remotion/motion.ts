import {interpolate, spring} from 'remotion';
import type {MotionPreset, TransitionPreset} from '../project/schema';

const clamp = {
  extrapolateLeft: 'clamp' as const,
  extrapolateRight: 'clamp' as const,
};

export const motionValues = ({
  preset = 'fade-rise',
  frame,
  durationInFrames,
  fps,
  width,
  height,
}: {
  preset?: MotionPreset;
  frame: number;
  durationInFrames: number;
  fps: number;
  width: number;
  height: number;
}) => {
  const enter = interpolate(frame, [0, Math.max(1, fps * 0.45)], [0, 1], clamp);
  const progress = interpolate(frame, [0, Math.max(1, durationInFrames - 1)], [0, 1], clamp);
  const springIn = spring({
    frame,
    fps,
    config: {damping: 16, mass: 0.8, stiffness: 120},
    durationInFrames: Math.max(12, Math.round(fps * 0.7)),
  });

  switch (preset) {
    case 'none':
      return {opacity: 1, transform: ''};
    case 'slow-push':
      return {opacity: enter, transform: `translate(${-width * 0.03 * progress} ${-height * 0.02 * progress}) scale(${1.02 + progress * 0.08})`};
    case 'pan-left':
      return {opacity: enter, transform: `translate(${width * (0.035 - progress * 0.07)} 0)`};
    case 'pan-right':
      return {opacity: enter, transform: `translate(${width * (-0.035 + progress * 0.07)} 0)`};
    case 'pop':
      return {opacity: springIn, transform: `translate(${width / 2} ${height / 2}) scale(${0.86 + springIn * 0.14}) translate(${-width / 2} ${-height / 2})`};
    case 'drift-up':
      return {opacity: enter, transform: `translate(0 ${height * (0.035 - progress * 0.06)})`};
    case 'zoom-out':
      return {opacity: enter, transform: `translate(${width / 2} ${height / 2}) scale(${1.1 - progress * 0.1}) translate(${-width / 2} ${-height / 2})`};
    case 'fade-rise':
    default:
      return {opacity: enter, transform: `translate(0 ${(1 - enter) * height * 0.035})`};
  }
};

export const transitionValues = ({
  preset = 'cut',
  frame,
  durationInFrames,
  width,
  height,
}: {
  preset?: TransitionPreset;
  frame: number;
  durationInFrames: number;
  width: number;
  height: number;
}) => {
  if (preset === 'cut' || durationInFrames <= 0) {
    return {opacity: 1, transform: '', wipe: 1};
  }

  const p = interpolate(frame, [0, durationInFrames], [0, 1], clamp);

  switch (preset) {
    case 'fade':
      return {opacity: p, transform: '', wipe: 1};
    case 'slide-left':
      return {opacity: 1, transform: `translate(${width * (1 - p)} 0)`, wipe: 1};
    case 'slide-up':
      return {opacity: 1, transform: `translate(0 ${height * (1 - p)})`, wipe: 1};
    case 'wipe':
      return {opacity: 1, transform: '', wipe: p};
    case 'zoom':
      return {
        opacity: p,
        transform: `translate(${width / 2} ${height / 2}) scale(${0.88 + p * 0.12}) translate(${-width / 2} ${-height / 2})`,
        wipe: 1,
      };
    default:
      return {opacity: 1, transform: '', wipe: 1};
  }
};
