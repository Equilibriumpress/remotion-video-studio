import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as {
  dependencies?: Record<string, string>;
};
const source = readFileSync('src/remotion/scenes/MapLibreRouteScene.tsx', 'utf8');
const helper = readFileSync('src/remotion/mapLibreSnapshot.ts', 'utf8');
const renderPanel = readFileSync('src/render/RenderPanel.tsx', 'utf8');

assert.equal(
  pkg.dependencies?.['maplibre-gl'],
  '6.4.1',
  'MapLibre must stay pinned while the browser renderer is experimental',
);
assert.match(source, /maplibre-gl-worker\.mjs\?worker&url/);
assert.match(source, /setWorkerUrl\(workerUrl\)/);
assert.match(source, /setWorkerCount\(1\)/);

assert.doesNotMatch(
  source,
  /calculateCameraOptionsFromTo|\.jumpTo\(/,
  'The fixed-plate renderer must not move the live map camera per frame',
);
assert.match(source, /pixelRatio:\s*1/);
assert.match(source, /maxCanvasSize:\s*\[safeLimit, safeLimit\]/);
assert.match(source, /maxTileCacheSize:\s*96/);
assert.match(source, /maxTileCacheZoomLevels:\s*1/);
assert.match(source, /localIdeographFontFamily:\s*'sans-serif'/);
assert.match(source, /webglcontextlost/);
assert.match(source, /canvasToObjectUrl/);
assert.match(source, /snapshotReady/);
assert.match(
  source,
  /mapInstance\.remove\(\);\s*mapInstance = null;\s*finishLoading\(\);/,
  'MapLibre should release WebGL after a successful snapshot',
);

assert.match(helper, /MAX_MAP_PLATE_DIMENSION = 3072/);
assert.match(helper, /MAX_MAP_CAMERA_ZOOM = 1\.35/);
assert.match(helper, /WEBGL_lose_context/);
assert.match(helper, /canvas\.toBlob/);

assert.match(
  source,
  /1 \/ safeCameraZoom \+ \(1 - 1 \/ safeCameraZoom\) \* followStrength/,
  'Fixed plate CSS scale should approach 1 from below and never upscale above 1',
);
assert.match(source, /translate3d/);
assert.match(source, /pitch:\s*0/);
assert.match(source, /opacity:\s*ready\s*\?\s*1\s*:\s*0/);

assert.match(
  renderPanel,
  /const usesExperimentalCanvas = usesThree;/,
  'MapLibre snapshots should not enable experimental HTML-in-canvas capture',
);
assert.match(
  renderPanel,
  /allowHtmlInCanvas:\s*usesThree/,
  'Only live Three.js canvas scenes should opt into HTML-in-canvas capture',
);

console.log('MapLibre v3: bounded snapshot, memory, lifecycle and fixed-plate invariants validated.');
