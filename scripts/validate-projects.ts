import {existsSync, readFileSync, readdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {projectSchema, type VideoProject, type VideoScene} from '../src/project/schema';

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
      return [scene.src];
    case 'split-image':
      return [scene.leftSrc, scene.rightSrc];
    case 'map-overlay':
    case 'lower-third':
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
    const project = projectSchema.parse(raw);

    if (projectIds.has(project.id)) {
      errors.push(`${file}: duplicate project id "${project.id}"`);
    }
    projectIds.add(project.id);

    const sceneIds = new Set<string>();
    for (const scene of project.scenes) {
      if (sceneIds.has(scene.id)) {
        errors.push(`${file}: duplicate scene id "${scene.id}"`);
      }
      sceneIds.add(scene.id);

      if (scene.type === 'caption-video') {
        for (const caption of scene.captions) {
          if (caption.end <= caption.start) {
            errors.push(`${file}: caption "${caption.text}" ends before it starts`);
          }
          if (caption.end > scene.duration) {
            errors.push(`${file}: caption "${caption.text}" exceeds scene duration`);
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
