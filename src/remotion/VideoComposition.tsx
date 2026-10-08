import {Audio} from '@remotion/media';
import {CameraMotionBlur} from '@remotion/motion-blur';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import type {VideoProject} from '../project/schema';
import {projectFrames, sceneFrames} from '../project/schema';
import {resolveAsset} from '../project/assets';
import {TransitionSeries, type TransitionPresentation} from '@remotion/transitions';
import {SceneFrame} from './SceneFrame';
import {transitionPresentation, transitionTiming} from './officialTransitions';
import {BeatSyncFrame} from './BeatSyncFrame';
import {CaptionOverlay} from './CaptionOverlay';

export type VideoCompositionProps = {
  project: VideoProject;
};

export const VideoComposition = ({project}: VideoCompositionProps) => {
  const {width, height} = useVideoConfig();

  return (
    <AbsoluteFill style={{backgroundColor: project.theme.background}}>
      {project.audio?.music ? (
        <Audio
          src={resolveAsset(project.audio.music.src)}
          volume={project.audio.music.volume}
          loop={project.audio.music.loop}
        />
      ) : null}
      {project.audio?.voiceover ? (
        <Audio
          src={resolveAsset(project.audio.voiceover.src)}
          volume={project.audio.voiceover.volume}
          loop={project.audio.voiceover.loop}
        />
      ) : null}

      <TransitionSeries>
        {project.scenes.flatMap((scene, index) => {
          const durationInFrames = sceneFrames(scene, project.fps);
          const frame = (
            <SceneFrame scene={scene} project={project} transitionInFrames={0} />
          );
          const motionBlurContent = scene.motionBlur ? (
            <CameraMotionBlur
              shutterAngle={scene.motionBlur.shutterAngle}
              samples={scene.motionBlur.samples}
            >
              {frame}
            </CameraMotionBlur>
          ) : frame;
          const sceneContent = scene.beatSync ? (
            <BeatSyncFrame beatSync={scene.beatSync}>
              {motionBlurContent}
            </BeatSyncFrame>
          ) : motionBlurContent;
          const sequence = (
            <TransitionSeries.Sequence
              key={`scene-${scene.id}`}
              durationInFrames={durationInFrames}
              premountFor={Math.min(20, durationInFrames)}
            >
              {sceneContent}
            </TransitionSeries.Sequence>
          );

          if (index === 0) return [sequence];

          const presentation = transitionPresentation(scene.transition, width, height);
          const timing = transitionTiming(scene, project.fps);
          if (!presentation || !timing) return [sequence];

          return [
            <TransitionSeries.Transition
              key={`transition-${scene.id}`}
              presentation={presentation as TransitionPresentation<any>}
              timing={timing}
            />,
            sequence,
          ];
        })}
      </TransitionSeries>
      {project.reelCaptions ? (
        <CaptionOverlay
          project={project}
          safeArea="vertical-reel"
          scene={{
            id: 'global-travel-reel-captions',
            type: 'caption-demo',
            duration: projectFrames(project) / project.fps,
            motionAmount: 1,
            background: 'dark',
            captionStyle: project.reelCaptions.captionStyle,
            captionPosition: 'bottom',
            emphasisWords: project.reelCaptions.emphasisWords,
            combineTokensWithinMilliseconds: project.reelCaptions.combineTokensWithinMilliseconds,
            captions: project.reelCaptions.captions,
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};
