import {Audio} from '@remotion/media';
import {AbsoluteFill, Sequence} from 'remotion';
import type {VideoProject} from '../project/schema';
import {sceneTimeline} from '../project/schema';
import {resolveAsset} from '../project/assets';
import {SceneFrame} from './SceneFrame';

export type VideoCompositionProps = {
  project: VideoProject;
};

export const VideoComposition = ({project}: VideoCompositionProps) => {
  const timeline = sceneTimeline(project);

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

      {timeline.map(({scene, from, durationInFrames, transitionInFrames}) => (
        <Sequence
          key={scene.id}
          from={from}
          durationInFrames={durationInFrames}
          premountFor={Math.min(20, durationInFrames)}
        >
          <SceneFrame
            scene={scene}
            project={project}
            transitionInFrames={transitionInFrames}
          />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
