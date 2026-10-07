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
