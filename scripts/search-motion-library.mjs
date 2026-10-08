import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

// Authoring-only tool. Never import the 201 third-party components into Vite.
const catalogUrl = new URL('../reference/lifeprompt-team/remotion-scenes/catalog.json', import.meta.url);
export const motionLibrary = JSON.parse(readFileSync(catalogUrl, 'utf8'));

const expansions = {
  travel: ['travel', 'documentary', 'cinematic', 'editorial', 'natural', 'watercolor'],
  roadtrip: ['travel', 'route', 'documentary', 'cinematic'],
  trip: ['travel', 'route', 'cinematic'],
  route: ['route', 'timeline', 'line', 'progress'],
  japan: ['japan', 'kyoto', 'japanese', 'sakura', 'watercolor'],
  kyoto: ['kyoto', 'japan', 'sakura', 'watercolor'],
  tokyo: ['japan', 'documentary', 'cinematic'],
  nature: ['nature', 'natural', 'watercolor'],
  coast: ['sea', 'coast', 'water', 'waves'],
  cinematic: ['cinematic', 'documentary', 'title'],
  premium: ['cinematic', 'minimalist', 'documentary', 'editorial'],
  editorial: ['documentary', 'minimalist', 'watercolor'],
  intro: ['title', 'opening', 'kinetic'],
  outro: ['title', 'closing', 'logo'],
  title: ['title', 'kinetic', 'text', 'cinematic'],
  transitions: ['transition'],
  transition: ['transition'],
  data: ['data', 'stats', 'chart'],
  map: ['map', 'route', 'line', 'timeline'],
  graphs: ['data', 'chart', 'graph'],
  background: ['background', 'ambient', 'gradient'],
  photo: ['photo', 'reveal', 'mask'],
  minimal: ['minimalist', 'clean'],
  fast: ['kinetic', 'energetic'],
  caption: ['caption', 'typewriter', 'text'],
  reizen: ['travel', 'documentary', 'cinematic'],
  reis: ['travel', 'editorial', 'documentary'],
  kaarten: ['map', 'route', 'timeline'],
  kaart: ['map', 'route', 'timeline'],
  titel: ['title', 'kinetic', 'text'],
  overgang: ['transition'],
  overgangen: ['transition'],
  achtergrond: ['background', 'ambient', 'gradient'],
  rustig: ['minimalist', 'editorial', 'watercolor'],
  dynamisch: ['kinetic', 'energetic'],
  grafiek: ['data', 'chart'],
};
const tokens = (value) => (value.toLowerCase().match(/[a-z0-9]+/g) || []).filter((s) => s.length > 2);

export function searchMotionLibrary(prompt, limit = 12) {
  const requested = new Set(tokens(prompt));
  const related = new Set([...requested].flatMap((term) => expansions[term] || []));
  const matches = motionLibrary.scenes.map((scene) => {
    const keywords = new Set([...scene.tags, scene.role, scene.category.toLowerCase()]);
    const name = scene.id.toLowerCase();
    let score = 0;
    for (const token of requested) {
      if (name === token) score += 30;
      else if (name.includes(token)) score += 8;
      if (keywords.has(token)) score += 6;
    }
    for (const term of related) if (keywords.has(term) || name.includes(term)) score += 2;
    if (scene.compatibility === 'webgl-review') score -= 8;
    if (scene.compatibility === 'performance-review') score -= 2;
    return {id: scene.id, category: scene.category, role: scene.role, score, compatibility: scene.compatibility, sourceUrl: scene.sourceUrl};
  });
  return matches.filter((x) => x.score > 0).sort((a, b) => b.score - a.score || a.id.localeCompare(b.id)).slice(0, Math.max(1, Math.min(100, limit)));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const args = process.argv.slice(2);
  if (!args.length) {
    console.error('Usage: npm run motion:find -- "Kyoto travel watercolor titles"');
    process.exitCode = 2;
  } else {
    const output = searchMotionLibrary(args.join(' '));
    console.log(JSON.stringify({prompt: args.join(' '), catalogCount: motionLibrary.count, matches: output}, null, 2));
  }
}
