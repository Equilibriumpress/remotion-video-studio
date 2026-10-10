import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseProject,projectFrames} from '../src/project/schema';
const cases=[['animate-journey-raindrop','raindrop'],['animate-mechanical-watch','watch'],['animate-kyoto-day','kyoto']] as const;
for(const [id,kind] of cases){
 const project=parseProject(JSON.parse(readFileSync('projects/'+id+'.json','utf8')));
 assert.equal(projectFrames(project),1800,id+' must be exactly 60 seconds');
 assert.equal(project.scenes.length,6);
 assert.ok(project.proceduralScore);
 for(const scene of project.scenes){
  assert.equal(scene.type,'animate-canvas');
  if(scene.type!=='animate-canvas')continue;
  assert.equal(scene.special?.kind,kind);
  assert.ok(scene.beatCues?.length);
 }
 console.log(id+' validated: 6 scenes / 1800 frames');
}
