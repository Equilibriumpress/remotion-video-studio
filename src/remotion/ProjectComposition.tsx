import type {VideoProject} from '../project/schema';
import {VideoComposition} from './VideoComposition';
import {YouTubeComposition} from './YouTubeComposition';
// NordicRoutes imports the original source. IntroLowerThird uses an animation-identical
// adapter because the published Remotion interactivity schema rejects upstream `string` fields.
import {NordicRoutes} from '../../reference/remotion-dev/remotion/packages/jonnys-videos/src/roller-skis/nordic/NordicRoutes';
import {IntroLowerThird} from './upstream-compat/IntroLowerThird';

export const ProjectComposition = ({project}: {project: VideoProject}) => {
  if (project.nativeComposition === 'roller-skis-nordic-routes') {
    return <NordicRoutes />;
  }

  if (project.nativeComposition === 'roller-skis-intro-lower-third') {
    return <IntroLowerThird nameText="Jonny Burger" roleText="Roller Ski Enthusiast" />;
  }

  return project.youtube
    ? <YouTubeComposition project={project} />
    : <VideoComposition project={project} />;
};
