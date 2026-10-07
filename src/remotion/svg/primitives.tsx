import {cutPath, getLength} from '@remotion/paths';
import {interpolate, spring} from 'remotion';

const clamp = {
  extrapolateLeft: 'clamp' as const,
  extrapolateRight: 'clamp' as const,
};

export const progress01 = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, Math.max(start + 1, end)], [0, 1], clamp);

export const spring01 = (frame: number, fps: number, delay = 0) =>
  spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: {damping: 16, stiffness: 120, mass: 0.8},
    durationInFrames: Math.max(12, Math.round(fps * 0.7)),
  });

export const AnimatedLine = ({
  x1,
  y1,
  x2,
  y2,
  progress,
  stroke,
  strokeWidth = 6,
  opacity = 1,
  dash = false,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  progress: number;
  stroke: string;
  strokeWidth?: number;
  opacity?: number;
  dash?: boolean;
}) => {
  const length = Math.hypot(x2 - x1, y2 - y1);
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      opacity={opacity}
      strokeDasharray={dash ? '16 18' : length}
      strokeDashoffset={dash ? 0 : length * (1 - Math.max(0, Math.min(1, progress)))}
    />
  );
};

export const RoutePath = ({
  d,
  progress,
  stroke,
  strokeWidth = 9,
  casing,
}: {
  d: string;
  progress: number;
  length?: number;
  stroke: string;
  strokeWidth?: number;
  casing?: string;
}) => {
  const clamped = Math.max(0, Math.min(1, progress));
  const totalLength = getLength(d);
  const visiblePath = cutPath(d, totalLength * clamped);

  return (
    <g>
      {casing ? (
        <path
          d={d}
          fill="none"
          stroke={casing}
          strokeWidth={strokeWidth + 8}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.65}
        />
      ) : null}
      <path
        d={visiblePath}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
};

export const LocationPin = ({
  x,
  y,
  size,
  fill,
  ring,
  progress = 1,
}: {
  x: number;
  y: number;
  size: number;
  fill: string;
  ring?: string;
  progress?: number;
}) => {
  const scale = 0.6 + Math.max(0, Math.min(1, progress)) * 0.4;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={progress}>
      {ring ? <circle r={size * 0.72} fill="none" stroke={ring} strokeWidth={size * 0.08} opacity={0.45} /> : null}
      <circle r={size * 0.42} fill={fill} />
      <circle r={size * 0.13} fill="#FFFFFF" opacity={0.95} />
    </g>
  );
};

export const LabelChip = ({
  x,
  y,
  text,
  foreground,
  background,
  fontSize,
  anchor = 'start',
  opacity = 1,
}: {
  x: number;
  y: number;
  text: string;
  foreground: string;
  background: string;
  fontSize: number;
  anchor?: 'start' | 'middle' | 'end';
  opacity?: number;
}) => {
  const width = Math.max(fontSize * 4.2, text.length * fontSize * 0.58 + fontSize * 1.6);
  const height = fontSize * 1.8;
  const left = anchor === 'middle' ? x - width / 2 : anchor === 'end' ? x - width : x;
  return (
    <g opacity={opacity}>
      <rect x={left} y={y - height * 0.72} width={width} height={height} rx={height / 2} fill={background} />
      <text x={anchor === 'middle' ? x : anchor === 'end' ? x - fontSize * 0.75 : x + fontSize * 0.75} y={y + fontSize * 0.18} fill={foreground} fontSize={fontSize} fontWeight={750} textAnchor={anchor}>
        {text}
      </text>
    </g>
  );
};

export const ProgressRing = ({
  cx,
  cy,
  radius,
  progress,
  stroke,
  track,
  strokeWidth,
}: {
  cx: number;
  cy: number;
  radius: number;
  progress: number;
  stroke: string;
  track: string;
  strokeWidth: number;
}) => {
  const circumference = 2 * Math.PI * radius;
  return (
    <g transform={`rotate(-90 ${cx} ${cy})`}>
      <circle cx={cx} cy={cy} r={radius} fill="none" stroke={track} strokeWidth={strokeWidth} />
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - Math.max(0, Math.min(1, progress)))}
      />
    </g>
  );
};

