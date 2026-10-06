import demo from '../../projects/demo.json';
import travelDemo from '../../projects/travel-demo.json';
import dataDemo from '../../projects/data-demo.json';
import {parseProject, type VideoProject} from './schema';

export const projects: VideoProject[] = [
  parseProject(demo),
  parseProject(travelDemo),
  parseProject(dataDemo),
];

export const getProject = (id: string) =>
  projects.find((project) => project.id === id) ?? projects[0];
