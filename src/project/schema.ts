import {z} from 'zod';
import {composeTravelSequence} from './travelSequence';
import {composePremiumSequence} from './premiumDirector';

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
  'map-reveal',
  'photo-mask-reveal',
  'split-grid',
]);

const baseScene = z.object({
  id: z.string().min(1),
  duration: z.number().positive(),
  motion: motionPresetSchema.optional(),
  motionAmount: z.number().min(0.25).max(2).default(1),
  transition: transitionPresetSchema.optional(),
  transitionDuration: z.number().min(0.15).max(1.5).optional(),
  motionBlur: z.object({
    shutterAngle: z.number().min(0).max(360).default(120),
    samples: z.number().int().min(2).max(12).default(5),
  }).optional(),
  beatSync: z.object({
    beats: z.array(z.number().nonnegative()).min(1).max(96),
    strength: z.number().min(0.005).max(0.15).default(0.035),
    decaySeconds: z.number().min(0.05).max(0.5).default(0.16),
  }).optional(),
  role: z.enum(['hook', 'orient', 'travel', 'detail', 'bridge', 'payoff']).optional(),
  directorNote: z.string().max(240).optional(),
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
  style: z.enum(['stacked', 'word-reveal', 'oversize', 'split', 'zoom']).default('stacked'),
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

const storyStopSchema = geoStopSchema.extend({
  src: z.string().optional(),
  body: z.string().optional(),
  time: z.string().optional(),
  distance: z.string().optional(),
  number: z.string().optional(),
});

const travelStoryConfigSchema = z.object({
  routeId: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  style: z.enum(['cinematic', 'editorial', 'clean']).default('cinematic'),
  vehicle: z.enum(['train', 'car', 'walker', 'bike', 'plane']).optional(),
  stops: z.array(storyStopSchema).min(2).max(8),
  introImage: z.string().optional(),
  outroTitle: z.string().optional(),
  elevationProfileId: z.string().optional(),
  overview: z.boolean().default(true),
  chapters: z.boolean().default(true),
  stopCards: z.boolean().default(true),
  mapRotation: z.number().min(-180).max(180).default(0),
  mode: z.enum(['replace', 'append']).default('replace'),
});

const elevationSampleSchema = z.object({
  distanceKm: z.number().nonnegative(),
  elevationM: z.number(),
  label: z.string().optional(),
});

const elevationProfileSchema = z.object({
  routeId: z.string().optional(),
  samples: z.array(elevationSampleSchema).min(2).max(5000),
  source: z.object({
    name: z.string().min(1),
    license: z.string().min(1).optional(),
  }).optional(),
});


const appStoreCreativeScene = baseScene.extend({
  type: z.literal('appstore-creative'),
  routeId: z.string().min(1),
  photoSrc: z.string().min(1),
  secondaryPhotoSrc: z.string().optional(),
  mapRotation: z.number().min(-180).max(180).default(0),
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
  vehicle: z.object({
    type: z.enum(['train', 'car', 'walker', 'bike', 'plane']),
    scale: z.number().min(0.5).max(2).default(1),
    color: z.string().optional(),
    showPulse: z.boolean().default(true),
  }).optional(),
  style: z.enum(['clean', 'watercolor', 'flow']).default('clean'),
  showDetails: z.boolean().default(true),
});

const elevationRouteScene = baseScene.extend({
  type: z.literal('elevation-route'),
  title: z.string().min(1),
  profileId: z.string().min(1),
  progress: z.number().min(0).max(1).default(1),
  label: z.string().optional(),
  showStats: z.boolean().default(true),
});

const mapLibreRouteScene = baseScene.extend({
  type: z.literal('maplibre-route'),
  title: z.string().min(1),
  routeId: z.string().min(1),
  stops: z.array(geoStopSchema).min(2).max(8),
  progress: z.number().min(0).max(1).default(1),
  label: z.string().optional(),
  camera: z.enum(['follow', 'overview']).default('follow'),
  cameraRouteId: z.string().min(1).optional(),
  cameraLead: z.number().min(0).max(0.25).default(0.035),
  cameraZoom: z.number().min(1).max(1.5).default(1.3),
  cameraAnchorY: z.number().min(0.35).max(0.75).default(0.56),
  altitude: z.number().min(500).max(50000).default(8000),
  mapStyleUrl: z.string().url().default('https://tiles.openfreemap.org/styles/liberty'),
  routeColor: z.string().default('#111827'),
  markerColor: z.string().default('#ef4444'),
  showDetails: z.boolean().default(true),
  graphicFps: z.number().min(6).max(60).default(30),
});

const editorialMapScene = baseScene.extend({
  type: z.literal('editorial-map'),
  title: z.string().min(1),
  kicker: z.string().optional(),
  region: z.string().optional(),
  stat: z.string().optional(),
  routeId: z.string().min(1),
  stops: z.array(geoStopSchema).min(2).max(8),
  progress: z.number().min(0).max(1).default(1),
  showDetails: z.boolean().default(true),
  graphicFps: z.number().min(6).max(60).default(30),
});

const travelHudScene = baseScene.extend({
  type: z.literal('travel-hud'),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  kicker: z.string().optional(),
  src: z.string().optional(),
  metrics: z.array(z.object({
    label: z.string().min(1),
    value: z.string().min(1),
  })).min(2).max(4),
});

const threeGlobeScene = baseScene.extend({
  type: z.literal('three-globe'),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  stops: z.array(geoStopSchema).min(2).max(6),
  globeColor: z.string().default('#0B132B'),
  routeColor: z.string().default('#FFB703'),
  markerColor: z.string().default('#FFFFFF'),
  atmosphereColor: z.string().default('#5BC0EB'),
  arcHeight: z.number().min(0.03).max(0.7).default(0.2),
  globeRotation: z.number().min(-180).max(180).default(0),
  cameraDistance: z.number().min(2.5).max(6).default(3.5),
  autoRotate: z.number().min(-1).max(1).default(0.16),
  showGrid: z.boolean().default(true),
  showDetails: z.boolean().default(true),
});

const routeChapterScene = baseScene.extend({
  type: z.literal('route-chapter'),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  kicker: z.string().optional(),
  routeId: z.string().min(1),
  startProgress: z.number().min(0).max(1).default(0),
  endProgress: z.number().min(0).max(1).default(1),
  startLabel: z.string().optional(),
  endLabel: z.string().optional(),
  distance: z.string().optional(),
  travelTime: z.string().optional(),
  mapRotation: z.number().min(-180).max(180).default(0),
  style: z.enum(['clean', 'watercolor', 'flow']).default('clean'),
});

const routeStopScene = baseScene.extend({
  type: z.literal('route-stop'),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  kicker: z.string().optional(),
  body: z.string().optional(),
  src: z.string().optional(),
  number: z.string().optional(),
  time: z.string().optional(),
  distance: z.string().optional(),
  routeId: z.string().optional(),
  routeProgress: z.number().min(0).max(1).default(0),
  mapRotation: z.number().min(-180).max(180).default(0),
  layout: z.enum(['editorial', 'minimal', 'split', 'photo-map']).default('editorial'),
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

const lottieScene = baseScene.extend({
  type: z.literal('lottie'),
  src: z.string().min(1),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  loop: z.boolean().default(true),
  playbackRate: z.number().min(0.25).max(4).default(1),
  size: z.number().min(0.2).max(0.9).default(0.52),
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

const captionStyleSchema = z.enum([
  'basic',
  'tiktok',
  'word-highlight',
  'editorial-highlight',
  'karaoke',
  'pill',
  'cinematic',
]);

const captionSegmentSchema = z.object({
  text: z.string().min(1),
  start: z.number().nonnegative(),
  end: z.number().positive(),
  pageBreakAfter: z.boolean().optional(),
});

const captionOptions = {
  captionStyle: captionStyleSchema.default('word-highlight'),
  captionPosition: z.enum(['bottom', 'center']).default('bottom'),
  emphasisWords: z.array(z.string().min(1)).max(16).default([]),
  combineTokensWithinMilliseconds: z.number().int().min(150).max(3000).default(1100),
  breakOnSilenceAfterMilliseconds: z.number().int().min(0).max(3000).optional(),
  captions: z.array(captionSegmentSchema).min(1),
};

const captionVideoScene = baseScene.extend({
  type: z.literal('caption-video'),
  src: z.string().min(1),
  muted: z.boolean().default(false),
  loop: z.boolean().default(false),
  trimBefore: z.number().nonnegative().optional(),
  ...captionOptions,
});

const captionDemoScene = baseScene.extend({
  type: z.literal('caption-demo'),
  title: z.string().optional(),
  background: z.enum(['dark', 'paper', 'gradient']).default('dark'),
  ...captionOptions,
});

const audioReactiveScene = baseScene.extend({
  type: z.literal('audio-reactive'),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  mode: z.enum(['bars', 'pulse', 'orbit']).default('bars'),
  energy: z.array(z.number().min(0).max(1)).min(8).max(240),
  sensitivity: z.number().min(0.4).max(2).default(1),
});

const threeVehicleScene = baseScene.extend({
  type: z.literal('three-vehicle'),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  vehicle: z.enum(['train', 'plane', 'car']),
  vehicleColor: z.string().default('#F8FAFC'),
  accentColor: z.string().default('#75D7DE'),
  pathStyle: z.enum(['straight', 'curve', 's-curve']).default('curve'),
  cameraAngle: z.enum(['low', 'side', 'three-quarter']).default('three-quarter'),
  showTrail: z.boolean().default(true),
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
  appStoreCreativeScene,
  geoRouteScene,
  mapLibreRouteScene,
  editorialMapScene,
  travelHudScene,
  threeGlobeScene,
  elevationRouteScene,
  routeChapterScene,
  routeStopScene,
  locationCardScene,
  progressRouteScene,
  mapOverlayScene,
  launchHeroScene,
  featureGridScene,
  ctaScene,
  lottieScene,
  videoScene,
  captionVideoScene,
  captionDemoScene,
  audioReactiveScene,
  threeVehicleScene,
  outroScene,
]);

const audioTrackSchema = z.object({
  src: z.string().min(1),
  volume: z.number().min(0).max(1).default(0.8),
  loop: z.boolean().default(false),
});


const premiumDirectorSchema = z.object({
  sourcePrompt: z.string().min(8).max(1400),
  goal: z.enum(['inspire', 'explain', 'promote', 'document']).default('inspire'),
  audience: z.string().max(160).optional(),
  durationTarget: z.number().min(15).max(75).default(35),
  narrative: z.enum(['journey', 'discovery', 'contrast', 'guide']).default('journey'),
  pacing: z.enum(['calm', 'balanced', 'dynamic']).default('balanced'),
  visualLanguage: z.enum(['editorial', 'cinematic', 'minimal', 'energetic']).default('cinematic'),
  mapRole: z.enum(['none', 'orient', 'hero']).default('orient'),
  mapEngine: z.enum(['svg', 'editorial', 'maplibre']).default('editorial'),
  assetBalance: z.enum(['photo-led', 'balanced', 'map-led']).default('balanced'),
  hook: z.string().min(1).max(140),
  payoff: z.string().min(1).max(180),
  avoid: z.array(z.enum([
    'back-to-back-maps',
    'hard-cuts',
    'dense-text',
    'repeated-layouts',
    'excessive-ui',
  ])).max(5).default([
    'back-to-back-maps',
    'dense-text',
    'repeated-layouts',
  ]),
});

const motionDirectionSchema = z.object({
  personality: z.enum(['premium', 'corporate', 'playful', 'energetic']).default('premium'),
  baseTimingSeconds: z.number().min(0.15).max(1.2).default(0.45),
  focalPoint: z.enum(['left-third', 'center', 'right-third']).default('center'),
  transitionFamily: z.enum(['fade', 'push', 'mask', 'mixed']).default('mixed'),
  notes: z.string().max(500).optional(),
});

const voiceoverCueSchema = z.object({
  sceneId: z.string().min(1),
  text: z.string().min(1).max(500),
});

const youtubeOverlaySchema = z.object({
  from: z.number().nonnegative(),
  scene: sceneSchema,
});

const youtubeChapterSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  script: z.string().max(4000).optional(),
  duration: z.number().min(2).max(180),
  base: sceneSchema,
  overlays: z.array(youtubeOverlaySchema).max(24).default([]),
  captions: z.array(captionSegmentSchema).max(240).default([]),
  captionStyle: captionStyleSchema.default('basic'),
});

const youtubeEndCardSchema = z.object({
  duration: z.number().min(5).max(30).default(12),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  channelName: z.string().min(1),
  channelHandle: z.string().optional(),
  subscribeLabel: z.string().default('Subscribe'),
  avatarSrc: z.string().optional(),
});

const youtubeThumbnailSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  src: z.string().optional(),
});

const youtubeStorySchema = z.object({
  title: z.string().min(1),
  voiceover: audioTrackSchema.optional(),
  music: audioTrackSchema.optional(),
  chapters: z.array(youtubeChapterSchema).min(1).max(20),
  endCard: youtubeEndCardSchema.optional(),
  thumbnail: youtubeThumbnailSchema.optional(),
});

const projectObjectSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  template: z.enum(['travel-story', 'youtube-story', 'explainer', 'data-story']),
  format: z.enum(['vertical', 'landscape', 'square', 'appstore-header', 'appstore-search']),
  fps: z.union([z.literal(24), z.literal(25), z.literal(30), z.literal(50), z.literal(60)]),
  direction: motionDirectionSchema.optional(),
  director: premiumDirectorSchema.optional(),
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
  elevationProfiles: z.record(z.string(), elevationProfileSchema).optional(),
  story: travelStoryConfigSchema.optional(),
  youtube: youtubeStorySchema.optional(),
  audio: z.object({
    music: audioTrackSchema.optional(),
    voiceover: audioTrackSchema.optional(),
  }).optional(),
  voiceoverScript: z.array(voiceoverCueSchema).max(64).optional(),
  scenes: z.array(sceneSchema).default([]),
});

