import {Audio} from '@remotion/media';
import {CameraMotionBlur} from '@remotion/motion-blur';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import type {VideoProject} from '../project/schema';
import {sceneFrames} from '../project/schema';
import {resolveAsset} from '../project/assets';
import {TransitionSeries} from '@remotion/transitions';
import {SceneFrame} from './SceneFrame';
import {transitionPresentation, transitionTiming} from './officialTransitions';

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
          const sceneContent = scene.motionBlur ? (
            <CameraMotionBlur
              shutterAngle={scene.motionBlur.shutterAngle}
              samples={scene.motionBlur.samples}
            >
              {frame}
            </CameraMotionBlur>
          ) : frame;
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
              presentation={presentation}
              timing={timing}
            />,
            sequence,
          ];
        })}
      </TransitionSeries>
    </AbsoluteFill>
  );
};
