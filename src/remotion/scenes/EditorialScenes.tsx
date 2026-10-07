import {Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import type {EditorialMapScene, TravelHudScene, VideoProject} from '../../project/schema';
import {resolveAsset} from '../../project/assets';

type Point = {x: number; y: number};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const mercatorY = (lat: number) => {
  const rad = lat * Math.PI / 180;
  return Math.log(Math.tan(Math.PI / 4 + rad / 2));
};

const projectRoute = (
  coordinates: ReadonlyArray<readonly [number, number]>,
  width: number,
  height: number,
): Point[] => {
  if (coordinates.length < 2) return [];

  const projected = coordinates.map(([lon, lat]) => ({x: lon, y: mercatorY(lat)}));
  const xs = projected.map((point) => point.x);
  const ys = projected.map((point) => point.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const spanX = Math.max(0.000001, maxX - minX);
  const spanY = Math.max(0.000001, maxY - minY);

  const left = width * 0.09;
  const right = width * 0.91;
  const top = height * 0.28;
  const bottom = height * 0.76;
  const areaWidth = right - left;
  const areaHeight = bottom - top;
  const scale = Math.min(areaWidth / spanX, areaHeight / spanY);
  const usedWidth = spanX * scale;
  const usedHeight = spanY * scale;
  const offsetX = left + (areaWidth - usedWidth) / 2;
  const offsetY = top + (areaHeight - usedHeight) / 2;

  return projected.map((point) => ({
    x: offsetX + (point.x - minX) * scale,
    y: offsetY + usedHeight - (point.y - minY) * scale,
  }));
};

const pathFromPoints = (points: Point[]) =>
  points.length < 2
    ? ''
    : points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(' ');

const lineLength = (points: Point[]) =>
  points.slice(1).reduce((total, point, index) => {
    const previous = points[index];
    return total + Math.hypot(point.x - previous.x, point.y - previous.y);
  }, 0);

const pointAlong = (points: Point[], progress: number): Point | null => {
  if (points.length === 0) return null;
  if (points.length === 1) return points[0];

  const target = lineLength(points) * clamp01(progress);
  let travelled = 0;

  for (let index = 1; index < points.length; index += 1) {
    const from = points[index - 1];
    const to = points[index];
    const segment = Math.hypot(to.x - from.x, to.y - from.y);
    if (travelled + segment >= target) {
      const local = segment === 0 ? 0 : (target - travelled) / segment;
      return {
        x: from.x + (to.x - from.x) * local,
        y: from.y + (to.y - from.y) * local,
      };
    }
    travelled += segment;
  }

  return points[points.length - 1];
};

export const EditorialMapSceneFrame = ({
  scene,
  project,
}: {
  scene: EditorialMapScene;
  project: VideoProject;
}) => {
  const frame = useCurrentFrame();
  const {width, height, fps, durationInFrames} = useVideoConfig();
  const route = project.geoRoutes?.[scene.routeId];
  const {background, foreground, muted, accent} = project.theme;

  if (!route) {
    return <div style={{width: '100%', height: '100%', background, color: foreground}}>Missing route: {scene.routeId}</div>;
  }

  const routePoints = projectRoute(route.coordinates, width, height);
  const stopPoints = projectRoute(scene.stops.map((stop) => stop.coordinates), width, height);
  const path = pathFromPoints(routePoints);
  const totalLength = Math.max(1, lineLength(routePoints));
  const animatedProgress = interpolate(
    frame,
    [fps * 0.15, Math.max(fps * 0.8, durationInFrames * 0.78)],
    [0, scene.progress],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.inOut(Easing.cubic),
    },
  );
  const marker = pointAlong(routePoints, animatedProgress);
  const pad = width * 0.075;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
      <rect width={width} height={height} fill={background} />
      <g opacity={0.055}>
        {Array.from({length: 9}).map((_, index) => (
          <line
            key={index}
            x1={0}
            x2={width}
            y1={height * (0.18 + index * 0.09)}
            y2={height * (0.18 + index * 0.09)}
            stroke={foreground}
            strokeWidth={1}
          />
        ))}
      </g>

      {scene.region ? (
        <text
          x={width * 0.95}
          y={height * 0.55}
          fill={foreground}
          opacity={0.045}
          fontFamily="Inter, Arial, sans-serif"
          fontSize={width * 0.19}
          fontWeight={900}
          textAnchor="end"
          transform={`rotate(-90 ${width * 0.95} ${height * 0.55})`}
        >
          {scene.region.toUpperCase()}
        </text>
      ) : null}

      {scene.kicker ? (
        <text x={pad} y={height * 0.095} fill={accent} fontSize={width * 0.021} fontWeight={850} letterSpacing={4}>
          {scene.kicker.toUpperCase()}
        </text>
      ) : null}
      <text x={pad} y={height * 0.16} fill={foreground} fontFamily="Georgia, serif" fontSize={width * 0.058} fontWeight={700}>
        {scene.title}
      </text>
      {scene.stat ? (
        <text x={width - pad} y={height * 0.16} fill={muted} fontSize={width * 0.021} fontWeight={700} textAnchor="end">
          {scene.stat}
        </text>
      ) : null}

      <path d={path} fill="none" stroke={foreground} strokeOpacity={0.12} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
      <path
        d={path}
        fill="none"
        stroke={accent}
        strokeWidth={8}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={totalLength}
        strokeDashoffset={totalLength * (1 - clamp01(animatedProgress))}
      />

      {stopPoints.map((point, index) => {
        const threshold = index / Math.max(1, stopPoints.length - 1);
        const reveal = interpolate(animatedProgress, [Math.max(0, threshold - 0.08), threshold + 0.02], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        return (
          <g key={scene.stops[index].label} opacity={reveal}>
            <circle cx={point.x} cy={point.y} r={11} fill={background} stroke={accent} strokeWidth={5} />
            <text x={point.x} y={point.y - 24} fill={foreground} fontSize={width * 0.018} fontWeight={760} textAnchor="middle">
              {scene.stops[index].label}
            </text>
          </g>
        );
      })}

      {marker ? (
        <g transform={`translate(${marker.x} ${marker.y})`}>
          <circle r={22} fill={accent} opacity={0.18} />
          <circle r={9} fill={accent} stroke={background} strokeWidth={4} />
        </g>
      ) : null}

      {scene.showDetails ? (
        <>
          <text x={pad} y={height * 0.86} fill={muted} fontSize={width * 0.018} fontWeight={650}>
            {route.source.name}
          </text>
          <text x={pad} y={height * 0.895} fill={muted} opacity={0.72} fontSize={width * 0.014}>
            {route.source.license}
          </text>
        </>
      ) : null}
    </svg>
  );
};

export const TravelHudSceneFrame = ({
  scene,
  project,
}: {
  scene: TravelHudScene;
  project: VideoProject;
}) => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const {background, foreground, muted, accent} = project.theme;
  const enter = interpolate(frame, [0, fps * 0.75], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const pad = width * 0.065;
  const panelTop = height * 0.63;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
      {scene.src ? (
        <>
          <image
            crossOrigin="anonymous"
            href={resolveAsset(scene.src)}
            width={width}
            height={height}
            preserveAspectRatio="xMidYMid slice"
          />
          <rect width={width} height={height} fill="rgba(0,0,0,0.34)" />
        </>
      ) : (
        <rect width={width} height={height} fill={background} />
      )}

      <g opacity={enter} transform={`translate(0 ${(1 - enter) * height * 0.045})`}>
        {scene.kicker ? (
          <text x={pad} y={height * 0.12} fill={accent} fontSize={width * 0.019} fontWeight={850} letterSpacing={4}>
            {scene.kicker.toUpperCase()}
          </text>
        ) : null}
        <text x={pad} y={height * 0.19} fill="#FFFFFF" fontFamily="Georgia, serif" fontSize={width * 0.062} fontWeight={760}>
          {scene.title}
        </text>
        {scene.subtitle ? (
          <text x={pad} y={height * 0.235} fill="#E5E7EB" fontSize={width * 0.022} fontWeight={600}>
            {scene.subtitle}
          </text>
        ) : null}

        <rect
          x={pad}
          y={panelTop}
          width={width - pad * 2}
          height={height * 0.235}
          rx={width * 0.032}
          fill="rgba(7,12,18,0.84)"
          stroke="rgba(255,255,255,0.16)"
          strokeWidth={2}
        />

        {scene.metrics.map((metric, index) => {
          const cellWidth = (width - pad * 2) / scene.metrics.length;
          const x = pad + cellWidth * index + cellWidth / 2;
          const local = interpolate(frame, [fps * (0.18 + index * 0.09), fps * (0.72 + index * 0.09)], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.out(Easing.cubic),
          });
          return (
            <g key={metric.label} opacity={local}>
              {index > 0 ? (
                <line
                  x1={pad + cellWidth * index}
                  x2={pad + cellWidth * index}
                  y1={panelTop + height * 0.045}
                  y2={panelTop + height * 0.19}
                  stroke="#FFFFFF"
                  strokeOpacity={0.14}
                />
              ) : null}
              <text x={x} y={panelTop + height * 0.105} fill="#FFFFFF" fontSize={width * 0.042} fontWeight={850} textAnchor="middle">
                {metric.value}
              </text>
              <text x={x} y={panelTop + height * 0.155} fill={muted} fontSize={width * 0.015} fontWeight={700} textAnchor="middle" letterSpacing={2}>
                {metric.label.toUpperCase()}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
};
