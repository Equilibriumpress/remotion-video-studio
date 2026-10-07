import demo from '../../projects/demo.json';
import travelDemo from '../../projects/travel-demo.json';
import renderTest from '../../projects/render-test.json';
import premiumMotionDemo from '../../projects/premium-motion-demo.json';
import kyotoPremiumShowcase from '../../projects/kyoto-premium-showcase.json';
import tokyoKyotoShinkansen from '../../projects/tokyo-kyoto-shinkansen.json';
import kyotoMorningRoute from '../../projects/kyoto-morning-route.json';
import kyotoAutoStory from '../../projects/kyoto-auto-story.json';
import scotlandRoadtripShowcase from '../../projects/scotland-roadtrip-showcase.json';
import studioProductShowcase from '../../projects/studio-product-showcase.json';
import {parseProject, type VideoProject} from './schema';

export const projects: VideoProject[] = [
  parseProject(demo),
  parseProject(travelDemo),
  parseProject(renderTest),
  parseProject(premiumMotionDemo),
  parseProject(kyotoPremiumShowcase),
  parseProject(tokyoKyotoShinkansen),
  parseProject(kyotoMorningRoute),
  parseProject(kyotoAutoStory),
  parseProject(scotlandRoadtripShowcase),
  parseProject(studioProductShowcase),
];

export const getProject = (id: string) =>
  projects.find((project) => project.id === id) ?? projects[0];
