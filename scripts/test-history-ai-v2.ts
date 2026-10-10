import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseProject,projectFrames,sceneTimeline} from '../src/project/schema';
import {interpolatePolygon} from '../src/animate/transitions/morphPath';
import {beatEnergy} from '../src/animate/audio/beatMap';
const data=JSON.parse(readFileSync('projects/animate-history-of-ai-v2.json','utf8'));
const p=parseProject(data);
assert.equal(p.scenes.length,15);
assert.equal(p.fps,30);
assert.equal(projectFrames(p),1800,'must total 60 seconds accounting for overlapping transitions');
const timeline=sceneTimeline(p);
assert.equal(timeline.length,15);
assert.equal(timeline.filter(x=>x.transitionInFrames===0).length,2,'opening scene and single hard cut');
for(const scene of p.scenes){
 assert.equal(scene.type,'animate-canvas');
 if(scene.type!=='animate-canvas')continue;
 assert.equal(scene.style,'cut-paper');
 assert.ok(scene.paperObjects && scene.paperObjects.length>=2);
 assert.ok(scene.handoff?.key==='orange-spark');
 assert.ok(scene.beatCues?.length);
 assert.ok(scene.morph);
 const points=interpolatePolygon(scene.morph!,.5);
 assert.equal(points.length,scene.morph!.from.length);
 assert.ok(points.every(v=>v.every(Number.isFinite)));
 assert.ok(beatEnergy(scene.beatCues!,2.2)>=0);
}
console.log('History of AI 2.0: 15 chapters, one hard cut, all figure/morph/beat definitions, exactly 1800 frames.');
