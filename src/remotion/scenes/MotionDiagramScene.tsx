import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import type {VideoProject, VideoScene} from '../../project/schema';
import {MotionGrid} from '../svg/primitives';

type DiagramScene = Extract<VideoScene, {type: 'motion-diagram'}>;
const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

/**
 * Asset-free motion graphics inspired by measured typography, diagram-led
 * explainer films and data visualisation. Original implementation, frame-only.
 * Keeps all work in SVG: no DOM measurement, video, raster, external fonts or WebGL.
 */
export const MotionDiagramSceneFrame = ({
  scene,
  project,
}: {
  scene: DiagramScene;
  project: VideoProject;
}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const {background, foreground, muted, accent} = project.theme;
  const pad = width * 0.07;
  const count = scene.nodes.length;
  const hasRows = scene.layout !== 'arc' && count > 3;
  const points = scene.nodes.map((node, index) => {
    if (scene.layout === 'arc') {
      const angle = Math.PI + (index / (count - 1)) * Math.PI;
      return {
        ...node,
        x: width * (0.5 + Math.cos(angle) * 0.32),
        y: height * (0.69 + Math.sin(angle) * 0.23),
      };
    }
    const row = Math.floor(index / 3);
    const col = row % 2 === 0 ? index % 3 : 2 - index % 3;
    return {
      ...node,
      x: width * (0.19 + col * 0.31),
      y: height * (hasRows ? 0.43 + row * 0.34 : 0.60),
    };
  });
  // A slow roaming signal gives long chapters movement without animated video.
  const loopFrames = Math.max(1, Math.round(fps * Math.max(6, count * 1.9)));
  const routePhase = (frame % loopFrames) / loopFrames * (count - 1);
  const segment = Math.min(count - 2, Math.floor(routePhase));
  const t = routePhase - segment;
  const signal = {
    x: points[segment].x + (points[segment + 1].x - points[segment].x) * t,
    y: points[segment].y + (points[segment + 1].y - points[segment].y) * t,
  };
  const kickerOpacity = interpolate(frame, [0, fps * 0.4], [0, 1], clamp);
  const titleProgress = interpolate(frame, [fps * 0.12, fps * 0.9], [0, 1], clamp);
  const isPortrait = height > width;
  const titleFontSize = width * (isPortrait ? 0.068 : 0.048);
  const labelFontSize = width * (isPortrait ? 0.037 : 0.026);
  const labelWidth = width * (isPortrait ? 0.23 : 0.28);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
      <rect width={width} height={height} fill={background} />
      <MotionGrid width={width} height={height} gap={width * 0.1}
        stroke={accent} opacity={0.065} offsetX={frame * 0.16} />
      <circle cx={width * 0.9} cy={height * 0.06} r={width * 0.2}
        fill="none" stroke={accent} strokeWidth={2} opacity={0.1} />
      <text x={pad} y={height * 0.115} fontSize={width * 0.018}
        fontWeight={800} letterSpacing={4} fill={accent} opacity={kickerOpacity}>
        {scene.kicker?.toUpperCase() ?? 'THE JOURNEY'}
      </text>
      <g opacity={titleProgress}
        transform={`translate(0 ${(1 - titleProgress) * height * 0.035})`}>
        <text x={pad} y={height * 0.205} fill={foreground} fontSize={titleFontSize}
          fontWeight={850} fontFamily="Inter, Arial, sans-serif">
          {scene.title}
        </text>
      </g>
      {points.slice(1).map((point, index) => {
        const from = points[index];
        const reveal = interpolate(frame, [fps * (0.5 + index * 0.2), fps * (1.25 + index * 0.2)],
          [0, 1], clamp);
        return (
          <line key={index} x1={from.x} y1={from.y} x2={point.x} y2={point.y}
            stroke={accent} strokeWidth={width * 0.0028} opacity={0.72}
            pathLength={1} strokeDasharray={1} strokeDashoffset={1 - reveal} />
        );
      })}
      {points.map((point, index) => {
        const reveal = interpolate(frame, [fps * (0.28 + index * 0.2), fps * (0.95 + index * 0.2)],
          [0, 1], clamp);
        const cardWidth = labelWidth;
        const cardHeight = height * (hasRows ? 0.23 : 0.28);
        return (
          <g key={index} opacity={reveal}
            transform={`translate(0 ${(1 - reveal) * height * 0.03})`}>
            <rect x={point.x - cardWidth / 2} y={point.y - cardHeight / 2}
              width={cardWidth} height={cardHeight} rx={width * 0.013}
              fill={background} stroke={accent} strokeOpacity={0.5} strokeWidth={2} />
            <circle cx={point.x} cy={point.y - cardHeight * 0.26}
              r={width * 0.017} fill={accent} />
            <text x={point.x} y={point.y - cardHeight * 0.21} fill={background}
              textAnchor="middle" fontSize={width * 0.015} fontWeight={850}>
              {index + 1}
            </text>
            <text x={point.x} y={point.y + cardHeight * 0.04} fill={foreground}
              textAnchor="middle" fontFamily="Inter, Arial, sans-serif"
              fontWeight={800} fontSize={labelFontSize} textLength={undefined}>
              {point.label}
            </text>
            {point.detail ? (
              <text x={point.x} y={point.y + cardHeight * 0.27}
                fill={muted} fontSize={width * 0.016} textAnchor="middle">
                {point.detail}
              </text>
            ) : null}
          </g>
        );
      })}
      <circle cx={signal.x} cy={signal.y} r={width * 0.014} fill={accent} opacity={0.17} />
      <circle cx={signal.x} cy={signal.y} r={width * 0.0045} fill={foreground} />
      {scene.footnote ? (
        <text x={pad} y={height * 0.955} fill={muted} opacity={0.85}
          fontSize={width * 0.0135} fontFamily="Inter, Arial, sans-serif">
          {scene.footnote}
        </text>
      ) : null}
    </svg>
  );
};
