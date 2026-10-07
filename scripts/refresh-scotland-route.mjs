// One-time authoring utility. No routing request occurs during a video render.
// Usage: npm run routes:scotland
// FOSSGIS's Valhalla server is a rate-limited demo, not a production API.
import {readFileSync, writeFileSync} from 'node:fs';

const path = 'projects/scotland-roadtrip-showcase.json';
const project = JSON.parse(readFileSync(path, 'utf8'));
const points = [
  [-3.1883, 55.9533], // Edinburgh
  [-3.9287, 56.1230], // Stirling
  [-4.6327, 56.3900], // Crianlarich / Loch Lomond corridor
  [-5.0964, 56.6823], // Glencoe
  [-5.1052, 56.8198], // Fort William
  [-5.4316, 56.8759], // Glenfinnan
  [-5.1052, 56.8198], // return to Fort William to reach the A87
  [-4.8350, 57.0670], // Invergarry
  [-5.5160, 57.2740], // Eilean Donan Castle
  [-6.1953, 57.4125], // Portree
];

const request = {
  locations: points.map(([lon, lat]) => ({lon, lat})),
  costing: 'auto',
  shape_format: 'polyline6',
  directions_options: {units: 'kilometers'},
};

const response = await fetch('https://valhalla1.openstreetmap.de/route', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Client-Id': 'equilibriumpress-remotion-video-studio',
  },
  body: JSON.stringify(request),
});
if (!response.ok) {
  throw new Error(`Valhalla route generation failed (${response.status}). Nothing was changed.`);
}
const result = await response.json();
if (!result.trip?.legs?.length) throw new Error('No road route returned; original project unchanged.');

const decodePolyline6 = (encoded) => {
  let index = 0;
  let lat = 0;
  let lon = 0;
  const coordinates = [];
  const decode = () => {
    let result = 0;
    let shift = 0;
    let b;
    do {
      if (index >= encoded.length) throw new Error('Truncated polyline6');
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    return (result & 1) ? ~(result >> 1) : result >> 1;
  };
  while (index < encoded.length) {
    lat += decode();
    lon += decode();
    coordinates.push([lon / 1e6, lat / 1e6]);
  }
  return coordinates;
};
const joined = result.trip.legs.flatMap((leg, index) => {
  const coords = decodePolyline6(leg.shape);
  return index === 0 ? coords : coords.slice(1);
});
if (joined.length < 20) throw new Error('Returned road geometry is unexpectedly short. No changes saved.');

// Ramer–Douglas–Peucker, ~40 metre visual tolerance. Preserve bends.
const simplify = (coords, toleranceMeters) => {
  const centerLat = coords.reduce((sum, point) => sum + point[1], 0) / coords.length;
  const cos = Math.cos(centerLat * Math.PI / 180);
  const xy = coords.map(([lon, lat]) => [lon * 111320 * cos, lat * 111320]);
  const keep = new Set([0, coords.length - 1]);
  const ranges = [[0, coords.length - 1]];
  while (ranges.length) {
    const [first, last] = ranges.pop();
    const a = xy[first], b = xy[last];
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const den = dx * dx + dy * dy;
    let far = -1, max = 0;
    for (let i = first + 1; i < last; i++) {
      const p = xy[i];
      const t = den ? Math.max(0, Math.min(1, ((p[0]-a[0])*dx+(p[1]-a[1])*dy)/den)) : 0;
      const d = Math.hypot(p[0] - a[0] - dx*t, p[1] - a[1] - dy*t);
      if (d > max) {max = d; far = i;}
    }
    if (max > toleranceMeters && far > first && far < last) {
      keep.add(far);
      ranges.push([first, far], [far, last]);
    }
  }
  return coords.filter((_, index) => keep.has(index));
};
const simplified = simplify(joined, 40).map(([lon, lat]) => [
  Math.round(lon * 1e6) / 1e6,
  Math.round(lat * 1e6) / 1e6,
]).filter((pos, index, all) => index === 0 || pos[0] !== all[index - 1][0] || pos[1] !== all[index - 1][1]);

if (simplified.length > 5000) throw new Error('Route exceeds 5,000 geometry points. Try a higher simplification tolerance.');
project.geoRoutes['highlands-waypoints'] = {
  type: 'LineString',
  mode: 'driving',
  coordinates: simplified,
  source: {
    name: 'OpenStreetMap via Valhalla',
    url: 'https://www.openstreetmap.org/copyright',
    license: 'ODbL 1.0',
  },
};
for (const scene of project.scenes) {
  if (scene.type === 'geo-route') {
    if (scene.distance?.includes('indicative')) scene.distance = '6 stops · Highland road journey';
  }
}
writeFileSync(path, JSON.stringify(project, null, 2) + '\n');
console.log(`Saved ${simplified.length} road geometry points to ${path} from ${joined.length} original points.`);
console.log('Run npm run validate && npm run build, review the route, and commit the updated project.');
