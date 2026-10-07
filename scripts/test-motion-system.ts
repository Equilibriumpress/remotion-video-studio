import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {beatPulse, quantizeFrame} from '../src/remotion/timing';

const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as {
  dependencies?: Record<string, string>;
};

for (const [name, version] of Object.entries(pkg.dependencies ?? {})) {
  if (name === 'remotion' || name.startsWith('@remotion/')) {
    assert.equal(version, '4.0.534', `${name} must match Remotion 4.0.534`);
  }
}

assert.equal(quantizeFrame(1, 30, 12), 0);
assert.equal(quantizeFrame(3, 30, 12), 2.5);
assert.equal(quantizeFrame(10, 30, 30), 10);

const pulse = beatPulse({
  frame: 30,
  fps: 30,
  beats: [1],
  strength: 0.04,
  decaySeconds: 0.16,
});
assert.ok(pulse > 1.039 && pulse < 1.041);

const schema = readFileSync('src/project/schema.ts', 'utf8');
assert.match(schema, /motionDirectionSchema/);
assert.match(schema, /beatSync/);
assert.match(schema, /graphicFps/);

const mapLibre = readFileSync('src/remotion/scenes/MapLibreRouteScene.tsx', 'utf8');
assert.match(mapLibre, /smoothProgress/);
assert.match(mapLibre, /overlayProgress/);
assert.match(mapLibre, /cameraProgress = clamp01\(smoothProgress \+ scene\.cameraLead\)/);

console.log('Motion direction, beat sync and editorial cadence validated.');
