import {useLayoutEffect, useRef} from 'react';
import type {VideoProject, VideoScene} from '../project/schema';
import {drawAnimateFrame} from './draw';

const ratio = 240 / 135;

function BoardTile({scene, index}: {scene: Extract<VideoScene, {type: 'animate-canvas'}>; index: number}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const ctx = canvas.current?.getContext('2d');
    if (ctx) drawAnimateFrame(ctx, {width: 240, height: 135, style: scene.style, title: scene.title, subtitle: scene.subtitle, seed: scene.seed, motif: scene.motif, camera: scene.camera, elements: scene.elements, figures: scene.figures, morph: scene.morph, paperObjects: scene.paperObjects, beatCues: scene.beatCues, duration: scene.duration, special: scene.special, cinematicShot: scene.cinematicShot, handoff: scene.handoff, progress: 0.8});
  }, [scene]);
  return (
    <div style={{minWidth: 150, flex: '1 1 180px', maxWidth: 280}}>
      <canvas ref={canvas} width={240} height={135} style={{width: '100%', aspectRatio: String(ratio), borderRadius: 8, display: 'block'}} />
      <p style={{margin: '6px 0 2px', fontSize: 12, fontWeight: 700}}>{String(index + 1).padStart(2, '0')} · {scene.title}</p>
      <small style={{opacity: 0.7}}>{scene.style} · {scene.duration}s</small>
    </div>
  );
}

export function AnimateStoryboard({project}: {project: VideoProject}) {
  const scenes = project.scenes.filter((scene): scene is Extract<VideoScene, {type: 'animate-canvas'}> => scene.type === 'animate-canvas');
  if (scenes.length === 0) return null;
  return (
    <section aria-label="Animation storyboard" style={{marginTop: 20, padding: 16, border: '1px solid #66708555', borderRadius: 12}}>
      <h3 style={{margin: '0 0 12px', fontSize: 16}}>Animation storyboard</h3>
      <div style={{display: 'flex', flexWrap: 'wrap', gap: 12}}>
        {scenes.map((scene, index) => <BoardTile scene={scene} index={index} key={scene.id} />)}
      </div>
    </section>
  );
}