export const Arrow = ({
  x1,
  y1,
  x2,
  y2,
  stroke,
  strokeWidth = 5,
  progress = 1,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  stroke: string;
  strokeWidth?: number;
  progress?: number;
}) => {
  const px = x1 + (x2 - x1) * progress;
  const py = y1 + (y2 - y1) * progress;
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const size = strokeWidth * 4;
  const leftX = px - Math.cos(angle - Math.PI / 6) * size;
  const leftY = py - Math.sin(angle - Math.PI / 6) * size;
  const rightX = px - Math.cos(angle + Math.PI / 6) * size;
  const rightY = py - Math.sin(angle + Math.PI / 6) * size;

  return (
    <g>
      <AnimatedLine x1={x1} y1={y1} x2={x2} y2={y2} progress={progress} stroke={stroke} strokeWidth={strokeWidth} />
      <path d={`M ${leftX} ${leftY} L ${px} ${py} L ${rightX} ${rightY}`} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
};

export const MotionGrid = ({
  width,
  height,
  gap,
  stroke,
  opacity,
  offsetX = 0,
  offsetY = 0,
}: {
  width: number;
  height: number;
  gap: number;
  stroke: string;
  opacity: number;
  offsetX?: number;
  offsetY?: number;
}) => {
  const vertical = Math.ceil(width / gap) + 2;
  const horizontal = Math.ceil(height / gap) + 2;
  return (
    <g opacity={opacity}>
      {Array.from({length: vertical}).map((_, index) => {
        const x = (index - 1) * gap + offsetX;
        return <line key={`v-${index}`} x1={x} y1={0} x2={x} y2={height} stroke={stroke} strokeWidth={1} />;
      })}
      {Array.from({length: horizontal}).map((_, index) => {
        const y = (index - 1) * gap + offsetY;
        return <line key={`h-${index}`} x1={0} y1={y} x2={width} y2={y} stroke={stroke} strokeWidth={1} />;
      })}
    </g>
  );
};

export const CounterText = ({
  x,
  y,
  value,
  progress,
  suffix = '',
  prefix = '',
  fill,
  fontSize,
  anchor = 'start',
}: {
  x: number;
  y: number;
  value: number;
  progress: number;
  suffix?: string;
  prefix?: string;
  fill: string;
  fontSize: number;
  anchor?: 'start' | 'middle' | 'end';
}) => (
  <text x={x} y={y} fill={fill} fontSize={fontSize} fontWeight={850} textAnchor={anchor}>
    {prefix}{Math.round(value * Math.max(0, Math.min(1, progress)))}{suffix}
  </text>
);

export const RevealRect = ({
  x,
  y,
  width,
  height,
  progress,
  fill,
  rx = 0,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  progress: number;
  fill: string;
  rx?: number;
}) => (
  <rect
    x={x}
    y={y}
    width={width * Math.max(0, Math.min(1, progress))}
    height={height}
    rx={rx}
    fill={fill}
  />
);

export const PhotoMask = ({
  id,
  src,
  x,
  y,
  width,
  height,
  radius,
  reveal,
  scale = 1,
}: {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
  reveal: number;
  scale?: number;
}) => {
  const visibleHeight = height * Math.max(0, Math.min(1, reveal));
  return (
    <>
      <defs>
        <clipPath id={id}>
          <rect x={x} y={y + height - visibleHeight} width={width} height={visibleHeight} rx={radius} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <image
          crossOrigin="anonymous"
          href={src}
          x={x - width * (scale - 1) / 2}
          y={y - height * (scale - 1) / 2}
          width={width * scale}
          height={height * scale}
          preserveAspectRatio="xMidYMid slice"
        />
      </g>
    </>
  );
};

export const KineticWords = ({
  words,
  x,
  y,
  frame,
  fps,
  fontSize,
  lineHeight,
  fill,
  accent,
  maxPerLine = 3,
}: {
  words: string[];
  x: number;
  y: number;
  frame: number;
  fps: number;
  fontSize: number;
  lineHeight: number;
  fill: string;
  accent: string;
  maxPerLine?: number;
}) => (
  <g>
    {words.map((word, index) => {
      const p = spring01(frame, fps, index * Math.max(2, Math.round(fps * 0.08)));
      const line = Math.floor(index / maxPerLine);
      const column = index % maxPerLine;
      const dx = column * fontSize * 3.25;
      const dy = line * lineHeight;
      return (
        <text
          key={`${word}-${index}`}
          x={x + dx}
          y={y + dy}
          fill={index % 4 === 3 ? accent : fill}
          fontSize={fontSize}
          fontWeight={850}
          opacity={p}
          transform={`translate(0 ${(1 - p) * fontSize * 0.8})`}
        >
          {word}
        </text>
      );
    })}
  </g>
);


export const TrackingText = ({
  text,
  x,
  y,
  progress,
  fill,
  fontSize,
  weight = 850,
  anchor = 'start',
  startTracking = 18,
  endTracking = 1,
}: {
  text: string;
  x: number;
  y: number;
  progress: number;
  fill: string;
  fontSize: number;
  weight?: number;
  anchor?: 'start' | 'middle' | 'end';
  startTracking?: number;
  endTracking?: number;
}) => {
  const letterSpacing = startTracking + (endTracking - startTracking) * Math.max(0, Math.min(1, progress));
  return (
    <text
      x={x}
      y={y}
      fill={fill}
      fontSize={fontSize}
      fontWeight={weight}
      textAnchor={anchor}
      letterSpacing={letterSpacing}
      opacity={progress}
    >
      {text}
    </text>
  );
};

export const WordReveal = ({
  words,
  x,
  y,
  frame,
  fps,
  fontSize,
  lineHeight,
  fill,
  accent,
  highlight,
  anchor = 'start',
  maxPerLine = 2,
}: {
  words: string[];
  x: number;
  y: number;
  frame: number;
  fps: number;
  fontSize: number;
  lineHeight: number;
  fill: string;
  accent: string;
  highlight?: string;
  anchor?: 'start' | 'middle';
  maxPerLine?: number;
}) => (
  <g>
    {words.map((word, index) => {
      const reveal = spring01(frame, fps, index * Math.max(2, Math.round(fps * 0.1)));
      const line = Math.floor(index / maxPerLine);
      const column = index % maxPerLine;
      const direction = index % 2 === 0 ? -1 : 1;
      const dx = anchor === 'middle'
        ? (column - (maxPerLine - 1) / 2) * fontSize * 3.2
        : column * fontSize * 3.2;
      const dy = line * lineHeight;
      const isHighlight = highlight?.toLowerCase() === word.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      return (
        <g key={`${word}-${index}`} opacity={reveal} transform={`translate(${direction * (1 - reveal) * fontSize * 0.7} 0)`}>
          <text
            x={x + dx}
            y={y + dy}
            fill={isHighlight ? accent : fill}
            fontSize={fontSize}
            fontWeight={900}
            textAnchor={anchor}
          >
            {word}
          </text>
        </g>
      );
    })}
  </g>
);

export const ImageFrame = ({
  x,
  y,
  width,
  height,
  stroke,
  mode,
  progress,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  stroke: string;
  mode: 'none' | 'thin' | 'offset';
  progress: number;
}) => {
  if (mode === 'none') return null;
  if (mode === 'thin') {
    return (
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={Math.min(width, height) * 0.025}
        fill="none"
        stroke={stroke}
        strokeWidth={3}
        opacity={progress}
      />
    );
  }

  return (
    <rect
      x={x + width * 0.035}
      y={y + height * 0.035}
      width={width}
      height={height}
      rx={Math.min(width, height) * 0.025}
      fill="none"
      stroke={stroke}
      strokeWidth={5}
      opacity={0.65 * progress}
    />
  );
};
