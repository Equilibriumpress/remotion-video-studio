import {useCurrentFrame, useVideoConfig} from 'remotion';
import type {VideoProject, VideoScene} from '../../project/schema';
import {resolveAsset} from '../../project/assets';
import {PremiumKineticTitle} from './PremiumKineticTitle';
import {
  CounterText,
  ImageFrame,
  KineticWords,
  MotionGrid,
  PhotoMask,
  ProgressRing,
  RoutePath,
  TrackingText,
  WordReveal,
  progress01,
  spring01,
} from '../svg/primitives';

const wrapText = (value: string, max: number) => {
  const words = value.split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > max && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
};

const Multiline = ({
  value,
  x,
  y,
  max,
  size,
  lineHeight,
  fill,
  weight = 750,
  anchor = 'start',
  family = 'Inter, Arial, sans-serif',
}: {
  value: string;
  x: number;
  y: number;
  max: number;
  size: number;
  lineHeight: number;
  fill: string;
  weight?: number;
  anchor?: 'start' | 'middle' | 'end';
  family?: string;
}) => (
  <text x={x} y={y} fill={fill} fontSize={size} fontWeight={weight} textAnchor={anchor} fontFamily={family}>
    {wrapText(value, max).map((line, index) => (
      <tspan key={`${line}-${index}`} x={x} dy={index === 0 ? 0 : lineHeight}>{line}</tspan>
    ))}
  </text>
);

