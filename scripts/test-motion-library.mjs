import assert from 'node:assert/strict';
import {motionLibrary, searchMotionLibrary} from './search-motion-library.mjs';

const scenes = motionLibrary.scenes;
assert.equal(motionLibrary.count, 201);
assert.equal(scenes.length, 201);
assert.equal(Object.keys(motionLibrary.categoryCounts).length, 16);
assert.equal(new Set(scenes.map((s) => s.id)).size, 201);

const sha = motionLibrary.source.commit;
assert.match(sha, /^[a-f0-9]{40}$/);
assert.equal(Object.values(motionLibrary.categoryCounts).reduce((sum, n) => sum + n, 0), 201);
for (const scene of scenes) {
  assert.match(scene.id, /^[A-Z][A-Za-z0-9]+$/);
  assert.equal(scene.path, 'src/scenes/' + scene.category + '/' + scene.id + '.tsx');
  assert.equal(scene.sourceUrl, 'https://github.com/lifeprompt-team/remotion-scenes/blob/' + sha + '/' + scene.path);
  assert.ok(scene.tags.length >= 2);
  assert.ok(['not-tested', 'webgl-review', 'performance-review'].includes(scene.compatibility));
}
const kyoto = searchMotionLibrary('Kyoto Japan watercolor travel', 30);
assert.ok(kyoto.some((s) => s.id === 'ThemeWatercolor'));
const title = searchMotionLibrary('cinematic documentary title', 30);
assert.ok(title.some((s) => s.id === 'CinematicDocumentary'));
assert.equal(searchMotionLibrary('zzzzzznoresults').length, 0);
console.log('Motion library: verified 201 pinned source entries across 16 categories; authoring search passed.');
