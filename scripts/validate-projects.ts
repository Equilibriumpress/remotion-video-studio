import {existsSync, readFileSync, readdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {projectSchema} from '../src/project/schema';

const root = process.cwd();
const projectDir = resolve(root, 'projects');
const files = readdirSync(projectDir).filter((file) => file.endsWith('.json'));
const projectIds = new Set<string>();
const errors: string[] = [];

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

      if (scene.type === 'image' && !/^https?:\/\//.test(scene.src) && !scene.src.startsWith('data:')) {
        const assetPath = resolve(root, 'public', scene.src.replace(/^\//, ''));
        if (!existsSync(assetPath)) {
          errors.push(`${file}: missing image asset "${scene.src}"`);
        }
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
