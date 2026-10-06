import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import type {VideoProject, VideoScene} from '../../project/schema';
import {MotionGrid, RoutePath, progress01, spring01} from '../svg/primitives';

const clamp = {
  extrapolateLeft: 'clamp' as const,
  extrapolateRight: 'clamp' as const,
};

export const DataSceneFrame = ({
  scene,
  project,
}: {
  scene: VideoScene;
  project: VideoProject;
}) => {
  const frame = useCurrentFrame();
  const {width, height, fps, durationInFrames} = useVideoConfig();
  const {background, foreground, muted, accent} = project.theme;
  const pad = width * 0.075;
  const bodySize = width * (height > width ? 0.038 : 0.025);
  const titleSize = width * (height > width ? 0.073 : 0.05);

  if (scene.type !== 'bar-line-chart') {
    return null;
  }

  const chartLeft = pad;
  const chartRight = width - pad;
  const chartTop = height * 0.32;
  const chartBottom = height * 0.78;
  const chartHeight = chartBottom - chartTop;
  const maxBar = Math.max(...scene.items.map((item) => item.bar), 1);
  const minLine = Math.min(...scene.items.map((item) => item.line));
  const maxLine = Math.max(...scene.items.map((item) => item.line));
  const lineRange = Math.max(1, maxLine - minLine);
  const gap = width * 0.026;
  const barWidth = (chartRight - chartLeft - gap * (scene.items.length - 1)) / scene.items.length;

  const bars = scene.items.map((item, index) => {
    const x = chartLeft + index * (barWidth + gap);
    const local = spring01(frame, fps, Math.round(index * fps * 0.07));
    const h = (item.bar / maxBar) * chartHeight * local;
    return {item, x, h, y: chartBottom - h, progress: local};
  });

  const linePoints = scene.items.map((item, index) => ({
    x: chartLeft + index * (barWidth + gap) + barWidth / 2,
    y: chartBottom - ((item.line - minLine) / lineRange) * chartHeight,
    item,
  }));
  const linePath = linePoints
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  const lineStart = fps * 0.55;
  const lineProgress = progress01(
    frame,
    lineStart,
    Math.min(durationInFrames - 1, lineStart + fps * 1.3),
  );
  const endpoint = linePoints[linePoints.length - 1];
  const pulse = 0.88 + Math.sin(frame / fps * Math.PI * 3) * 0.12;
  const intro = spring01(frame, fps);
  const legendProgress = progress01(frame, fps * 0.2, fps * 0.75);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
      <rect width={width} height={height} fill={background} />
      <MotionGrid
        width={width}
        height={height}
        gap={(chartRight - chartLeft) / 5}
        stroke={muted}
        opacity={0.055}
      />
      <g opacity={intro}>
        <text
          x={pad}
          y={height * 0.16}
          fill={foreground}
          fontSize={titleSize * 0.72}
          fontWeight={850}
        >
          {scene.title}
        </text>
        <g opacity={legendProgress}>
          <rect x={pad} y={height * 0.205} width={bodySize * 0.9} height={bodySize * 0.9} rx={bodySize * 0.15} fill={accent} opacity={0.82} />
          <text x={pad + bodySize * 1.25} y={height * 0.225} fill={muted} fontSize={bodySize * 0.5} fontWeight={650}>
            {scene.barLabel ?? 'Bars'}
          </text>
          <line x1={width * 0.47} y1={height * 0.217} x2={width * 0.53} y2={height * 0.217} stroke={foreground} strokeWidth={4} strokeLinecap="round" />
          <text x={width * 0.55} y={height * 0.225} fill={muted} fontSize={bodySize * 0.5} fontWeight={650}>
            {scene.lineLabel ?? 'Line'}
          </text>
        </g>
      </g>

      {bars.map(({item, x, h, y, progress}) => (
        <g key={item.label}>
          <rect
            x={x}
            y={y}
            width={barWidth}
            height={h}
            rx={Math.min(16, barWidth * 0.12)}
            fill={accent}
            opacity={0.74 + progress * 0.16}
          />
          <text
            x={x + barWidth / 2}
            y={chartBottom + bodySize * 1.15}
            fill={muted}
            fontSize={bodySize * 0.48}
            fontWeight={650}
            textAnchor="middle"
          >
            {item.label}
          </text>
          <text
            x={x + barWidth / 2}
            y={Math.max(chartTop + bodySize * 0.6, y - bodySize * 0.35)}
            fill={foreground}
            fontSize={bodySize * 0.48}
            fontWeight={760}
            textAnchor="middle"
            opacity={progress}
          >
            {Math.round(item.bar * progress)}{scene.barSuffix ?? ''}
          </text>
        </g>
      ))}

      <RoutePath
        d={linePath}
        progress={lineProgress}
        length={1000}
        stroke={foreground}
        strokeWidth={6}
      />

      {linePoints.map((point, index) => {
        const reveal = interpolate(
          lineProgress,
          [
            index / Math.max(1, linePoints.length - 1) - 0.12,
            index / Math.max(1, linePoints.length - 1) + 0.08,
          ],
          [0, 1],
          clamp,
        );
        return (
          <g key={`${point.item.label}-line`} opacity={reveal}>
            <circle cx={point.x} cy={point.y} r={7} fill={foreground} />
            <text
              x={point.x}
              y={point.y - bodySize * 0.65}
              fill={foreground}
              fontSize={bodySize * 0.44}
              fontWeight={760}
              textAnchor="middle"
            >
              {point.item.line}{scene.lineSuffix ?? ''}
            </text>
          </g>
        );
      })}

      {lineProgress > 0.94 ? (
        <>
          <circle
            cx={endpoint.x}
            cy={endpoint.y}
            r={bodySize * 0.55 * pulse}
            fill={accent}
            opacity={0.16}
          />
          <circle
            cx={endpoint.x}
            cy={endpoint.y}
            r={bodySize * 0.22}
            fill={foreground}
            stroke={accent}
            strokeWidth={5}
          />
        </>
      ) : null}
    </svg>
  );
};
