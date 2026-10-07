import {z} from 'zod';

export const motionPresetSchema = z.enum([
  'none',
  'fade-rise',
  'slow-push',
  'pan-left',
  'pan-right',
  'pop',
  'drift-up',
  'zoom-out',
  'cinematic-push',
  'cinematic-pull',
  'pan-and-zoom',
  'float-horizontal',
]);

export const transitionPresetSchema = z.enum([
  'cut',
  'fade',
  'slide-left',
  'slide-up',
  'wipe',
  'zoom',
  'soft-zoom',
  'whip-left',
  'iris',
]);

const baseScene = z.object({
  id: z.string().min(1),
  duration: z.number().positive(),
  motion: motionPresetSchema.optional(),
  motionAmount: z.number().min(0.25).max(2).default(1),
  transition: transitionPresetSchema.optional(),
  transitionDuration: z.number().min(0.15).max(1.5).optional(),
});

const titleScene = baseScene.extend({
  type: z.literal('title'),
  title: z.string().min(1),
  subtitle: z.string().optional(),
});

const imageScene = baseScene.extend({
  type: z.literal('image'),
  src: z.string().min(1),
  caption: z.string().optional(),
});

const heroImageScene = baseScene.extend({
  type: z.literal('hero-image'),
  src: z.string().min(1),
  kicker: z.string().optional(),
  title: z.string().min(1),
  subtitle: z.string().optional(),
});

const splitImageScene = baseScene.extend({
  type: z.literal('split-image'),
  leftSrc: z.string().min(1),
  rightSrc: z.string().min(1),
  title: z.string().optional(),
  caption: z.string().optional(),
});

const textScene = baseScene.extend({
  type: z.literal('text'),
  headline: z.string().min(1),
  body: z.string().min(1),
});

const quoteScene = baseScene.extend({
  type: z.literal('quote'),
  quote: z.string().min(1),
  attribution: z.string().optional(),
});

const statScene = baseScene.extend({
  type: z.literal('stat'),
  value: z.string().min(1),
  label: z.string().min(1),
});

const listScene = baseScene.extend({
  type: z.literal('list'),
  title: z.string().min(1),
  items: z.array(z.string().min(1)).min(1).max(6),
});

const timelineScene = baseScene.extend({
  type: z.literal('timeline'),
  title: z.string().min(1),
  items: z.array(z.object({
    label: z.string().min(1),
    value: z.string().min(1),
  })).min(2).max(5),
});

const comparisonScene = baseScene.extend({
  type: z.literal('comparison'),
  title: z.string().min(1),
  left: z.object({label: z.string().min(1), value: z.string().min(1)}),
  right: z.object({label: z.string().min(1), value: z.string().min(1)}),
});

const chartScene = baseScene.extend({
  type: z.literal('chart'),
  title: z.string().min(1),
  items: z.array(z.object({
    label: z.string().min(1),
    value: z.number().nonnegative(),
  })).min(2).max(6),
  suffix: z.string().optional(),
});

const photoMaskScene = baseScene.extend({
  type: z.literal('photo-mask'),
  src: z.string().min(1),
  title: z.string().optional(),
  caption: z.string().optional(),
  shape: z.enum(['portrait', 'circle', 'window']).default('portrait'),
  treatment: z.enum(['natural', 'warm', 'dark']).default('natural'),
  frame: z.enum(['none', 'thin', 'offset']).default('none'),
});

const kineticTitleScene = baseScene.extend({
  type: z.literal('kinetic-title'),
  text: z.string().min(1),
  kicker: z.string().optional(),
  style: z.enum(['stacked', 'word-reveal', 'oversize']).default('stacked'),
  align: z.enum(['left', 'center']).default('left'),
  highlight: z.string().optional(),
});

const chapterNumberScene = baseScene.extend({
  type: z.literal('chapter-number'),
  number: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().optional(),
});

const lowerThirdScene = baseScene.extend({
  type: z.literal('lower-third'),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  src: z.string().optional(),
});

const calloutScene = baseScene.extend({
  type: z.literal('callout'),
  title: z.string().min(1),
  body: z.string().min(1),
  value: z.string().optional(),
});

const lineChartScene = baseScene.extend({
  type: z.literal('line-chart'),
  title: z.string().min(1),
  items: z.array(z.object({
    label: z.string().min(1),
    value: z.number(),
  })).min(2).max(10),
  suffix: z.string().optional(),
});

const donutChartScene = baseScene.extend({
  type: z.literal('donut-chart'),
  title: z.string().min(1),
  value: z.number().min(0).max(100),
  label: z.string().min(1),
  suffix: z.string().default('%'),
});

