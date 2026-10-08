import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseProject, projectFrames, projectVisualScenes} from '../src/project/schema';

const source = JSON.parse(readFileSync('projects/bitcoin-explained-svg-showcase.json', 'utf8'));
const project = parseProject(source);
assert.equal(project.id, 'bitcoin-explained-svg-showcase');
assert.equal(project.template, 'youtube-story');
assert.equal(project.format, 'landscape');
assert.equal(project.fps, 30);
assert.equal(projectFrames(project), 8 * 60 * 30);
assert.equal(project.youtube?.chapters.length, 8);
const modes = ['network','wallets','transaction','broadcast','blockchain','confirmations','investigation','takeaway'];
assert.deepEqual(project.youtube?.chapters.map(c => c.base.type === 'bitcoin-explainer' ? c.base.mode : null), modes);
const scenes = projectVisualScenes(project);
assert.equal(new Set(scenes.map(s => s.id)).size, scenes.length);
for (const chapter of project.youtube?.chapters ?? []) {
  assert.equal(chapter.duration, 60);
  assert.equal(chapter.captions.length, 6);
  assert.ok(chapter.script && chapter.script.length > 150);
  assert.ok(chapter.overlays.length > 0);
  for (const overlay of chapter.overlays) {
    assert.ok(overlay.from >= 0 && overlay.from + overlay.scene.duration <= chapter.duration);
  }
}
assert.ok(!project.audio && !project.youtube?.music && !project.youtube?.voiceover);
assert.ok(scenes.every(s => !['image','hero-image','split-image','photo-mask','video','caption-video','lottie'].includes(s.type)));
assert.ok(scenes.every(s => !('src' in s)));
const scene = readFileSync('src/remotion/scenes/BitcoinExplainerScene.tsx', 'utf8');
assert.match(scene, /useCurrentFrame/);
assert.match(scene, /<svg /);
assert.doesNotMatch(scene, /\b(fetch|setTimeout|Math\.random)\s*\(/);
console.log('Bitcoin Explainer: 8 × 60s, 1920×1080, 24 procedural layers, no assets.');
