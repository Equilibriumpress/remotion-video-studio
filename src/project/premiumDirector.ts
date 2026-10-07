import type {VideoProject} from './schema';

type Coordinate = [number, number];

type DraftScene = {
  weight: number;
  scene: Record<string, unknown>;
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const clamp01 = (value: number) => clamp(value, 0, 1);

const distanceKm = (a: Coordinate, b: Coordinate) => {
  const rad = Math.PI / 180;
  const dLat = (b[1] - a[1]) * rad;
  const dLon = (b[0] - a[0]) * rad;
  const value =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a[1] * rad) * Math.cos(b[1] * rad) *
    Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
};

const routeDistanceKm = (route: ReadonlyArray<Coordinate>) =>
  route.slice(1).reduce((sum, point, index) => sum + distanceKm(route[index], point), 0);

const progressForCoordinate = (
  route: ReadonlyArray<Coordinate>,
  target: Coordinate,
) => {
  const segmentLengths = route.slice(1).map((point, index) => distanceKm(route[index], point));
  const total = segmentLengths.reduce((sum, length) => sum + length, 0) || 1;
  const cosLat = Math.cos(target[1] * Math.PI / 180);
  let walked = 0;
  let bestDistance = Infinity;
  let bestProgress = 0;

  for (let i = 0; i < segmentLengths.length; i++) {
    const a = route[i];
    const b = route[i + 1];
    const ax = (a[0] - target[0]) * cosLat;
    const ay = a[1] - target[1];
    const bx = (b[0] - target[0]) * cosLat;
    const by = b[1] - target[1];
    const dx = bx - ax;
    const dy = by - ay;
    const denominator = Math.max(1e-12, dx * dx + dy * dy);
    const t = clamp01((-(ax * dx + ay * dy)) / denominator);
    const cx = ax + dx * t;
    const cy = ay + dy * t;
    const planarDistance = Math.hypot(cx, cy);

    if (planarDistance < bestDistance) {
      bestDistance = planarDistance;
      bestProgress = (walked + segmentLengths[i] * t) / total;
    }
    walked += segmentLengths[i];
  }

  return clamp01(bestProgress);
};

const titleCaseMode = (mode: string) =>
  mode === 'rail'
    ? 'Rail'
    : mode === 'walking'
      ? 'Walk'
      : 'Drive';

const roundOne = (value: number) => Math.round(value * 10) / 10;

const transitionOverlapSeconds = (
  scene: Record<string, unknown>,
  duration: number,
) => {
  const transition = scene.transition;
  if (!transition || transition === 'cut') return 0;
  const requested = typeof scene.transitionDuration === 'number'
    ? scene.transitionDuration
    : 0.45;
  return Math.min(requested, duration / 3);
};

const applyTargetDuration = (
  drafts: DraftScene[],
  target: number,
  pacing: 'calm' | 'balanced' | 'dynamic',
) => {
  const baseline = drafts.reduce((sum, draft) => sum + draft.weight, 0) || 1;
  const pacingMin = pacing === 'calm' ? 2.8 : pacing === 'dynamic' ? 1.9 : 2.3;
  const pacingMax = pacing === 'calm' ? 6.4 : pacing === 'dynamic' ? 4.6 : 5.6;

  const build = (grossTarget: number) =>
    drafts.map(({scene, weight}) => ({
      ...scene,
      duration: roundOne(clamp(weight * grossTarget / baseline, pacingMin, pacingMax)),
    }));

  const timelineSeconds = (scenes: Array<Record<string, unknown> & {duration: number}>) =>
    scenes.reduce((sum, scene, index) => {
      const overlap = index === 0 ? 0 : transitionOverlapSeconds(scene, scene.duration);
      return sum + scene.duration - overlap;
    }, 0);

  let low = target;
  let high = target * 2;

  for (let i = 0; i < 24; i++) {
    const mid = (low + high) / 2;
    const duration = timelineSeconds(build(mid));
    if (duration < target) low = mid;
    else high = mid;
  }

  return build(high);
};

export const composePremiumSequence = (project: VideoProject): unknown[] => {
  const story = project.story;
  const director = project.director;
  if (!story || !director) return project.scenes;

  const route = project.geoRoutes?.[story.routeId];
  if (!route) return project.scenes;

  const totalKm = routeDistanceKm(route.coordinates as Coordinate[]);
  const stops = story.stops
    .map((stop) => ({
      ...stop,
      progress: progressForCoordinate(
        route.coordinates as Coordinate[],
        stop.coordinates as Coordinate,
      ),
    }))
    .sort((a, b) => a.progress - b.progress);

  const first = stops[0];
  const last = stops[stops.length - 1];
  if (!first || !last) return project.scenes;

  const geoStops = stops.map((stop) => ({
    coordinates: stop.coordinates,
    label: stop.label,
    detail: stop.detail ?? stop.time,
    icon: stop.icon,
  }));

  const routeStyle =
    director.visualLanguage === 'editorial'
      ? 'watercolor'
      : director.visualLanguage === 'energetic'
        ? 'flow'
        : 'clean';

  const heroSrc = story.introImage ?? first.src;
  const lastSrc = last.src;
  const transitionDuration =
    director.pacing === 'calm' ? 0.7 : director.pacing === 'dynamic' ? 0.38 : 0.55;
  const photoMotion =