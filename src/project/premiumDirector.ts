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
    director.visualLanguage === 'cinematic'
      ? 'cinematic-push'
      : director.pacing === 'dynamic'
        ? 'pan-and-zoom'
        : 'slow-push';

  const drafts: DraftScene[] = [];
  const push = (weight: number, scene: Record<string, unknown>) =>
    drafts.push({weight, scene});

  push(2.6, {
    id: 'director-hook',
    type: 'kinetic-title',
    text: director.hook,
    kicker: `${director.goal.toUpperCase()} / PREMIUM DIRECTOR`,
    style: director.visualLanguage === 'minimal' ? 'split' : 'zoom',
    align: 'center',
    highlight: story.title.split(' ').slice(-1)[0],
    transition: 'fade',
    role: 'hook',
    directorNote: 'Open with one clear promise from the source prompt.',
  });

  if (
    director.narrative === 'contrast' &&
    first.src &&
    last.src &&
    first.src !== last.src
  ) {
    push(3.2, {
      id: 'director-contrast',
      type: 'split-image',
      leftSrc: first.src,
      rightSrc: last.src,
      title: `${first.label} → ${last.label}`,
      caption: story.subtitle,
      transition: 'photo-mask-reveal',
      transitionDuration,
      role: 'hook',
      directorNote: 'Establish visual contrast before geographic orientation.',
    });
  } else if (heroSrc) {
    push(3.8, {
      id: 'director-hero',
      type: 'hero-image',
      src: heroSrc,
      kicker: first.label.toUpperCase(),
      title: story.title,
      subtitle: story.subtitle,
      motion: photoMotion,
      motionAmount: director.pacing === 'calm' ? 0.72 : 0.86,
      transition: 'photo-mask-reveal',
      transitionDuration,
      role: 'hook',
      directorNote: 'Move from verbal hook to an emotionally strong location image.',
    });
  }

  if (
    director.narrative === 'guide' &&
    !director.avoid.includes('excessive-ui')
  ) {
    push(3.0, {
      id: 'director-guide-hud',
      type: 'travel-hud',
      title: `${first.label} to ${last.label}`,
      subtitle: story.subtitle,
      kicker: 'ROUTE AT A GLANCE',
      src: heroSrc,
      metrics: [
        {label: 'distance', value: totalKm < 10 ? `${totalKm.toFixed(1)} km` : `${Math.round(totalKm)} km`},
        {label: 'mode', value: titleCaseMode(route.mode)},
        {label: 'stops', value: String(stops.length)},
      ],
      transition: 'fade',
      role: 'orient',
      directorNote: 'Give practical context once, before the visual journey starts.',
    });
  }

  if (director.mapRole !== 'none') {
    if (director.mapEngine === 'editorial') {
      push(3.7, {
        id: 'director-orient',
        type: 'editorial-map',
        title: `${first.label} → ${last.label}`,
        kicker: 'ROUTE ORIENTATION',
        region: story.title.toUpperCase(),
        stat: route.mode === 'driving'
          ? `${stops.length} highlights`
          : totalKm < 10
            ? `${totalKm.toFixed(1)} km`
            : `${Math.round(totalKm)} km`,
        routeId: story.routeId,
        stops: geoStops,
        progress: 1,
        showDetails: director.assetBalance === 'map-led',
        graphicFps: 12,
        transition: 'map-reveal',
        transitionDuration,
        role: 'orient',
        directorNote: 'Orient once with an editorial map; do not let mapping dominate the opening.',
      });
    } else {
      push(3.7, {
        id: 'director-orient',
        type: 'geo-route',
        title: `${first.label} → ${last.label}`,
        routeId: story.routeId,
        stops: geoStops,
        progress: 1,
        style: routeStyle,
        showDetails: director.assetBalance === 'map-led',
        mapRotation: story.mapRotation,
        camera: 'overview',
        transition: 'fade',
        transitionDuration,
        role: 'orient',
        directorNote: 'Provide one clean geographic orientation shot.',
      });
    }
  }

  const detailCandidates = stops.filter((stop, index) =>
    index < stops.length - 1 &&
    Boolean(stop.src || stop.body || stop.detail || stop.time),
  );
  const maxDetails =
    director.assetBalance === 'photo-led'
      ? 3
      : director.assetBalance === 'map-led'
        ? 1
        : 2;
  const chosenDetails = detailCandidates
    .filter((stop, index, array) => {
      if (array.length <= maxDetails) return true;
      const desired = maxDetails === 1
        ? Math.floor((array.length - 1) / 2)
        : Math.round(index * (maxDetails - 1) / Math.max(1, array.length - 1));
      return index === Math.round(desired * (array.length - 1) / Math.max(1, maxDetails - 1));
    })
    .slice(0, maxDetails);

  const addDetail = (stop: typeof stops[number], index: number) => {
    if (
      stop.src &&
      director.visualLanguage !== 'minimal' &&
      index > 0
    ) {
      push(3.4, {
        id: `director-detail-${String(index + 1).padStart(2, '0')}`,
        type: 'photo-mask',
        src: stop.src,
        title: stop.label,
        caption: stop.detail ?? stop.body,
        shape: director.visualLanguage === 'editorial' ? 'window' : 'portrait',
        treatment: director.visualLanguage === 'cinematic' ? 'dark' : 'natural',
        frame: 'thin',
        transition: 'photo-mask-reveal',
        transitionDuration,
        role: 'detail',
        directorNote: 'Use a distinct photographic treatment to reset attention after geography.',
      });
      return;
    }

    push(3.4, {
      id: `director-detail-${String(index + 1).padStart(2, '0')}`,
      type: 'route-stop',
      kicker: index === 0 ? 'START' : 'DETAIL',
      title: stop.label,
      subtitle: stop.detail,
      body: stop.body,
      src: stop.src,
      number: stop.number ?? String(index + 1).padStart(2, '0'),
      time: stop.time,
      distance: stop.distance ?? (
        totalKm * stop.progress < 10
          ? `${(totalKm * stop.progress).toFixed(1)} km from start`
          : `${Math.round(totalKm * stop.progress)} km from start`
      ),
      routeId: story.routeId,
      routeProgress: stop.progress,
      mapRotation: story.mapRotation,
      layout: stop.src ? 'photo-map' : 'minimal',
      transition: 'fade',
      transitionDuration,
      role: 'detail',
      directorNote: 'Turn a waypoint into a human-scale story beat, not another map shot.',
    });
  };

  if (chosenDetails.length > 0) {
    addDetail(chosenDetails[0], stops.indexOf(chosenDetails[0]));
  } else if (director.mapRole !== 'none') {
    push(2.8, {
      id: 'director-context-bridge',
      type: 'text',
      headline: story.subtitle ?? story.title,
      body: first.body ?? director.hook,
      transition: 'fade',
      role: 'bridge',
      directorNote: 'Insert a non-map bridge so orientation and movement never become back-to-back map shots.',
    });
  }

  if (director.mapRole === 'hero') {
    const vehicle = story.vehicle
      ? {type: story.vehicle, scale: 1, showPulse: true}
      : undefined;

    if (director.mapEngine === 'maplibre') {
      push(5.2, {
        id: 'director-travel',
        type: 'maplibre-route',
        title: `${first.label} → ${last.label}`,
        routeId: story.routeId,
        stops: geoStops,
        progress: 1,
        label: `${titleCaseMode(route.mode)} · ${totalKm < 10 ? totalKm.toFixed(1) : Math.round(totalKm)} km`,
        camera: 'follow',
        cameraLead: 0.04,
        cameraZoom: 1.3,
        cameraAnchorY: 0.56,
        showDetails: false,
        graphicFps: 12,
        transition: 'map-reveal',
        transitionDuration,
        role: 'travel',
        directorNote: 'Use the map as the movement hero: smooth camera, stepped editorial overlays.',
      });
    } else {
      push(4.8, {
        id: 'director-travel',
        type: 'geo-route',
        title: 'On the route',
        routeId: story.routeId,
        stops: geoStops,
        progress: Math.max(0.72, last.progress),
        label: `${first.label} → ${last.label}`,
        style: routeStyle,
        showDetails: false,
        mapRotation: story.mapRotation,
        camera: 'follow',
        cameraZoom: director.pacing === 'dynamic' ? 1.42 : 1.3,
        vehicle,
        transition: 'soft-zoom',
        transitionDuration,
        role: 'travel',
        directorNote: 'Make movement legible without repeating the orientation composition.',
      });
    }
  }

  for (const detail of chosenDetails.slice(1)) {
    addDetail(detail, stops.indexOf(detail));
  }

  if (
    story.chapters &&
    director.durationTarget >= 30 &&
    stops.length >= 3
  ) {
    const middleIndex = Math.max(1, Math.floor((stops.length - 1) * 0.55));
    const previous = stops[middleIndex - 1];
    const next = stops[Math.min(stops.length - 1, middleIndex + 1)];
    if (next.progress > previous.progress) {
      push(3.6, {
        id: 'director-route-bridge',
        type: 'route-chapter',
        kicker: 'FINAL MOVEMENT',
        title: `${previous.label} → ${next.label}`,
        subtitle: next.detail,
        routeId: story.routeId,
        startProgress: previous.progress,
        endProgress: next.progress,
        startLabel: previous.label,
        endLabel: next.label,
        mapRotation: story.mapRotation,
        style: routeStyle,
        transition: 'soft-zoom',
        transitionDuration,
        role: 'bridge',
        directorNote: 'Return to geography only after visual detail has reset the rhythm.',
      });
    }
  }

  if (last.src || last.body || last.detail || last.time) {
    push(3.8, {
      id: 'director-arrival',
      type: 'route-stop',
      kicker: 'ARRIVAL',
      title: last.label,
      subtitle: last.detail,
      body: last.body,
      src: last.src,
      number: last.number ?? String(stops.length).padStart(2, '0'),
      time: last.time,
      distance: last.distance ?? (
        totalKm < 10 ? `${totalKm.toFixed(1)} km` : `${Math.round(totalKm)} km`
      ),
      routeId: story.routeId,
      routeProgress: last.progress,
      mapRotation: story.mapRotation,
      layout: last.src ? 'photo-map' : 'minimal',
      transition: 'photo-mask-reveal',
      transitionDuration,
      role: 'detail',
      directorNote: 'Treat arrival as a place, not merely the end of a line.',
    });
  }

  if (lastSrc && lastSrc !== heroSrc) {
    push(4.1, {
      id: 'director-payoff-image',
      type: 'hero-image',
      src: lastSrc,
      kicker: last.label.toUpperCase(),
      title: director.payoff,
      subtitle: story.outroTitle ?? story.subtitle,
      motion: director.pacing === 'dynamic' ? 'cinematic-push' : 'cinematic-pull',
      motionAmount: 0.78,
      transition: 'fade',
      transitionDuration,
      role: 'payoff',
      directorNote: 'End the visual arc on destination emotion rather than another information card.',
    });
  }

  push(2.6, {
    id: 'director-payoff',
    type: 'outro',
    title: story.outroTitle ?? director.payoff,
    subtitle: director.payoff === story.outroTitle ? story.subtitle : last.label,
    motion: 'cinematic-pull',
    motionAmount: 0.72,
    transition: 'fade',
    transitionDuration,
    role: 'payoff',
    directorNote: 'Close on the promise made by the source prompt.',
  });

  return applyTargetDuration(
    drafts,
    director.durationTarget,
    director.pacing,
  );
};