export const SvgSceneFrame = ({
  scene,
  project,
}: {
  scene: VideoScene;
  project: VideoProject;
}) => {
  const frame = useCurrentFrame();
  const {width, height, fps, durationInFrames} = useVideoConfig();
  const pad = width * 0.075;
  const {background, foreground, muted, accent} = project.theme;
  const titleSize = width * (height > width ? 0.082 : 0.056);
  const bodySize = width * (height > width ? 0.042 : 0.028);
  const p = progress01(frame, 0, Math.min(durationInFrames - 1, fps * 1.05));
  const springIn = spring01(frame, fps);

  if (scene.type === 'photo-mask') {
    const shape = scene.shape ?? 'portrait';
    const box = shape === 'circle'
      ? {x: width * 0.16, y: height * 0.16, width: width * 0.68, height: width * 0.68, radius: width * 0.34}
      : shape === 'window'
        ? {x: width * 0.09, y: height * 0.13, width: width * 0.82, height: height * 0.6, radius: width * 0.04}
        : {x: width * 0.18, y: height * 0.12, width: width * 0.64, height: height * 0.62, radius: width * 0.025};

    return (
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
        <rect width={width} height={height} fill={background} />
        <MotionGrid width={width} height={height} gap={width * 0.1} stroke={accent} opacity={0.06} offsetX={frame * 0.3} />
        <PhotoMask
          id={`photo-mask-${scene.id}`}
          src={resolveAsset(scene.src)}
          x={box.x}
          y={box.y}
          width={box.width}
          height={box.height}
          radius={box.radius}
          reveal={p}
          scale={1.04 + p * 0.03}
        />
        {scene.treatment === 'warm' ? (
          <rect x={box.x} y={box.y} width={box.width} height={box.height} rx={box.radius} fill={accent} opacity={0.12 * p} />
        ) : null}
        {scene.treatment === 'dark' ? (
          <rect x={box.x} y={box.y} width={box.width} height={box.height} rx={box.radius} fill="#000000" opacity={0.3 * p} />
        ) : null}
        <ImageFrame x={box.x} y={box.y} width={box.width} height={box.height} stroke={accent} mode={scene.frame} progress={p} />
        {scene.title ? (
          <Multiline value={scene.title} x={pad} y={height * 0.82} max={22} size={titleSize * 0.7} lineHeight={titleSize * 0.82} fill={foreground} />
        ) : null}
        {scene.caption ? (
          <text x={pad} y={height * 0.93} fill={muted} fontSize={bodySize * 0.72} fontWeight={650}>{scene.caption}</text>
        ) : null}
      </svg>
    );
  }

  if (scene.type === 'kinetic-title') {
    const words = scene.text.split(/\s+/);
    const centered = scene.align === 'center';
    const x = centered ? width / 2 : pad;
    const anchor = centered ? 'middle' as const : 'start' as const;
    return (
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
        <rect width={width} height={height} fill={background} />
        <MotionGrid width={width} height={height} gap={width * 0.115} stroke={accent} opacity={0.08} offsetY={-frame * 0.25} />
        {scene.kicker ? (
          <text x={x} y={height * 0.2} fill={accent} fontSize={bodySize * 0.63} fontWeight={850} letterSpacing={4} textAnchor={anchor}>
            {scene.kicker.toUpperCase()}
          </text>
        ) : null}
        {scene.style === 'split' || scene.style === 'zoom' ? (
          <PremiumKineticTitle
            scene={scene}
            width={width}
            height={height}
            frame={frame}
            fps={fps}
            foreground={foreground}
            accent={accent}
          />
        ) : scene.style === 'oversize' ? (
          <TrackingText
            text={scene.text.toUpperCase()}
            x={x}
            y={height * 0.54}
            progress={p}
            fill={foreground}
            fontSize={titleSize * 1.05}
            anchor={anchor}
            startTracking={width * 0.035}
            endTracking={width * 0.002}
          />
        ) : scene.style === 'word-reveal' ? (
          <WordReveal
            words={words}
            x={x}
            y={height * 0.42}
            frame={frame}
            fps={fps}
            fontSize={titleSize * 0.72}
            lineHeight={titleSize * 1.02}
            fill={foreground}
            accent={accent}
            highlight={scene.highlight}
            anchor={centered ? 'middle' : 'start'}
            maxPerLine={2}
          />
        ) : (
          <KineticWords
            words={words}
            x={x}
            y={height * 0.43}
            frame={frame}
            fps={fps}
            fontSize={titleSize * 0.72}
            lineHeight={titleSize * 1.05}
            fill={foreground}
            accent={accent}
            maxPerLine={2}
          />
        )}
      </svg>
    );
  }

  if (scene.type === 'chapter-number') {
    return (
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
        <rect width={width} height={height} fill={background} />
        <text
          x={width * 0.88}
          y={height * 0.48}
          fill={accent}
          opacity={0.13}
          fontSize={width * 0.62}
          fontWeight={900}
          textAnchor="end"
        >
          {scene.number}
        </text>
        <g opacity={springIn} transform={`translate(0 ${(1 - springIn) * height * 0.04})`}>
          <text x={pad} y={height * 0.27} fill={accent} fontSize={bodySize * 0.68} fontWeight={850} letterSpacing={4}>
            CHAPTER {scene.number}
          </text>
          <Multiline value={scene.title} x={pad} y={height * 0.43} max={19} size={titleSize} lineHeight={titleSize * 1.03} fill={foreground} />
          {scene.subtitle ? (
            <Multiline value={scene.subtitle} x={pad} y={height * 0.72} max={36} size={bodySize * 0.85} lineHeight={bodySize * 1.25} fill={muted} weight={550} />
          ) : null}
        </g>
      </svg>
    );
  }

  if (scene.type === 'lower-third') {
    return (
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
        {scene.src ? (
          <>
            <image crossOrigin="anonymous" href={resolveAsset(scene.src)} width={width} height={height} preserveAspectRatio="xMidYMid slice" />
            <rect width={width} height={height} fill="rgba(0,0,0,0.23)" />
          </>
        ) : (
          <rect width={width} height={height} fill={background} />
        )}
        <g opacity={springIn} transform={`translate(${(1 - springIn) * -width * 0.08} 0)`}>
          <rect x={pad} y={height * 0.72} width={width * 0.72} height={height * 0.14} rx={width * 0.025} fill={background} opacity={0.92} />
          <rect x={pad} y={height * 0.72} width={width * 0.015} height={height * 0.14} rx={width * 0.008} fill={accent} />
          <text x={pad + width * 0.05} y={height * 0.78} fill={foreground} fontSize={bodySize * 1.02} fontWeight={800}>{scene.title}</text>
          {scene.subtitle ? (
            <text x={pad + width * 0.05} y={height * 0.825} fill={muted} fontSize={bodySize * 0.64} fontWeight={600}>{scene.subtitle}</text>
          ) : null}
        </g>
      </svg>
    );
  }

  if (scene.type === 'callout') {
    return (
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
        <rect width={width} height={height} fill={background} />
        <MotionGrid width={width} height={height} gap={width * 0.09} stroke={accent} opacity={0.055} offsetX={-frame * 0.2} />
        <g opacity={springIn}>
          <rect x={pad} y={height * 0.2} width={width - pad * 2} height={height * 0.6} rx={width * 0.045} fill={foreground} opacity={0.055} stroke={accent} strokeWidth={2} />
          {scene.value ? (
            <text x={pad * 1.5} y={height * 0.38} fill={accent} fontSize={titleSize * 1.15} fontWeight={900}>{scene.value}</text>
          ) : null}
          <Multiline value={scene.title} x={pad * 1.5} y={scene.value ? height * 0.53 : height * 0.39} max={22} size={titleSize * 0.62} lineHeight={titleSize * 0.77} fill={foreground} />
          <Multiline value={scene.body} x={pad * 1.5} y={height * 0.68} max={40} size={bodySize * 0.78} lineHeight={bodySize * 1.25} fill={muted} weight={550} />
        </g>
      </svg>
    );
  }

  if (scene.type === 'line-chart') {
    const max = Math.max(...scene.items.map((item) => item.value));
    const min = Math.min(...scene.items.map((item) => item.value));
    const range = Math.max(1, max - min);
    const left = pad;
    const right = width - pad;
    const top = height * 0.36;
    const bottom = height * 0.78;
    const points = scene.items.map((item, index) => ({
      x: left + (index / Math.max(1, scene.items.length - 1)) * (right - left),
      y: bottom - ((item.value - min) / range) * (bottom - top),
      ...item,
    }));
    const d = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');

    return (
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
        <rect width={width} height={height} fill={background} />
        <MotionGrid width={width} height={height} gap={(right - left) / 4} stroke={muted} opacity={0.075} />
        <Multiline value={scene.title} x={pad} y={height * 0.2} max={24} size={titleSize * 0.62} lineHeight={titleSize * 0.75} fill={foreground} />
        <RoutePath d={d} progress={p} length={1000} stroke={accent} strokeWidth={8} />
        {points.map((point, index) => {
          const local = progress01(frame, fps * 0.2 + index * 2, fps * 0.8 + index * 2);
          return (
            <g key={point.label} opacity={local}>
              <circle cx={point.x} cy={point.y} r={8} fill={accent} />
              <text x={point.x} y={bottom + bodySize * 1.3} fill={muted} fontSize={bodySize * 0.55} fontWeight={650} textAnchor="middle">{point.label}</text>
              <text x={point.x} y={point.y - 20} fill={foreground} fontSize={bodySize * 0.56} fontWeight={750} textAnchor="middle">{point.value}{scene.suffix ?? ''}</text>
            </g>
          );
        })}
      </svg>
    );
  }

  if (scene.type === 'donut-chart') {
    const ringP = progress01(frame, fps * 0.08, fps * 1.1);
    const radius = width * 0.245;
    return (
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
        <rect width={width} height={height} fill={background} />
        <Multiline value={scene.title} x={width / 2} y={height * 0.2} max={26} size={titleSize * 0.58} lineHeight={titleSize * 0.72} fill={foreground} anchor="middle" />
        <ProgressRing
          cx={width / 2}
          cy={height * 0.5}
          radius={radius}
          progress={(scene.value / 100) * ringP}
          stroke={accent}
          track={foreground}
          strokeWidth={width * 0.045}
        />
        <CounterText
          x={width / 2}
          y={height * 0.51}
          value={scene.value}
          progress={ringP}
          suffix={scene.suffix ?? '%'}
          fill={foreground}
          fontSize={titleSize}
          anchor="middle"
        />
        <text x={width / 2} y={height * 0.72} fill={muted} fontSize={bodySize * 0.78} fontWeight={650} textAnchor="middle">{scene.label}</text>
      </svg>
    );
  }

  return null;
};
