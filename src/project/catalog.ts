import demo from '../../projects/demo.json';
import travelDemo from '../../projects/travel-demo.json';
import dataDemo from '../../projects/data-demo.json';
import renderTest from '../../projects/render-test.json';
import premiumMotionDemo from '../../projects/premium-motion-demo.json';
import kyotoPremiumShowcase from '../../projects/kyoto-premium-showcase.json';
import {parseProject, type VideoProject} from './schema';

export const projects: VideoProject[] = [
  parseProject(demo),
  parseProject(travelDemo),
  parseProject(dataDemo),
  parseProject(renderTest),
  parseProject(premiumMotionDemo),
  parseProject(kyotoPremiumShowcase),
];

export const getProject = (id: string) =>
  projects.find((project) => project.id === id) ?? projects[0];
