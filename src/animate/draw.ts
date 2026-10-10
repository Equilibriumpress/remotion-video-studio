import {animateStyles, type AnimateStyle} from './styles';

export type AnimateDrawing = {
  style: AnimateStyle;
  title: string;
  subtitle?: string;
  progress: number;
  width: number;
  height: number;
  seed?: number;
};

const clamp = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
const hash = (x: number, seed: number) => {
  const v = Math.sin(x * 127.1 + seed * 311.7) * 43758.5453123;
  return v - Math.floor(v);
};

/** Pure frame drawing: no timers, external images, network or mutable random state. */
export function drawAnimateFrame(ctx: CanvasRenderingContext2D, args: AnimateDrawing) {
  const {width: w, height: h, title, subtitle, style} = args;
  const p = clamp(args.progress);
  const palette = animateStyles[style];
  const seed = args.seed ?? 7;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = palette.background;
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  const pixel = style === 'pixel';
  const baseY = h * 0.70;
  const spread = w * 0.77;
  const count = 11;
  if (style === 'math' || style === 'isometric') {
    ctx.strokeStyle = palette.secondary;
    ctx.globalAlpha = 0.23;
    ctx.lineWidth = Math.max(1, w / 600);
    for (let i = -12; i <= 12; i++) {
      const y = baseY + i * h * 0.035;
      ctx.beginPath();
      if (style === 'isometric') {
        ctx.moveTo(0, y - w * 0.25);
        ctx.lineTo(w, y + w * 0.25);
      } else {
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  for (let i = 0; i < count; i++) {
    const delay = i / (count + 3);
    const reveal = ease((p - delay * 0.63) / 0.38);
    if (reveal <= 0) continue;
    const left = w * 0.10 + i * spread / count;
    const buildingWidth = spread / count * (0.72 + hash(i + 50, seed) * 0.30);
    const buildingHeight = (h * (0.13 + hash(i, seed) * 0.26)) * reveal;
    const y = baseY - buildingHeight;
    ctx.fillStyle = i % 3 === 0 ? palette.accent : i % 3 === 1 ? palette.secondary : palette.foreground;
    ctx.globalAlpha = 0.90;
    if (pixel) {
      const step = Math.max(5, Math.round(w / 155));
      ctx.fillRect(Math.round(left / step) * step, Math.round(y / step) * step, Math.round(buildingWidth / step) * step, Math.round(buildingHeight / step) * step);
    } else {
      ctx.fillRect(left, y, buildingWidth, buildingHeight);
      if (style === 'isometric' || style === 'cut-paper') {
        ctx.globalAlpha = 0.23;
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.moveTo(left + buildingWidth, y);
        ctx.lineTo(left + buildingWidth + w * 0.014, y - w * 0.014);
        ctx.lineTo(left + buildingWidth + w * 0.014, baseY - w * 0.014);
        ctx.lineTo(left + buildingWidth, baseY);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    if (reveal > 0.35 && buildingHeight > h * 0.06) {
      ctx.fillStyle = palette.background;
      for (let row = 0; row < 5; row++) for (let col = 0; col < 2; col++) {
        const windowY = y + buildingHeight * (0.13 + row * 0.16);
        if (windowY < baseY - buildingHeight * 0.06) ctx.fillRect(left + buildingWidth * (0.20 + col * 0.45), windowY, buildingWidth * 0.13, Math.max(2, h * 0.007));
      }
    }
  }
  if (style === 'riso' || style === 'crosshatch' || style === 'sketchbook') {
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, w, h);
    ctx.clip();
    ctx.globalAlpha = style === 'riso' ? 0.085 : 0.12;
    ctx.strokeStyle = palette.foreground;
    ctx.fillStyle = palette.accent;
    for (let i = 0; i < 270; i++) {
      const x = hash(i + 100, seed) * w;
      const y = hash(i + 500, seed) * h;
      if (style === 'riso') {
        ctx.beginPath(); ctx.arc(x, y, Math.max(1, w * 0.002), 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w * 0.012, y + (style === 'crosshatch' ? w * 0.012 : w * 0.003)); ctx.stroke();
      }
    }
    ctx.restore();
  }
  ctx.restore();

  const pad = w * 0.10;
  ctx.fillStyle = palette.foreground;
  ctx.globalAlpha = ease(p * 6);
  const big = Math.round(Math.min(w * 0.078, h * 0.061));
  ctx.font = `700 ${big}px Georgia, serif`;
  ctx.textBaseline = 'top';
  const words = title.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const next = line ? line + ' ' + word : word;
    if (ctx.measureText(next).width > w - pad * 2 && line) {
      lines.push(line); line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  lines.slice(0, 3).forEach((text, index) => ctx.fillText(text, pad, h * 0.14 + index * big * 1.2));
  if (subtitle) {
    ctx.font = `500 ${Math.round(Math.min(w * 0.034, h * 0.026))}px Arial, sans-serif`;
    ctx.fillText(subtitle.slice(0, 100), pad, h * 0.14 + Math.min(lines.length, 3) * big * 1.3 + h * 0.024);
  }
  ctx.globalAlpha = 1;
}