export const projectSchema = projectObjectSchema.superRefine((project, ctx) => {
  if (project.scenes.length === 0 && !project.story && !project.youtube) {
    ctx.addIssue({
      code: 'custom',
      path: ['scenes'],
      message: 'A project needs explicit scenes, a travel story, or a YouTube story configuration',
    });
  }
  if (project.director && !project.story) {
    ctx.addIssue({
      code: 'custom',
      path: ['director'],
      message: 'Premium Director currently requires a travel story configuration',
    });
  }

  project.youtube?.chapters.forEach((chapter, chapterIndex) => {
    chapter.overlays.forEach((overlay, overlayIndex) => {
      if (overlay.from + overlay.scene.duration > chapter.duration + 0.001) {
        ctx.addIssue({
          code: 'custom',
          path: ['youtube', 'chapters', chapterIndex, 'overlays', overlayIndex],
          message: `Overlay "${overlay.scene.id}" exceeds chapter "${chapter.id}" duration`,
        });
      }
    });

    chapter.captions.forEach((caption, captionIndex) => {
      if (caption.end > chapter.duration + 0.001) {
        ctx.addIssue({
          code: 'custom',
          path: ['youtube', 'chapters', chapterIndex, 'captions', captionIndex],
          message: `Caption exceeds chapter "${chapter.id}" duration`,
        });
      }
    });
  });
});

