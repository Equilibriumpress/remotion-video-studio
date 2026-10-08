import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
  parseProject,
  projectFrames,
  projectVisualScenes,
} from '../src/project/schema';

const raw = JSON.parse(
  readFileSync('projects/peak-district-youtube-longform.json', 'utf8'),
);

const project = parseProject(raw);

assert.equal(project.template, 'youtube-story');
assert.equal(project.format, 'landscape');
assert.ok(project.youtube, 'Long-form project must include a YouTube timeline');
assert.equal(project.youtube?.chapters.length, 7);
assert.equal(project.youtube?.endCard?.duration, 12);

const durationSeconds = projectFrames(project) / project.fps;
assert.equal(durationSeconds, 390, 'Peak District long-form timeline should be exactly 6:30');

const visualScenes = projectVisualScenes(project);
assert.equal(visualScenes.length, 23, 'Expected 7 chapter bases + 16 B-roll/graphic overlays');

for (const chapter of project.youtube?.chapters ?? []) {
  assert.ok(chapter.script && chapter.script.length > 40, `${chapter.id} needs a voiceover script`);
  assert.ok(chapter.captions.length >= 4, `${chapter.id} needs chapter-relative captions`);
  for (const overlay of chapter.overlays) {
    assert.ok(
      overlay.from + overlay.scene.duration <= chapter.duration,
      `${overlay.scene.id} must stay within ${chapter.id}`,
    );
  }
}

const source = readFileSync('src/remotion/YouTubeComposition.tsx', 'utf8');
assert.match(source, /<Series>/, 'Long-form compositor must use Remotion Series');
assert.match(source, /<Series\.Sequence/, 'Chapters must be Series.Sequence blocks');
assert.match(source, /<Sequence/, 'B-roll and graphics must use independent Sequence overlays');
assert.match(source, /premountFor=\{fps\}/, 'Long-form chapters must be premounted');
assert.match(source, /ChapterCaptions/, 'Captions must stay independent from B-roll overlays');
assert.match(source, /YouTubeEndCard/, 'Long-form timeline must end with a YouTube end card');

const sceneFrame = readFileSync('src/remotion/SceneFrame.tsx', 'utf8');
assert.match(
  sceneFrame,
  /<Video[\s\S]*premountFor=\{fps\}/,
  'Video media should premount before long-form cuts',
);

const router = readFileSync('src/remotion/ProjectComposition.tsx', 'utf8');
assert.match(router, /project\.youtube/);
assert.match(router, /YouTubeComposition/);

console.log(
  `YouTube long-form: ${project.youtube?.chapters.length} chapters, ${visualScenes.length} visual layers, ${durationSeconds}s.`,
);
