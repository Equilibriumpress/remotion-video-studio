import {z} from 'zod';

const baseScene = z.object({
  id: z.string().min(1),
  duration: z.number().positive(),
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

const textScene = baseScene.extend({
  type: z.literal('text'),
  headline: z.string().min(1),
  body: z.string().min(1),
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

const outroScene = baseScene.extend({
  type: z.literal('outro'),
  title: z.string().min(1),
  subtitle: z.string().optional(),
});

export const sceneSchema = z.discriminatedUnion('type', [
  titleScene,
  imageScene,
  textScene,
  statScene,
  listScene,
  outroScene,
]);

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
  scenes: z.array(sceneSchema).min(1),
});

export type VideoScene = z.infer<typeof sceneSchema>;
export type VideoProject = z.infer<typeof projectSchema>;

export const parseProject = (value: unknown): VideoProject => projectSchema.parse(value);

export const getDimensions = (format: VideoProject['format']) => {
  if (format === 'landscape') return {width: 1920, height: 1080};
  if (format === 'square') return {width: 1080, height: 1080};
  return {width: 1080, height: 1920};
};

export const sceneFrames = (scene: VideoScene, fps: number) =>
  Math.max(1, Math.round(scene.duration * fps));

export const projectFrames = (project: VideoProject) =>
  project.scenes.reduce((total, scene) => total + sceneFrames(scene, project.fps), 0);
