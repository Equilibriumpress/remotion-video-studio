import {parseProject, getDimensions, projectFrames} from '../src/project/schema';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const ids = ['kyoto-in-layers','tokyo-through-time','how-a-shinkansen-works','build-a-city','pixel-tokyo','mathematics-of-motion'];
for(const id of ids){
  const project = parseProject(JSON.parse(readFileSync(resolve('projects', 'animate-'+id+'.json'),'utf8')));
  const {width,height} = getDimensions(project.format);
  if(project.scenes.length !== 5) throw new Error(id+': expected five storyboard scenes');
  if(!project.proceduralScore) throw new Error(id+': procedural audio required');
  if(!project.scenes.every(scene=>scene.type==='animate-canvas')) throw new Error(id+': animation scene expected');
  if(!project.scenes.every(scene=>scene.type!=='animate-canvas'||(scene.motif&&scene.camera))) throw new Error(id+': motif and camera required');
  if(projectFrames(project)<30) throw new Error(id+': too few frames');
  if(width<1080||height<1080) throw new Error(id+': output too small');
  console.log('OK '+project.id+' '+projectFrames(project)+' frames / '+width+'x'+height);
}
