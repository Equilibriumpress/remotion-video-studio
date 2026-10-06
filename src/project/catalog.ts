import demo from '../../projects/demo.json';
import {parseProject, type VideoProject} from './schema';

export const projects: VideoProject[] = [parseProject(demo)];

export const getProject = (id: string) => projects.find((project) => project.id === id) ?? projects[0];
