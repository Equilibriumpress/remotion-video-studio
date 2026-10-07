import type {VideoProject} from './schema';

type Coordinate = [number, number];

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

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

const formatDistance = (value: number) =>
  value < 10 ? `${value.toFixed(1)} km from start` : `${Math.round(value)} km from start`;

export const composeTravelSequence = (project: VideoProject): unknown[] => {
  const story = project.story;
  if (!story) return project.scenes;

  const route = project.geoRoutes?.[story.routeId];
  if (!route) return project.scenes;

  const routeStyle =
    story.style === 'editorial'
      ? 'watercolor'
      : story.style === 'clean'
        ? 'clean'
        : 'flow';

  const totalKm = routeDistanceKm(route.coordinates as Coordinate[]);
  const stops = story.stops
    .map((stop) => ({
      ...stop,
      progress: progressForCoordinate(route.coordinates as Coordinate[], stop.coordinates as Coordinate),
    }))
    .sort((a, b) => a.progress - b.progress);

  const geoStops = stops.map((stop) => ({
    coordinates: stop.coordinates,
    label: stop.label,
    detail: stop.detail ?? stop.time,
    icon: stop.icon,
  }));

  const vehicle = story.vehicle
    ? {type: story.vehicle, scale: 1, showPulse: true}
    : undefined;

  const scenes: Array<Record<string, unknown>> = [
    {
      id: 'auto-title',
      type: 'kinetic-title',
      duration: 2.8,
      text: story.title,
      kicker: 'TRAVEL STORY / AUTO SEQUENCE',
      style: 'word-reveal',
      transition: 'fade',
    },
  ];

  if (story.introImage) {
    scenes.push({
      id: 'auto-hero',
      type: 'hero-image',
      duration: 3.8,
      src: story.introImage,
      kicker: stops[0]?.label?.toUpperCase(),
      title: story.title,
      subtitle: story.subtitle,
      motion: story.style === 'cinematic' ? 'cinematic-push' : 'slow-push',
      motionAmount: 0.85,
      transition: 'soft-zoom',
      transitionDuration: 0.6,
    });
  }

  if (story.overview) {
    scenes.push({
      id: 'auto-overview',
      type: 'geo-route',
      duration: 4.6,
      title: `${stops[0].label} → ${stops[stops.length - 1].label}`,
      routeId: story.routeId,
      stops: geoStops,
      progress: 1,
      style: routeStyle,
      showDetails: true,
      mapRotation: story.mapRotation,
      camera: 'overview',
      transition: 'fade',
    });
  }

  if (vehicle) {
    scenes.push({
      id: 'auto-route-follow',
      type: 'geo-route',
      duration: 4.4,
      title: 'On the route',
      routeId: story.routeId,
      stops: geoStops,
      progress: Math.max(0.5, Math.min(0.82, stops[stops.length - 1].progress)),
      label: `${stops[0].label} → ${stops[stops.length - 1].label}`,
      style: routeStyle,
      showDetails: false,
      mapRotation: story.mapRotation,
      camera: 'follow',
      cameraZoom: 1.32,
      vehicle,
      transition: 'soft-zoom',
      transitionDuration: 0.55,
    });
  }

  if (story.stopCards && stops.length > 0) {
    const first = stops[0];
    scenes.push({
      id: 'auto-stop-01',
      type: 'route-stop',
      duration: 3.7,
      kicker: 'START',
      title: first.label,
      subtitle: first.detail,
      body: first.body,
      src: first.src,
      number: first.number ?? '01',
      time: first.time,
      distance: first.distance ?? formatDistance(totalKm * first.progress),
      routeId: story.routeId,
      routeProgress: first.progress,
      mapRotation: story.mapRotation,
      layout: first.src ? 'photo-map' : 'minimal',
      transition: 'fade',
    });
  }

  for (let index = 1; index < stops.length; index++) {
    const previous = stops[index - 1];
    const stop = stops[index];
    if (story.chapters && stop.progress - previous.progress > 0.002) {
      scenes.push({
        id: `auto-chapter-${String(index).padStart(2, '0')}`,
        type: 'route-chapter',
        duration: 3.8,
        kicker: `LEG ${String(index).padStart(2, '0')}`,
        title: `${previous.label} → ${stop.label}`,
        subtitle: stop.detail,
        routeId: story.routeId,
        startProgress: previous.progress,
        endProgress: stop.progress,
        startLabel: previous.label,
        endLabel: stop.label,
        mapRotation: story.mapRotation,
        style: routeStyle,
        transition: 'soft-zoom',
        transitionDuration: 0.5,
      });
    }

    if (story.stopCards) {
      scenes.push({
        id: `auto-stop-${String(index + 1).padStart(2, '0')}`,
        type: 'route-stop',
        duration: 3.9,
        kicker: index === stops.length - 1 ? 'ARRIVAL' : `STOP ${String(index + 1).padStart(2, '0')}`,
        title: stop.label,
        subtitle: stop.detail,
        body: stop.body,
        src: stop.src,
        number: stop.number ?? String(index + 1).padStart(2, '0'),
        time: stop.time,
        distance: stop.distance ?? formatDistance(totalKm * stop.progress),
        routeId: story.routeId,
        routeProgress: stop.progress,
        mapRotation: story.mapRotation,
        layout: stop.src ? 'photo-map' : 'minimal',
        transition: 'fade',
      });
    }
  }

  if (story.elevationProfileId && project.elevationProfiles?.[story.elevationProfileId]) {
    scenes.push({
      id: 'auto-elevation',
      type: 'elevation-route',
      duration: 4.2,
      title: 'Elevation along the route',
      profileId: story.elevationProfileId,
      progress: 1,
      showStats: true,
      transition: 'soft-zoom',
    });
  }

  scenes.push({
    id: 'auto-arrival-route',
    type: 'geo-route',
    duration: 3.5,
    title: `Arrive in ${stops[stops.length - 1].label}`,
    routeId: story.routeId,
    stops: geoStops,
    progress: 1,
    label: 'Journey complete',
    style: routeStyle,
    showDetails: false,
    mapRotation: story.mapRotation,
    camera: 'overview',
    vehicle,
    transition: 'slide-up',
  });

  scenes.push({
    id: 'auto-outro',
    type: 'outro',
    duration: 2.8,
    title: story.outroTitle ?? stops[stops.length - 1].label,
    subtitle: story.subtitle ?? project.title,
    motion: 'cinematic-pull',
    motionAmount: 0.8,
    transition: 'fade',
  });

  return scenes;
};