export type MotionPreset = z.infer<typeof motionPresetSchema>;
export type MotionDirection = z.infer<typeof motionDirectionSchema>;
export type PremiumDirector = z.infer<typeof premiumDirectorSchema>;
export type YouTubeStory = z.infer<typeof youtubeStorySchema>;
export type YouTubeChapter = z.infer<typeof youtubeChapterSchema>;
export type TransitionPreset = z.infer<typeof transitionPresetSchema>;
export type VideoScene = z.infer<typeof sceneSchema>;
export type GeoRouteGeometry = z.infer<typeof geoRouteSchema>;
export type AppStoreCreativeScene = Extract<VideoScene, {type: 'appstore-creative'}>;
export type GeoRouteScene = Extract<VideoScene, {type: 'geo-route'}>;
export type MapLibreRouteScene = Extract<VideoScene, {type: 'maplibre-route'}>;
export type EditorialMapScene = Extract<VideoScene, {type: 'editorial-map'}>;
export type TravelHudScene = Extract<VideoScene, {type: 'travel-hud'}>;
export type ThreeGlobeScene = Extract<VideoScene, {type: 'three-globe'}>;
export type CaptionDemoScene = Extract<VideoScene, {type: 'caption-demo'}>;
export type AudioReactiveScene = Extract<VideoScene, {type: 'audio-reactive'}>;
export type ThreeVehicleScene = Extract<VideoScene, {type: 'three-vehicle'}>;
export type ElevationProfile = z.infer<typeof elevationProfileSchema>;
export type ElevationRouteScene = Extract<VideoScene, {type: 'elevation-route'}>;
export type RouteChapterScene = Extract<VideoScene, {type: 'route-chapter'}>;
export type RouteStopScene = Extract<VideoScene, {type: 'route-stop'}>;
export type LottieScene = Extract<VideoScene, {type: 'lottie'}>;
export type VideoProject = z.infer<typeof projectSchema>;