const barLineChartScene = baseScene.extend({
  type: z.literal('bar-line-chart'),
  title: z.string().min(1),
  items: z.array(z.object({
    label: z.string().min(1),
    bar: z.number().nonnegative(),
    line: z.number(),
  })).min(2).max(8),
  barLabel: z.string().optional(),
  lineLabel: z.string().optional(),
  barSuffix: z.string().optional(),
  lineSuffix: z.string().optional(),
});

const routePointSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  label: z.string().min(1),
  detail: z.string().optional(),
  icon: z.enum(['pin', 'temple', 'nature', 'station', 'city']).default('pin'),
});


// Geographic routes use GeoJSON longitude/latitude coordinates, not scene-space X/Y.
// The geometry is committed with the project so every exported frame is deterministic.
export const geoCoordinateSchema = z.tuple([
  z.number().min(-180).max(180),
  z.number().min(-90).max(90),
]);

const geoRouteSchema = z.object({
  type: z.literal('LineString'),
  coordinates: z.array(geoCoordinateSchema).min(2).max(5000),
  mode: z.enum(['rail', 'walking', 'driving']),
  contextLines: z.array(z.array(geoCoordinateSchema).min(2).max(2000)).max(60).optional(),
  source: z.object({
    name: z.string().min(1),
    url: z.string().url(),
    license: z.string().min(1),
  }),
});

const geoStopSchema = z.object({
  coordinates: geoCoordinateSchema,
  label: z.string().min(1),
  detail: z.string().optional(),
  icon: z.enum(['pin', 'temple', 'nature', 'station', 'city']).default('pin'),
});

const geoRouteScene = baseScene.extend({
  type: z.literal('geo-route'),
  title: z.string().min(1),
  routeId: z.string().min(1),
  stops: z.array(geoStopSchema).min(2).max(8),
  progress: z.number().min(0).max(1).default(1),
  label: z.string().optional(),
  distance: z.string().optional(),
  mapRotation: z.number().min(-180).max(180).default(0),
  camera: z.enum(['overview', 'follow']).default('overview'),
  cameraZoom: z.number().min(1).max(2.2).default(1.28),
  style: z.enum(['clean', 'watercolor', 'flow']).default('clean'),
  showDetails: z.boolean().default(true),
});

const routeMapScene = baseScene.extend({
  type: z.literal('route-map'),
  title: z.string().min(1),
  points: z.array(routePointSchema).min(2).max(8),
  distance: z.string().optional(),
  contextPath: z.string().optional(),
  style: z.enum(['clean', 'watercolor', 'flow']).default('clean'),
  showDetails: z.boolean().default(true),
});

const locationCardScene = baseScene.extend({
  type: z.literal('location-card'),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  location: z.string().min(1),
  region: z.string().optional(),
  x: z.number().min(0).max(1).default(0.5),
  y: z.number().min(0).max(1).default(0.5),
  contextPath: z.string().optional(),
});

const progressRouteScene = baseScene.extend({
  type: z.literal('progress-route'),
  title: z.string().min(1),
  points: z.array(routePointSchema).min(2).max(8),
  progress: z.number().min(0).max(1),
  label: z.string().optional(),
  contextPath: z.string().optional(),
  style: z.enum(['clean', 'watercolor', 'flow']).default('clean'),
  showDetails: z.boolean().default(true),
});

const mapOverlayScene = baseScene.extend({
  type: z.literal('map-overlay'),
  title: z.string().min(1),
  src: z.string().optional(),
  points: z.array(routePointSchema).min(2).max(8),
  contextPath: z.string().optional(),
  style: z.enum(['clean', 'watercolor', 'flow']).default('clean'),
  showDetails: z.boolean().default(true),
});

const launchHeroScene = baseScene.extend({
  type: z.literal('launch-hero'),
  eyebrow: z.string().optional(),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  badge: z.string().optional(),
});

const featureGridScene = baseScene.extend({
  type: z.literal('feature-grid'),
  title: z.string().min(1),
  items: z.array(z.object({
    title: z.string().min(1),
    body: z.string().optional(),
    icon: z.enum(['spark', 'grid', 'route', 'chart', 'play', 'code']).default('spark'),
  })).min(2).max(6),
});

const ctaScene = baseScene.extend({
  type: z.literal('cta'),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  action: z.string().optional(),
});

const videoScene = baseScene.extend({
  type: z.literal('video'),
  src: z.string().min(1),
  title: z.string().optional(),
  caption: z.string().optional(),
  muted: z.boolean().default(true),
  loop: z.boolean().default(false),
  trimBefore: z.number().nonnegative().optional(),
});

