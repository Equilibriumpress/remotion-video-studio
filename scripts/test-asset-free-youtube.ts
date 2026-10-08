import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseProject, projectFrames, projectVisualScenes} from '../src/project/schema';

const project = parseProject(JSON.parse(readFileSync('projects/peak-district-asset-free-youtube.json', 'utf8')));
assert.equal(project.format, 'landscape');
assert.equal(project.template, 'youtube-story');
assert.equal(projectFrames(project) / project.fps, 200);
assert.equal(project.youtube?.chapters.length, 7);
const scenes = projectVisualScenes(project);
assert.ok(scenes.some(scene => scene.type === 'motion-diagram'));
assert.ok(scenes.some(scene => scene.type === 'chart'));
assert.ok(scenes.some(scene => scene.type === 'geo-route'));
const ids = new Set<string>();
for (const scene of scenes) {
  assert.ok(!ids.has(scene.id), `Duplicate scene ${scene.id}`);
  ids.add(scene.id);
  assert.ok(!(['image', 'hero-image', 'split-image', 'photo-mask', 'video', 'caption-video', 'lottie'] as string[]).includes(scene.type), `Asset-dependent scene ${scene.id}`);
  assert.ok(!('src' in scene) && !('photoSrc' in scene), `Media source in ${scene.id}`);
}
assert.ok(!project.audio && !project.youtube?.music && !project.youtube?.voiceover);
for (const chapter of project.youtube?.chapters ?? []) {
  assert.ok(chapter.script && chapter.script.length > 70);
  assert.ok(chapter.captions.length >= 4);
  assert.ok(chapter.overlays.every(o => o.from + o.scene.duration <= chapter.duration));
}
const composer = readFileSync('src/remotion/YouTubeComposition.tsx', 'utf8');
assert.match(composer, /<Series>/);
assert.match(composer, /<Sequence/);
const renderer = readFileSync('src/remotion/scenes/MotionDiagramScene.tsx', 'utf8');
assert.match(renderer, /useCurrentFrame/);
assert.doesNotMatch(renderer, /\b(fetch|WebGL|Canvas|setTimeout|Math\.random)\b/);
console.log(`Asset-free YouTube: ${scenes.length} procedural layers, ${project.youtube?.chapters.length} chapters, 200 seconds; no media sources.`);
