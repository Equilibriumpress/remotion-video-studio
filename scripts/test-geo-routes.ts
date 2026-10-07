import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseProject} from '../src/project/schema';
import {projectGeoPath} from '../src/remotion/scenes/GeoRouteScene';

const ids = ['tokyo-kyoto-shinkansen', 'kyoto-morning-route', 'scotland-roadtrip-showcase'];
const haversine = (a: [number, number], b: [number, number]) => {
  const rad = Math.PI / 180;
  const dy = (b[1] - a[1]) * rad;
  const dx = (b[0] - a[0]) * rad;
  const v = Math.sin(dy / 2) ** 2 + Math.cos(a[1] * rad) * Math.cos(b[1] * rad) * Math.sin(dx / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(v), Math.sqrt(1 - v));
};

for (const id of ids) {
  const project = parseProject(JSON.parse(readFileSync(`projects/${id}.json`, 'utf8')));
  const scenes = project.scenes.filter((s) => s.type === 'geo-route');
  assert.ok(scenes.length >= 2, `${id}: missing geo-route scenes`);
  const ids = new Set(scenes.map((s) => s.routeId));
  assert.equal(ids.size, 1, `${id}: route is not reused across scenes`);

  for (const scene of scenes) {
    const route = project.geoRoutes?.[scene.routeId];
    assert.ok(route, `${id}: missing geodata for ${scene.routeId}`);
    const projected = projectGeoPath(route.coordinates, 1080, 1920, scene.mapRotation);
    assert.equal(projected.points.length, route.coordinates.length);
    for (const point of projected.points) {
      assert.ok(Number.isFinite(point.x) && Number.isFinite(point.y), `${id}: invalid projected point`);
      assert.ok(point.x >= 0 && point.x <= 1080 && point.y >= 0 && point.y <= 1920, `${id}: map is outside frame`);
    }
    const nearest = (coord: [number, number]) =>
      Math.min(...route.coordinates.map((p) => haversine(p, coord)));
    for (const stop of scene.stops) {
      assert.ok(nearest(stop.coordinates) < (route.mode === 'walking' ? 0.4 : 10),
        `${id}: ${stop.label} too far from route`);
    }
  }

  const shape = project.geoRoutes?.[scenes[0].routeId];
  assert.ok(shape);
  const length = shape.coordinates.slice(1).reduce((km, pos, index) =>
    km + haversine(shape.coordinates[index], pos), 0);
  if (id === 'tokyo-kyoto-shinkansen') assert.ok(length > 470 && length < 490, 'Rail route should follow MLIT track');
  if (id === 'kyoto-morning-route') assert.ok(length > 1.2 && length < 3.5, 'Kyoto walk should follow actual streets');
  console.log(`${id}: ${shape.coordinates.length} coordinates · ${length.toFixed(1)} km · ${scenes.length} geo scenes OK`);
}

console.log('Geographic routes: projection, schema, stops and geometry validated.');
