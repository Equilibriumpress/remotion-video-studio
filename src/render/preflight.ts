import type {VideoProject, VideoScene} from '../project/schema';
import {resolveAsset} from '../project/assets';

export type AssetCheck = {
  source: string;
  ok: boolean;
  message: string;
};

type AssetRef = {source: string; kind: 'image' | 'media' | 'map-style'};

const sceneAssets = (scene: VideoScene): AssetRef[] => {
  switch (scene.type) {
    case 'image':
    case 'hero-image':
    case 'photo-mask':
      return [{source: scene.src, kind: 'image'}];
    case 'split-image':
      return [
        {source: scene.leftSrc, kind: 'image'},
        {source: scene.rightSrc, kind: 'image'},
      ];
    case 'video':
    case 'caption-video':
    case 'lottie':
      return [{source: scene.src, kind: 'media'}];
    case 'map-overlay':
    case 'lower-third':
      return scene.src ? [{source: scene.src, kind: 'image'}] : [];
    case 'maplibre-route':
      return [{source: scene.mapStyleUrl, kind: 'map-style'}];
    default:
      return [];
  }
};

const loadImage = (source: string) =>
  new Promise<boolean>((resolve) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(true);
    image.onerror = () => resolve(false);
    image.src = source;
  });

const checkMedia = async (source: string) => {
  try {
    const response = await fetch(source, {method: 'HEAD'});
    return response.ok;
  } catch {
    return false;
  }
};

const checkMapStyle = async (source: string) => {
  try {
    const response = await fetch(source, {method: 'GET', mode: 'cors'});
    if (!response.ok) return false;
    const style = await response.json();
    return Boolean(style && typeof style === 'object' && 'sources' in style);
  } catch {
    return false;
  }
};

export const checkProjectAssets = async (project: VideoProject): Promise<AssetCheck[]> => {
  const refs: AssetRef[] = project.scenes.flatMap(sceneAssets);

  if (project.audio?.music) refs.push({source: project.audio.music.src, kind: 'media'});
  if (project.audio?.voiceover) refs.push({source: project.audio.voiceover.src, kind: 'media'});

  const unique = [...new Map(refs.map((ref) => [ref.source, ref])).values()];
  const checks: AssetCheck[] = [];

  for (const ref of unique) {
    const resolved = resolveAsset(ref.source);
    const external = /^https?:\/\//.test(ref.source) && !resolved.startsWith(window.location.origin);
    const trustedRemote = external && (() => {
      try {
        const hostname = new URL(ref.source).hostname;
        return hostname === 'upload.wikimedia.org' || hostname === 'thumb.wikimedia.org';
      } catch {
        return false;
      }
    })();

    if (external && !trustedRemote && ref.kind !== 'map-style') {
      checks.push({
        source: ref.source,
        ok: false,
        message: 'Remote assets are blocked for reliable browser rendering. Store this file in public/media.',
      });
      continue;
    }

    const ok = ref.kind === 'image'
      ? await loadImage(resolved)
      : ref.kind === 'map-style'
        ? await checkMapStyle(ref.source)
        : await checkMedia(resolved);
    checks.push({
      source: ref.source,
      ok,
      message: ok
        ? ref.kind === 'map-style' ? 'Map style reachable' : 'Ready'
        : ref.kind === 'map-style' ? 'Map style failed to load' : 'Asset failed to load',
    });
  }

  return checks;
};
