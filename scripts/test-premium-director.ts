import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseProject, projectFrames} from '../src/project/schema';

const raw = JSON.parse(
  readFileSync('projects/kyoto-premium-director.json', 'utf8'),
);

const project = parseProject(raw);

assert.ok(project.director, 'Director showcase must retain its director brief');
assert.equal(project.direction?.personality, 'premium');
assert.equal(project.director?.visualLanguage, 'editorial');
assert.equal(project.director?.mapRole, 'hero');

const roles = new Set(project.scenes.map((scene) => scene.role));
for (const role of ['hook', 'orient', 'detail', 'travel', 'payoff'] as const) {
  assert.ok(roles.has(role), `Director output must include a ${role} beat`);
}

const pureMapTypes = new Set([
  'geo-route',
  'maplibre-route',
  'editorial-map',
  'route-chapter',
  'elevation-route',
]);

for (let index = 1; index < project.scenes.length; index++) {
  const previous = project.scenes[index - 1];
  const current = project.scenes[index];
  assert.ok(
    !(pureMapTypes.has(previous.type) && pureMapTypes.has(current.type)),
    `Director must not emit back-to-back map shots: ${previous.id} → ${current.id}`,
  );
}

const durationSeconds = projectFrames(project) / project.fps;
assert.ok(
  durationSeconds >= project.director.durationTarget * 0.72 &&
  durationSeconds <= project.director.durationTarget * 1.18,
  `Compiled duration ${durationSeconds.toFixed(1)}s should stay near target ${project.director.durationTarget}s`,
);

assert.ok(
  project.scenes.some((scene) => scene.type === 'editorial-map' && scene.role === 'orient'),
  'Editorial director should compile an editorial orientation map',
);

assert.ok(
  project.scenes.at(-1)?.role === 'payoff',
  'The final beat must be a payoff',
);

console.log(
  `Premium Director compiled ${project.scenes.length} scenes in ${durationSeconds.toFixed(1)}s from the source prompt.`,
);


const peakRaw = JSON.parse(
  readFileSync('projects/peak-district-roadtrip.json', 'utf8'),
);
const peak = parseProject(peakRaw);
const peakDuration = projectFrames(peak) / peak.fps;

assert.ok(peak.director, 'Peak District project must use Premium Director');
assert.equal(peak.director?.durationTarget, 60);
assert.ok(
  Math.abs(peakDuration - 60) <= 0.35,
  `Peak District output should be 60s after transition overlap, got ${peakDuration.toFixed(2)}s`,
);

const peakSceneIds = new Set(peak.scenes.map((scene) => scene.id));
assert.equal(peak.voiceoverScript?.length, 10);
for (const cue of peak.voiceoverScript ?? []) {
  assert.ok(
    peakSceneIds.has(cue.sceneId),
    `Voiceover cue must reference a generated scene: ${cue.sceneId}`,
  );
}

assert.ok(
  peak.scenes.some((scene) => scene.type === 'editorial-map' && scene.role === 'orient'),
  'Peak District roadtrip should include an editorial orientation map',
);
assert.equal(peak.scenes.at(-1)?.role, 'payoff');

assert.ok(
  peak.scenes.some((scene) => scene.id === 'director-detail-02' && scene.type === 'photo-mask'),
  'Castleton must have its own photographic detail beat',
);

assert.ok(
  !peak.scenes.some((scene) => scene.type === 'route-chapter'),
  'Photo-led roadtrips should not add a third map chapter',
);

assert.ok(
  !peak.scenes.some((scene) => scene.id === 'director-payoff-image'),
  'Destination photography should not be repeated as a separate payoff image',
);

const peakArrival = peak.scenes.find((scene) => scene.id === 'director-arrival');
assert.equal(peakArrival?.type, 'hero-image');
assert.equal(peakArrival?.role, 'payoff');

const mapTypes = new Set(['editorial-map', 'geo-route', 'maplibre-route', 'route-chapter']);
assert.ok(
  peak.scenes.filter((scene) => mapTypes.has(scene.type)).length <= 2,
  'Peak District should keep map-led beats to two or fewer',
);

const peakDurations = peak.scenes.map((scene) => scene.duration);
assert.ok(
  Math.max(...peakDurations) - Math.min(...peakDurations) >= 2,
  'Premium roadtrip pacing should vary shot lengths instead of flattening every shot',
);

const peakHook = peak.scenes.find((scene) => scene.id === 'director-hook');
assert.ok(
  peakHook?.type === 'kinetic-title' && !peakHook.kicker?.includes('PREMIUM DIRECTOR'),
  'Exported hook must not expose internal authoring language',
);

const sceneFrameSource = readFileSync('src/remotion/SceneFrame.tsx', 'utf8');
assert.ok(
  !sceneFrameSource.includes('REMOTION VIDEO STUDIO'),
  'Exported outro must not expose internal studio branding',
);

console.log(
  `Peak District Director compiled ${peak.scenes.length} scenes in ${peakDuration.toFixed(2)}s with ${peak.voiceoverScript?.length ?? 0} voiceover cues.`,
);
