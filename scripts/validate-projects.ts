import {existsSync, readFileSync, readdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {parseProject, type VideoProject, type VideoScene} from '../src/project/schema';

const root = process.cwd();
const projectDir = resolve(root, 'projects');
const files = readdirSync(projectDir).filter((file) => file.endsWith('.json'));
const projectIds = new Set<string>();
const errors: string[] = [];

const sceneAssets = (scene: VideoScene): string[] => {
  switch (scene.type) {
    case 'image':
    case 'hero-image':
    case 'photo-mask':
    case 'video':
    case 'caption-video':
    case 'lottie':
      return [scene.src];
    case 'split-image':
      return [scene.leftSrc, scene.rightSrc];
    case 'map-overlay':
    case 'lower-third':
    case 'route-stop':
      return scene.src ? [scene.src] : [];
    default:
      return [];
  }
};

const projectAssets = (project: VideoProject) => {
  const assets = project.scenes.flatMap(sceneAssets);
  if (project.audio?.music) assets.push(project.audio.music.src);
  if (project.audio?.voiceover) assets.push(project.audio.voiceover.src);
  return [...new Set(assets)];
};

for (const file of files) {
  try {
    const raw = JSON.parse(readFileSync(resolve(projectDir, file), 'utf8'));
    const project = parseProject(raw);

    if (projectIds.has(project.id)) {
      errors.push(`${file}: duplicate project id "${project.id}"`);
    }
    projectIds.add(project.id);

    if (project.story) {
      if (!project.geoRoutes?.[project.story.routeId]) {
        errors.push(`${file}: travel story references missing route "${project.story.routeId}"`);
      }
      if (
        project.story.elevationProfileId &&
        !project.elevationProfiles?.[project.story.elevationProfileId]
      ) {
        errors.push(`${file}: travel story references missing elevation profile "${project.story.elevationProfileId}"`);
      }
    }

    for (const [profileId, profile] of Object.entries(project.elevationProfiles ?? {})) {
      for (let i = 1; i < profile.samples.length; i++) {
        if (profile.samples[i].distanceKm <= profile.samples[i - 1].distanceKm) {
          errors.push(`${file}: elevation profile "${profileId}" distances must increase`);
          break;
        }
      }
      if (profile.routeId && !project.geoRoutes?.[profile.routeId]) {
        errors.push(`${file}: elevation profile "${profileId}" references missing route "${profile.routeId}"`);
      }
    }

    // Georeferenced routes must be fully resolved at build time. Video frames
    // never call external routing services or fetch tiles.
    for (const [routeId, route] of Object.entries(project.geoRoutes ?? {})) {
      if (route.coordinates.some((pos, i, coords) =>
        i > 0 && pos[0] === coords[i - 1][0] && pos[1] === coords[i - 1][1]
      )) {
        errors.push(`${file}: geo route "${routeId}" has duplicated adjacent coordinates`);
      }
    }

    const sceneIds = new Set<string>();
    for (const scene of project.scenes) {
      if (sceneIds.has(scene.id)) {
        errors.push(`${file}: duplicate scene id "${scene.id}"`);
      }
      sceneIds.add(scene.id);

      if (scene.type === 'elevation-route' && !project.elevationProfiles?.[scene.profileId]) {
        errors.push(`${file}: elevation scene "${scene.id}" references missing profile "${scene.profileId}"`);
      }

      if (scene.type === 'route-chapter') {
        if (!project.geoRoutes?.[scene.routeId]) {
          errors.push(`${file}: route chapter "${scene.id}" references missing route "${scene.routeId}"`);
        }
        if (scene.endProgress <= scene.startProgress) {
          errors.push(`${file}: route chapter "${scene.id}" must end after it starts`);
        }
      }

      if (scene.type === 'route-stop' && scene.routeId && !project.geoRoutes?.[scene.routeId]) {
        errors.push(`${file}: route stop "${scene.id}" references missing route "${scene.routeId}"`);
      }

      if (scene.type === 'maplibre-route' && !project.geoRoutes?.[scene.routeId]) {
        errors.push(`${file}: MapLibre scene "${scene.id}" references missing route "${scene.routeId}"`);
      }

      if (scene.type === 'geo-route') {
        const route = project.geoRoutes?.[scene.routeId];
        if (!route) {
          errors.push(`${file}: geo scene "${scene.id}" references missing route "${scene.routeId}"`);
        } else {
          // Check that stop coordinates stay near the route corridor rather than
          // concealing arbitrary normalized placement in a geographic scene.
          const nearestKm = (lon: number, lat: number) => {
            const rad = Math.PI / 180;
            const distanceKm = ([x, y]: [number, number]) => {
              const a = Math.sin((lat - y) * rad / 2) ** 2 +
                Math.cos(lat * rad) * Math.cos(y * rad) *
                Math.sin((lon - x) * rad / 2) ** 2;
              return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            };
            return Math.min(...route.coordinates.map(distanceKm));
          };
          for (const stop of scene.stops) {
            const toleranceKm = route.mode === 'rail' ? 8 : route.mode === 'walking' ? 0.4 : 10;
            if (nearestKm(stop.coordinates[0], stop.coordinates[1]) > toleranceKm) {
              errors.push(`${file}: stop "${stop.label}" is outside geo route "${scene.routeId}" corridor`);
            }
          }
        }
      }

      if (scene.type === 'caption-video') {
        for (let captionIndex = 0; captionIndex < scene.captions.length; captionIndex++) {
          const caption = scene.captions[captionIndex];
          if (caption.end <= caption.start) {
            errors.push(`${file}: caption "${caption.text}" ends before it starts`);
          }
          if (caption.end > scene.duration) {
            errors.push(`${file}: caption "${caption.text}" exceeds scene duration`);
          }
          const previous = captionIndex > 0 ? scene.captions[captionIndex - 1] : null;
          if (previous && caption.start < previous.start) {
            errors.push(`${file}: captions in "${scene.id}" must be sorted by start time`);
          }
        }
      }
    }

    for (const source of projectAssets(project)) {
      if (/^https?:\/\//.test(source) || source.startsWith('data:') || source.startsWith('blob:')) {
        continue;
      }
      const assetPath = resolve(root, 'public', source.replace(/^\//, ''));
      if (!existsSync(assetPath)) {
        errors.push(`${file}: missing asset "${source}"`);
      }
    }
  } catch (error) {
    errors.push(`${file}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

if (errors.length > 0) {
  console.error('Project validation failed:\n');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Validated ${files.length} video projects.`);
