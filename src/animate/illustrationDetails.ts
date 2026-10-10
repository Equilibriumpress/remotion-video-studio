import type {AnimateDrawing} from './draw';
import {animateStyles} from './styles';

const clamp = (x: number) => Math.max(0, Math.min(1, x));
const seeded = (index: number, seed: number) => {
  const n = Math.sin((index + seed * 29) * 91.17) * 14583.31;
  return n - Math.floor(n);
};

/** Additional paint primitives using only deterministic geometry. */
export function drawIllustrationDetails(ctx: CanvasRenderingContext2D, args: AnimateDrawing) {
  const {width: w, height: h, style} = args;
  const palette = animateStyles[style];
  const progress = clamp(args.progress);
  const seed = args.seed ?? 7;
  const baseline = h * .7;
  ctx.save();

  if (style === 'isometric') {
    // Roof planes appear after the building faces.
    for (let i = 0; i < 11; i++) {
      const appearance = clamp((progress - i * .04) / .25);
      if (!appearance) continue;
      const x = w * .10 + i * w * .77 / 11;
      const bw = w * .77 / 11 * (.72 + seeded(i + 50, seed) * .30);
      const bh = h * (.13 + seeded(i, seed) * .26) * appearance;
      const depth = w * .017;
      ctx.fillStyle = palette.secondary;
      ctx.beginPath();
      ctx.moveTo(x, baseline - bh);
      ctx.lineTo(x + depth, baseline - bh - depth * .75);
      ctx.lineTo(x + bw + depth, baseline - bh - depth * .75);
      ctx.lineTo(x + bw, baseline - bh);
      ctx.closePath();
      ctx.fill();
    }
  }
  if (style === 'cut-paper') {
    for (let layer = 0; layer < 4; layer++) {
      const y = baseline + h * (.016 + layer * .025);
      ctx.fillStyle = layer % 2 ? palette.secondary : palette.accent;
      ctx.globalAlpha = .13 + layer * .04;
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= w; x += w / 16) {
        const wave = Math.sin(x / w * 6.28 + layer * 1.3) * h * .007;
        ctx.lineTo(x, y + wave);
      }
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.fill();
    }
  }
  if (style === 'pixel') {
    const cell = Math.max(6, Math.round(w / 120));
    ctx.fillStyle = palette.accent;
    for (let i = 0; i < 36; i++) {
      const x = Math.round(seeded(i * 3, seed) * w / cell) * cell;
      const y = Math.round(seeded(i * 7, seed) * h * .78 / cell) * cell;
      ctx.globalAlpha = .2 + .7 * seeded(i * 11, seed);
      ctx.fillRect(x, y, cell, cell);
    }
  }
  if (style === 'math') {
    ctx.strokeStyle = palette.accent;
    ctx.lineWidth = Math.max(1, w * .002);
    ctx.globalAlpha = .3;
    ctx.beginPath();
    const right = w * .9 * progress;
    for (let x = w * .1; x <= right; x += w / 80) {
      const y = baseline - h * .17 - Math.sin(x / w * 12.56) * h * .05;
      if (x === w * .1) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  if (style === 'crosshatch' || style === 'sketchbook') {
    ctx.globalAlpha = style === 'crosshatch' ? .20 : .13;
    ctx.strokeStyle = palette.foreground;
    ctx.lineWidth = Math.max(1, w / 1400);
    for (let i = 0; i < 90; i++) {
      const x = seeded(i * 4, seed) * w;
      const y = h * .32 + seeded(i * 8, seed) * h * .40;
      const length = w * (.01 + seeded(i * 6, seed) * .05);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + length, y + (style === 'crosshatch' ? length : length * .2));
      ctx.stroke();
      if (style === 'crosshatch') {
        ctx.beginPath(); ctx.moveTo(x + length, y); ctx.lineTo(x, y + length); ctx.stroke();
      }
    }
  }
  if (style === 'riso') {
    ctx.fillStyle = palette.accent;
    ctx.globalAlpha = .09;
    for (let i = 0; i < 10; i++) {
      ctx.beginPath();
      ctx.arc(seeded(i * 3, seed) * w, seeded(i * 6, seed) * h, w * (.02 + seeded(i * 12, seed) * .06), 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}
