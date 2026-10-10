import {animateStyles, type AnimateStyle} from './styles';
import type {VideoProject} from '../project/schema';

export type AnimateBrief = {
  id: string;
  title: string;
  prompt: string;
  style: AnimateStyle;
  format: VideoProject['format'];
  fps: VideoProject['fps'];
  beats: {title: string; subtitle?: string; duration: number; seed?: number}[];
};

/** Compile agent-authored, editorially reviewed story beats to deterministic JSON. */
export function compileAnimateBrief(brief: AnimateBrief): VideoProject {
  const palette = animateStyles[brief.style];
  const scenes = brief.beats.map((beat, index) => ({
    id: `animate-${index + 1}`,
    type: 'animate-canvas' as const,
    duration: beat.duration,
    style: brief.style,
    title: beat.title,
    subtitle: beat.subtitle,
    seed: beat.seed ?? index + 7,
    motionAmount: 1,
    transition: index > 0 ? 'fade' as const : 'cut' as const,
  }));
  if (!brief.beats.length) throw new Error('At least one storyboard beat is required.');
  return {
    id: brief.id, title: brief.title, template: 'explainer',
    format: brief.format, fps: brief.fps,
    theme: {background: palette.background, foreground: palette.foreground, accent: palette.accent, muted: palette.secondary},
    scenes,
  } as VideoProject;
}
