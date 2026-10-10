import {useLayoutEffect, useRef} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {drawAnimateFrame} from './draw';
import {KyotoLayeredScene} from './cinematic/KyotoLayeredScene';
import type {VideoScene} from '../project/schema';

export function AnimateScene({scene}: {scene: Extract<VideoScene, {type: 'animate-canvas'}>}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  useLayoutEffect(() => {
    const ctx = canvas.current?.getContext('2d', {alpha: false});
    if (!ctx) return;
    drawAnimateFrame(ctx, {
      width, height, style: scene.style, title: scene.title,
      subtitle: scene.subtitle, seed: scene.seed, motif: scene.motif, camera: scene.camera, elements: scene.elements, handoff: scene.handoff, figures: scene.figures, morph: scene.morph, paperObjects: scene.paperObjects, beatCues: scene.beatCues, duration: scene.duration, special: scene.special, cinematicShot: scene.cinematicShot, frame, frames: Math.round(scene.duration * fps),
      progress: Math.min(1, Math.max(0, frame / Math.max(1, Math.round(scene.duration * fps) - 1))),
    });
  }, [frame, scene, fps, width, height]);
  if(scene.svgFilmShot)return <KyotoLayeredScene shot={scene.svgFilmShot} duration={scene.duration}/>;
  return <AbsoluteFill><canvas ref={canvas} width={width} height={height} style={{width: '100%', height: '100%', display: 'block'}} /></AbsoluteFill>;
}
