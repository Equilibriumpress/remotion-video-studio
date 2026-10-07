import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as {
  dependencies?: Record<string, string>;
};
const source = readFileSync('src/remotion/scenes/MapLibreRouteScene.tsx', 'utf8');

assert.equal(
  pkg.dependencies?.['maplibre-gl'],
  '6.4.1',
  'MapLibre must stay pinned while the browser renderer is experimental',
);
assert.match(
  source,
  /maplibre-gl-worker\.mjs\?worker&url/,
  'Vite must bundle the MapLibre v6 worker explicitly',
);
assert.match(
  source,
  /setWorkerUrl\(workerUrl\)/,
  'MapLibre worker URL must be configured before maps are created',
);
assert.match(
  source,
  /setWorkerCount\(1\)/,
  'Browser video maps should use one MapLibre worker',
);
assert.doesNotMatch(
  source,
  /mapInstance\.remove\(/,
  'Do not explicitly remove MapLibre during Remotion scene cleanup',
);
assert.doesNotMatch(
  source,
  /calculateCameraOptionsFromTo|\.jumpTo\(/,
  'The fixed-plate renderer must not move the live map camera per frame',
);
assert.match(
  source,
  /translate3d/,
  'Follow motion should be applied to the fixed plate with CSS transforms',
);

assert.match(
  source,
  /pitch:\s*0/,
  'The fixed plate should stay flat to avoid an apparent entry fly-in',
);
assert.match(
  source,
  /opacity:\s*ready\s*\?\s*1\s*:\s*0/,
  'The basemap must remain hidden until fitBounds and idle have completed',
);

console.log('MapLibre v2: worker, lifecycle and fixed-plate invariants validated.');
