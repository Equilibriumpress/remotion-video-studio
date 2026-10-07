import {linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {iris} from '@remotion/transitions/iris';
import {pushCut} from '@remotion/transitions/push-cut';
import {slide} from '@remotion/transitions/slide';
import {wipe} from '@remotion/transitions/wipe';
import type {TransitionPreset, VideoScene} from '../project/schema';
import {transitionFrames} from '../project/schema';

export const transitionPresentation = (
  preset: TransitionPreset | undefined,
  width: number,
  height: number,
) => {
  switch (preset) {
    case 'fade':
      return fade({shouldFadeOutExitingScene: true});
    case 'slide-left':
      return slide({direction: 'from-right'});
    case 'slide-up':
      return slide({direction: 'from-bottom'});
    case 'wipe':
      return wipe({direction: 'from-left'});
    case 'iris':
      return iris({width, height});
    case 'map-reveal':
      return wipe({direction: 'from-left'});
    case 'photo-mask-reveal':
      return iris({width, height});
    case 'split-grid':
      return pushCut({
        cutProgress: 0.5,
        outgoingScale: 1.025,
        incomingStartScale: 1.075,
        incomingEndScale: 1,
        flashOpacity: 0,
      });
    case 'zoom':
      return pushCut({
        outgoingScale: 1.06,
        incomingStartScale: 0.94,
        incomingEndScale: 1,
        flashOpacity: 0.06,
      });
    case 'soft-zoom':
      return pushCut({
        cutProgress: 0.55,
        outgoingScale: 1.025,
        incomingStartScale: 0.985,
        incomingEndScale: 1.015,
        flashOpacity: 0,
      });
    case 'whip-left':
      return slide({direction: 'from-right'});
    case 'cut':
    default:
      return null;
  }
};

export const transitionTiming = (scene: VideoScene, fps: number) => {
  const durationInFrames = transitionFrames(scene, fps);
  return durationInFrames > 0
    ? linearTiming({durationInFrames})
    : null;
};
