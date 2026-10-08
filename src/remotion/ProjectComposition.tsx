import type {VideoProject} from '../project/schema';
import {VideoComposition} from './VideoComposition';
import {YouTubeComposition} from './YouTubeComposition';

export const ProjectComposition = ({project}: {project: VideoProject}) =>
  project.youtube
    ? <YouTubeComposition project={project} />
    : <VideoComposition project={project} />;