const captionVideoScene = baseScene.extend({
  type: z.literal('caption-video'),
  src: z.string().min(1),
  muted: z.boolean().default(false),
  loop: z.boolean().default(false),
  trimBefore: z.number().nonnegative().optional(),
  captions: z.array(z.object({
    text: z.string().min(1),
    start: z.number().nonnegative(),
    end: z.number().positive(),
  })).min(1),
});

const outroScene = baseScene.extend({
  type: z.literal('outro'),
  title: z.string().min(1),
  subtitle: z.string().optional(),
});

export const sceneSchema = z.discriminatedUnion('type', [
  titleScene,
  imageScene,
  heroImageScene,
  splitImageScene,
  textScene,
  quoteScene,
  statScene,
  listScene,
  timelineScene,
  comparisonScene,
  chartScene,
  photoMaskScene,
  kineticTitleScene,
  chapterNumberScene,
  lowerThirdScene,
  calloutScene,
  lineChartScene,
  donutChartScene,
  barLineChartScene,
  routeMapScene,
  geoRouteScene,
  locationCardScene,
  progressRouteScene,
  mapOverlayScene,
  launchHeroScene,
  featureGridScene,
  ctaScene,
  videoScene,
  captionVideoScene,
  outroScene,
]);

const audioTrackSchema = z.object({
  src: z.string().min(1),
  volume: z.number().min(0).max(1).default(0.8),
  loop: z.boolean().default(false),
});

export const projectSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  template: z.enum(['travel-story', 'explainer', 'data-story']),
  format: z.enum(['vertical', 'landscape', 'square']),
  fps: z.union([z.literal(24), z.literal(25), z.literal(30), z.literal(50), z.literal(60)]),
  theme: z.object({
    background: z.string().default('#0B0D10'),
    foreground: z.string().default('#F7F8FA'),
    muted: z.string().default('#AEB6C2'),
    accent: z.string().default('#78E08F'),
  }).default({
    background: '#0B0D10',
    foreground: '#F7F8FA',
    muted: '#AEB6C2',
    accent: '#78E08F',
  }),
  geoRoutes: z.record(z.string(), geoRouteSchema).optional(),
  audio: z.object({
    music: audioTrackSchema.optional(),
    voiceover: audioTrackSchema.optional(),
  }).optional(),
  scenes: z.array(sceneSchema).min(1),
});

export type MotionPreset = z.infer<typeof motionPresetSchema>;
export type TransitionPreset = z.infer<typeof transitionPresetSchema>;
export type VideoScene = z.infer<typeof sceneSchema>;
export type GeoRouteGeometry = z.infer<typeof geoRouteSchema>;
export type GeoRouteScene = Extract<VideoScene, {type: 'geo-route'}>;
export type VideoProject = z.infer<typeof projectSchema>;

export const parseProject = (value: unknown): VideoProject => projectSchema.parse(value);

export const getDimensions = (format: VideoProject['format']) => {
  if (format === 'landscape') return {width: 1920, height: 1080};
  if (format === 'square') return {width: 1080, height: 1080};
  return {width: 1080, height: 1920};
};

export const sceneFrames = (scene: VideoScene, fps: number) =>
  Math.max(1, Math.round(scene.duration * fps));

export const transitionFrames = (scene: VideoScene, fps: number) =>
  !scene.transition || scene.transition === 'cut'
    ? 0
    : Math.max(
        1,
        Math.min(
          Math.round(fps * (scene.transitionDuration ?? 0.45)),
          Math.floor(sceneFrames(scene, fps) / 3),
        ),
      );

export const sceneTimeline = (project: VideoProject) => {
  let cursor = 0;

  return project.scenes.map((scene, index) => {
    const durationInFrames = sceneFrames(scene, project.fps);
    const overlap = index === 0 ? 0 : transitionFrames(scene, project.fps);
    const from = Math.max(0, cursor - overlap);
    cursor = from + durationInFrames;
    return {scene, from, durationInFrames, transitionInFrames: overlap};
  });
};

export const projectFrames = (project: VideoProject) => {
  const timeline = sceneTimeline(project);
  const last = timeline[timeline.length - 1];
  return last ? last.from + last.durationInFrames : 1;
};

export const projectHasAudio = (project: VideoProject) =>
  Boolean(
    project.audio?.music ||
    project.audio?.voiceover ||
    project.scenes.some(
      (scene) =>
        (scene.type === 'video' || scene.type === 'caption-video') &&
        scene.muted === false,
    ),
  );
