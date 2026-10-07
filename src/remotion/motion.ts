import {interpolate, spring} from 'remotion';
import type {MotionPreset, TransitionPreset} from '../project/schema';

const clamp = {
  extrapolateLeft: 'clamp' as const,
  extrapolateRight: 'clamp' as const,
};

const smoothstep = (value: number) => {
  const v = Math.max(0, Math.min(1, value));
  return v * v * (3 - 2 * v);
};

export const motionValues = ({
  preset = 'fade-rise',
  amount = 1,
  frame,
  durationInFrames,
  fps,
  width,
  height,
}: {
  preset?: MotionPreset;
  amount?: number;
  frame: number;
  durationInFrames: number;
  fps: number;
  width: number;
  height: number;
}) => {
  const enter = interpolate(frame, [0, Math.max(1, fps * 0.45)], [0, 1], clamp);
  const progress = interpolate(frame, [0, Math.max(1, durationInFrames - 1)], [0, 1], clamp);
  const eased = smoothstep(progress);
  const strength = Math.max(0.25, Math.min(2, amount));
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
      return {
        opacity: enter,
        transform: `translate(${-width * 0.03 * eased * strength} ${-height * 0.02 * eased * strength}) scale(${1.02 + eased * 0.08 * strength})`,
      };
    case 'pan-left':
      return {opacity: enter, transform: `translate(${width * (0.035 - eased * 0.07) * strength} 0)`};
    case 'pan-right':
      return {opacity: enter, transform: `translate(${width * (-0.035 + eased * 0.07) * strength} 0)`};
    case 'pop':
      return {
        opacity: springIn,
        transform: `translate(${width / 2} ${height / 2}) scale(${1 - (1 - springIn) * 0.14 * strength}) translate(${-width / 2} ${-height / 2})`,
      };
    case 'drift-up':
      return {opacity: enter, transform: `translate(0 ${height * (0.035 - eased * 0.06) * strength})`};
    case 'zoom-out':
      return {
        opacity: enter,
        transform: `translate(${width / 2} ${height / 2}) scale(${1 + (1 - eased) * 0.1 * strength}) translate(${-width / 2} ${-height / 2})`,
      };
    case 'cinematic-push':
      return {
        opacity: enter,
        transform: `translate(${-width * 0.014 * eased * strength} ${-height * 0.009 * eased * strength}) scale(${1.012 + eased * 0.058 * strength})`,
      };
    case 'cinematic-pull':
      return {
        opacity: enter,
        transform: `translate(${width / 2} ${height / 2}) scale(${1 + (1 - eased) * 0.085 * strength}) translate(${-width / 2} ${-height / 2})`,
      };
    case 'pan-and-zoom':
      return {
        opacity: enter,
        transform: `translate(${width * (0.022 - eased * 0.044) * strength} ${-height * 0.008 * eased * strength}) scale(${1.015 + eased * 0.05 * strength})`,
      };
    case 'float-horizontal':
      return {
        opacity: enter,
        transform: `translate(${Math.sin(eased * Math.PI * 2) * width * 0.012 * strength} 0)`,
      };
    case 'fade-rise':
    default:
      return {opacity: enter, transform: `translate(0 ${(1 - enter) * height * 0.035 * strength})`};
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
    return {opacity: 1, transform: '', wipe: 1, iris: 1};
  }

  const p = interpolate(frame, [0, durationInFrames], [0, 1], clamp);
  const eased = smoothstep(p);

  switch (preset) {
    case 'fade':
      return {opacity: eased, transform: '', wipe: 1, iris: 1};
    case 'slide-left':
      return {opacity: 1, transform: `translate(${width * (1 - eased)} 0)`, wipe: 1, iris: 1};
    case 'slide-up':
      return {opacity: 1, transform: `translate(0 ${height * (1 - eased)})`, wipe: 1, iris: 1};
    case 'wipe':
      return {opacity: 1, transform: '', wipe: eased, iris: 1};
    case 'zoom':
      return {
        opacity: eased,
        transform: `translate(${width / 2} ${height / 2}) scale(${0.88 + eased * 0.12}) translate(${-width / 2} ${-height / 2})`,
        wipe: 1,
        iris: 1,
      };
    case 'soft-zoom':
      return {
        opacity: eased,
        transform: `translate(${width / 2} ${height / 2}) scale(${0.965 + eased * 0.035}) translate(${-width / 2} ${-height / 2})`,
        wipe: 1,
        iris: 1,
      };
    case 'whip-left':
      return {
        opacity: 0.62 + eased * 0.38,
        transform: `translate(${width * 0.24 * (1 - eased)} 0)`,
        wipe: 1,
        iris: 1,
      };
    case 'iris':
      return {opacity: 1, transform: '', wipe: 1, iris: eased};
    default:
      return {opacity: 1, transform: '', wipe: 1, iris: 1};
  }
};
