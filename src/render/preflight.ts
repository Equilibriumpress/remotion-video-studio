import type {VideoProject} from '../project/schema';
import {resolveAsset} from '../project/assets';

export type AssetCheck = {
  source: string;
  ok: boolean;
  message: string;
};

const loadImage = (source: string) =>
  new Promise<boolean>((resolve) => {
    const image = new Image();
    image.onload = () => resolve(true);
    image.onerror = () => resolve(false);
    image.src = source;
  });

export const checkProjectAssets = async (project: VideoProject): Promise<AssetCheck[]> => {
  const sources = [...new Set(
    project.scenes
      .filter((scene) => scene.type === 'image')
      .map((scene) => scene.src),
  )];

  const checks: AssetCheck[] = [];

  for (const source of sources) {
    const resolved = resolveAsset(source);
    const external = /^https?:\/\//.test(source) && !resolved.startsWith(window.location.origin);

    if (external) {
      checks.push({
        source,
        ok: false,
        message: 'Remote assets are blocked for reliable canvas rendering. Store this file in public/media.',
      });
      continue;
    }

    const ok = await loadImage(resolved);
    checks.push({
      source,
      ok,
      message: ok ? 'Ready' : 'Asset failed to load',
    });
  }

  return checks;
};
