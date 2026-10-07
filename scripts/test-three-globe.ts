import assert from 'node:assert/strict';
import {
  greatCircleArc,
  latLonToVector3,
  multiStopGlobeArc,
} from '../src/remotion/three/globe';

const close = (actual: number, expected: number, tolerance = 1e-6) =>
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `Expected ${actual} to be within ${tolerance} of ${expected}`,
  );

const primeMeridian = latLonToVector3([0, 0], 1);
close(primeMeridian.x, 0);
close(primeMeridian.y, 0);
close(primeMeridian.z, 1);

const east = latLonToVector3([90, 0], 1);
close(east.x, 1);
close(east.y, 0);
close(east.z, 0);

const arc = greatCircleArc({
  start: [139.6917, 35.6895],
  end: [103.8198, 1.3521],
  radius: 1.2,
  arcHeight: 0.2,
  samples: 24,
});
assert.equal(arc.length, 24);
close(arc[0].length(), 1.2, 1e-5);
close(arc[arc.length - 1].length(), 1.2, 1e-5);
assert.ok(
  Math.max(...arc.map((point) => point.length())) > 1.3,
  'Great-circle arc should rise above the globe surface',
);

const multi = multiStopGlobeArc({
  stops: [
    [139.6917, 35.6895],
    [103.8198, 1.3521],
    [151.2093, -33.8688],
  ],
  radius: 1.2,
  arcHeight: 0.18,
  samplesPerLeg: 20,
});
assert.equal(multi.length, 39);

console.log('Three globe: coordinate projection and great-circle arcs validated.');
