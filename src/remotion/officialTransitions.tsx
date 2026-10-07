import type {ReactNode} from 'react';
import {linearTiming, TransitionSeries} from '@remotion/transitions';
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

export const OfficialTransition = ({
  scene,
  fps,
  width,
  height,
}: {
  scene: VideoScene;
  fps: number;
  width: number;
  height: number;
}) => {
  const durationInFrames = transitionFrames(scene, fps);
  const presentation = transitionPresentation(scene.transition, width, height);
  if (!presentation || durationInFrames <= 0) return null;

  return (
    <TransitionSeries.Transition
      presentation={presentation}
      timing={linearTiming({durationInFrames})}
    />
  );
};

export const TransitionSequence = ({
  durationInFrames,
  children,
}: {
  durationInFrames: number;
  children: ReactNode;
}) => (
  <TransitionSeries.Sequence durationInFrames={durationInFrames}>
    {children}
  </TransitionSeries.Sequence>
);

export {TransitionSeries};
