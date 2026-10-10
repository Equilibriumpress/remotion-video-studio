import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseProject,projectFrames} from '../src/project/schema';
const p=parseProject(JSON.parse(readFileSync('projects/kyoto-after-dark-v2.json','utf8')));
assert.equal(p.format,'vertical');assert.equal(p.fps,30);assert.equal(projectFrames(p),1350);
assert.deepEqual(p.scenes.map(s=>s.type==='animate-canvas'?s.svgFilmShot:null),['alley','lantern','pagoda','teahouse','panorama']);
assert.ok(p.scenes.every(s=>s.type==='animate-canvas'));
console.log('Kyoto After Dark 2.0: five distinct SVG scenes, 45s, 1080x1920.');
