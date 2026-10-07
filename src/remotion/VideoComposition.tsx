import {Audio} from '@remotion/media';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import type {VideoProject} from '../project/schema';
import {sceneFrames} from '../project/schema';
import {resolveAsset} from '../project/assets';
import {SceneFrame} from './SceneFrame';
import {OfficialTransition, TransitionSequence, TransitionSeries} from './officialTransitions';

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
          const sequence = (
            <TransitionSequence key={`scene-${scene.id}`} durationInFrames={durationInFrames}>
              <SceneFrame scene={scene} project={project} transitionInFrames={0} />
            </TransitionSequence>
          );
          if (index === 0) return [sequence];

          return [
            <OfficialTransition
              key={`transition-${scene.id}`}
              scene={scene}
              fps={project.fps}
              width={width}
              height={height}
            />,
            sequence,
          ];
        })}
      </TransitionSeries>
    </AbsoluteFill>
  );
};