export const parseProject = (value: unknown): VideoProject => {
  const parsed = projectSchema.parse(value);
  if (!parsed.story) return parsed;
  const generated = z.array(sceneSchema).parse(
    parsed.director ? composePremiumSequence(parsed) : composeTravelSequence(parsed),
  );
  const derivedDirection = parsed.direction ?? (
    parsed.director
      ? {
          personality:
            parsed.director.visualLanguage === 'energetic' || parsed.director.pacing === 'dynamic'
              ? 'energetic' as const
              : parsed.director.visualLanguage === 'minimal'
                ? 'corporate' as const
                : 'premium' as const,
          baseTimingSeconds:
            parsed.director.pacing === 'calm'
              ? 0.58
              : parsed.director.pacing === 'dynamic'
                ? 0.32
                : 0.46,
          focalPoint: 'center' as const,
          transitionFamily:
            parsed.director.visualLanguage === 'editorial'
              ? 'mask' as const
              : parsed.director.pacing === 'dynamic'
                ? 'mixed' as const
                : 'fade' as const,
          notes: `Derived from Premium Director: ${parsed.director.visualLanguage} / ${parsed.director.pacing}`,
        }
      : undefined
  );
  return {
    ...parsed,
    direction: derivedDirection,
    scenes: parsed.story.mode === 'append'
      ? [...parsed.scenes, ...generated]
      : generated,
  };
};

export const getDimensions = (format: VideoProject['format']) => {
  if (format === 'appstore-header') return {width: 3840, height: 1646};
  if (format === 'appstore-search') return {width: 1920, height: 1280};
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
  if (project.youtube) {
    const seconds =
      project.youtube.chapters.reduce((sum, chapter) => sum + chapter.duration, 0) +
      (project.youtube.endCard?.duration ?? 0);
    return Math.max(1, Math.round(seconds * project.fps));
  }

  const timeline = sceneTimeline(project);
  const last = timeline[timeline.length - 1];
  return last ? last.from + last.durationInFrames : 1;
};

export const projectVisualScenes = (project: VideoProject): VideoScene[] => [
  ...project.scenes,
  ...(project.youtube?.chapters.flatMap((chapter) => [
    chapter.base,
    ...chapter.overlays.map((overlay) => overlay.scene),
  ]) ?? []),
];

export const projectHasAudio = (project: VideoProject) =>
  Boolean(
    project.audio?.music ||
    project.audio?.voiceover ||
    project.youtube?.music ||
    project.youtube?.voiceover ||
    projectVisualScenes(project).some(
      (scene) =>
        (scene.type === 'video' || scene.type === 'caption-video') &&
        scene.muted === false,
    ),
  );
