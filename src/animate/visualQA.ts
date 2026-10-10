import type {VideoProject} from '../project/schema';
import {getDimensions, sceneTimeline} from '../project/schema';
import {animateStyles} from './styles';
import {drawAnimateFrame} from './draw';

export type AnimateIssue = {sceneId: string; severity: 'warning' | 'error'; message: string};
export const inspectAnimateProject = (project: VideoProject): AnimateIssue[] => {
  const issues: AnimateIssue[] = [];
  const {width, height} = getDimensions(project.format);
  const scenes = project.scenes.filter((scene) => scene.type === 'animate-canvas');
  const canvas = document.createElement('canvas');
  canvas.width = Math.min(720, width);
  canvas.height = Math.round(canvas.width * height / width);
  const ctx = canvas.getContext('2d', {willReadFrequently: true});
  if (!ctx) return [{sceneId: 'project', severity: 'error', message: 'Canvas 2D unavailable'}];
  for (const scene of scenes) {
    const palette = animateStyles[scene.style];
    const fontSize = Math.round(Math.min(canvas.width * .078, canvas.height * .061));
    ctx.font = `700 ${fontSize}px Georgia, serif`;
    const words = scene.title.split(/\s+/);
    if (words.some(word => ctx.measureText(word).width > canvas.width * .8)) {
      issues.push({sceneId: scene.id, severity: 'error', message: 'Title contains a word that exceeds the 80% text-safe width'});
    }
    if (scene.title.length > 75) issues.push({sceneId: scene.id, severity: 'warning', message: 'Long title risks more than three lines'});
    if (scene.subtitle && scene.subtitle.length > 55) issues.push({sceneId: scene.id, severity: 'warning', message: 'Subtitle might overflow the safe area'});
    if (scene.duration < 2) issues.push({sceneId: scene.id, severity: 'warning', message: 'Illustration reveals too quickly'});
    const start = ctx.getImageData(0, 0, 1, 1);
    drawAnimateFrame(ctx, {width: canvas.width, height: canvas.height, style: scene.style, title: scene.title, subtitle: scene.subtitle, progress: .82, seed: scene.seed});
    const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let nonBackground = 0;
    const color = palette.background.slice(1).match(/.{2}/g)?.map(v => parseInt(v, 16)) ?? [255,255,255];
    for (let i = 0; i < image.data.length; i += 64) {
      if (Math.abs(image.data[i] - color[0]) + Math.abs(image.data[i + 1] - color[1]) + Math.abs(image.data[i + 2] - color[2]) > 45) nonBackground++;
    }
    if (nonBackground < 10) issues.push({sceneId: scene.id, severity: 'error', message: 'Scene appears blank'});
    void start;
  }
  const timeline = sceneTimeline(project);
  if (timeline.some(item => !Number.isFinite(item.from) || item.durationInFrames < 1)) {
    issues.push({sceneId: 'project', severity: 'error', message: 'Invalid scene timeline'});
  }
  return issues;
};
