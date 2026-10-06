import {AbsoluteFill, Sequence} from 'remotion';
import type {VideoProject} from '../project/schema';
import {sceneFrames} from '../project/schema';
import {SceneFrame} from './SceneFrame';

export type VideoCompositionProps = {
  project: VideoProject;
};

export const VideoComposition = ({project}: VideoCompositionProps) => {
  let from = 0;

  return (
    <AbsoluteFill style={{backgroundColor: project.theme.background}}>
      {project.scenes.map((scene) => {
        const durationInFrames = sceneFrames(scene, project.fps);
        const start = from;
        from += durationInFrames;

        return (
          <Sequence key={scene.id} from={start} durationInFrames={durationInFrames} premountFor={Math.min(15, durationInFrames)}>
            <SceneFrame scene={scene} project={project} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
