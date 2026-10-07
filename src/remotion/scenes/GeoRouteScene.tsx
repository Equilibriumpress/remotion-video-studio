import {useCurrentFrame, useVideoConfig} from 'remotion';
import type {GeoRouteGeometry, GeoRouteScene, VideoProject} from '../../project/schema';
import {LabelChip, LocationPin, RoutePath, ProgressRing, progress01, spring01} from '../svg/primitives';

type Point = {x: number; y: number};
type Position = GeoRouteGeometry['coordinates'][number];

const constrain = (n: number) => Math.max(0, Math.min(1, n));

// Project WGS84 onto a local metric plane, then rotate the entire map as a unit.
// Rotation never changes route geometry, and the compass reflects the bearing.
export const projectGeoPath = (
  route: ReadonlyArray<Position>,
  width: number,
  height: number,
  rotation = 0,
) => {
  const lon = route.reduce((sum, p) => sum + p[0], 0) / route.length;
  const lat = route.reduce((sum, p) => sum + p[1], 0) / route.length;
  const cosLat = Math.cos(lat * Math.PI / 180);
  const angle = rotation * Math.PI / 180;
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const raw = ([x, y]: Position): Point => {
    const east = (x - lon) * cosLat;
    const south = lat - y;
    return {x: east * c - south * s, y: east * s + south * c};
  };
  const projected = route.map(raw);
  const xs = projected.map((p) => p.x);
  const ys = projected.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const scale = Math.min(
    width * 0.78 / Math.max(0.00001, maxX - minX),
    height * 0.54 / Math.max(0.00001, maxY - minY),
  );
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const toScreen = (p: Position): Point => {
    const {x, y} = raw(p);
    return {x: width / 2 + (x - centerX) * scale, y: height * 0.54 + (y - centerY) * scale};
  };
  return {points: route.map(toScreen), toScreen};
};

const closestOnPath = (points: Point[], target: Point) => {
  let best = {point: points[0], distance: Infinity, progress: 0};
  const lengths = points.slice(1).map((p, i) => Math.hypot(p.x - points[i].x, p.y - points[i].y));
  const total = lengths.reduce((sum, n) => sum + n, 0) || 1;
  let walked = 0;
  for (let i = 0; i < lengths.length; i++) {
    const a = points[i];
    const b = points[i + 1];
    const lengthSquared = Math.max(1e-10, lengths[i] * lengths[i]);
    const t = constrain(((target.x - a.x) * (b.x - a.x) + (target.y - a.y) * (b.y - a.y)) / lengthSquared);
    const candidate = {x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t};
    const distance = Math.hypot(candidate.x - target.x, candidate.y - target.y);
    if (distance < best.distance) {
      best = {point: candidate, distance, progress: (walked + lengths[i] * t) / total};
    }
    walked += lengths[i];
  }
  return best;
};

const alongPath = (points: Point[], ratio: number) => {
  const lengths = points.slice(1).map((p, i) => Math.hypot(p.x - points[i].x, p.y - points[i].y));
  const total = lengths.reduce((sum, n) => sum + n, 0);
  let left = total * constrain(ratio);
  for (let i = 0; i < lengths.length; i++) {
    if (left <= lengths[i]) {
      const t = lengths[i] === 0 ? 0 : left / lengths[i];
      return {x: points[i].x + (points[i + 1].x - points[i].x) * t, y: points[i].y + (points[i + 1].y - points[i].y) * t};
    }
    left -= lengths[i];
  }
  return points[points.length - 1];
};

const pathData = (points: Point[]) =>
  points.map((point, i) => `${i === 0 ? 'M' : 'L'}${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(' ');

export const GeoRouteSceneFrame = ({
  scene,
  project,
}: {
  scene: GeoRouteScene;
  project: VideoProject;
}) => {
  const frame = useCurrentFrame();
  const {width, height, fps, durationInFrames} = useVideoConfig();
  const route = project.geoRoutes?.[scene.routeId];

  if (!route) {
    // Build validation also rejects missing route references.
    return null;
  }

  const {background, foreground, muted, accent} = project.theme;
  const pad = width * 0.075;
  const size = width * (height > width ? 0.038 : 0.026);
  const projected = projectGeoPath(route.coordinates, width, height, scene.mapRotation);
  const points = projected.points;
  const path = pathData(points);
  const revealed = progress01(frame, fps * 0.14, Math.max(fps * 0.7, durationInFrames * 0.78));
  const drawn = revealed * scene.progress;
  const marker = alongPath(points, drawn);
  const enter = spring01(frame, fps);
  const compass = scene.mapRotation * Math.PI / 180;
  const stops = scene.stops.map((stop) => ({
    stop,
    ...closestOnPath(points, projected.toScreen(stop.coordinates)),
  }));

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
      <rect width={width} height={height} fill={background} />
      <defs>
        <radialGradient id={`geo-halo-${scene.id}`}>
          <stop offset="0%" stopColor={accent} stopOpacity="0.10" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={width * 0.5} cy={height * 0.55} r={width * 0.78} fill={`url(#geo-halo-${scene.id})`} />
      {/* Georeferenced context lines only; no invented roads or tile requests. */}
      {route.contextLines?.map((line, index) => (
        <path
          key={index}
          d={pathData(line.map(projected.toScreen))}
          fill="none"
          stroke={scene.style === 'watercolor' ? muted : accent}
          strokeOpacity={scene.style === 'watercolor' ? 0.19 : 0.1}
          strokeWidth={scene.style === 'watercolor' ? 3 : 2}
          strokeLinecap="round"
        />
      ))}
      <path d={path} fill="none" stroke={muted} strokeWidth={width * 0.014} strokeOpacity="0.22" strokeLinecap="round" strokeLinejoin="round" />
      {scene.style === 'flow' ? (
        <path d={path} fill="none" stroke={accent} strokeWidth={width * 0.036} opacity={0.09} strokeLinecap="round" strokeLinejoin="round" />
      ) : null}
      <RoutePath d={path} progress={drawn} stroke={accent} strokeWidth={width * 0.009} />
      {stops.map(({stop, point, progress}, index) => {
        const opacity = revealed > 0.1 ? 1 : enter;
        const position = Math.min(width * 0.8, Math.max(width * 0.2, point.x));
        const labelY = point.y + (index % 2 === 0 ? -width * 0.085 : width * 0.10);
        return (
          <g key={`${stop.label}-${index}`} opacity={opacity}>
            <LocationPin x={point.x} y={point.y} size={width * 0.033} fill={progress <= drawn + 0.01 ? accent : muted} ring={foreground} progress={enter} />
            <LabelChip x={position} y={labelY} text={stop.label} foreground={foreground} background={background} fontSize={size * 0.49} anchor="middle" opacity={progress <= drawn + 0.05 ? 1 : 0.56} />
            {scene.showDetails && stop.detail ? (
              <text x={position} y={labelY + size * 0.98} fill={muted} fontSize={size * 0.45} fontWeight={650} textAnchor="middle">{stop.detail}</text>
            ) : null}
          </g>
        );
      })}
      <circle cx={marker.x} cy={marker.y} r={width * 0.064} fill={accent} opacity={0.14} />
      <LocationPin x={marker.x} y={marker.y} size={width * 0.065} fill={foreground} ring={accent} progress={enter} />
      <text x={pad} y={height * 0.13} fill={foreground} fontSize={width * 0.049} fontWeight={820}>{scene.title}</text>
      <text x={pad} y={height * 0.175} fill={muted} fontSize={size * 0.58} fontWeight={700} letterSpacing={3}>
        {route.mode.toUpperCase()} · GEO ROUTE
      </text>
      {/* The compass follows the map rotation instead of falsely pointing up. */}
      <g transform={`translate(${width - pad * 1.4} ${height * 0.16})`}>
        <line x1={0} y1={0} x2={Math.sin(compass) * width * 0.047} y2={-Math.cos(compass) * width * 0.047} stroke={accent} strokeWidth={4} strokeLinecap="round" />
        <circle r={5} fill={accent} />
        <text x={Math.sin(compass) * width * 0.074} y={-Math.cos(compass) * width * 0.074} fill={foreground} fontSize={size * 0.56} textAnchor="middle" fontWeight={850}>N</text>
      </g>
      {scene.progress < 1 ? (
        <>
          <ProgressRing cx={width - pad * 1.45} cy={height * 0.885} radius={width * 0.056} progress={drawn} stroke={accent} track={muted} strokeWidth={width * 0.012} />
          <text x={width - pad * 1.45} y={height * 0.889} fill={foreground} textAnchor="middle" fontSize={size * 0.48} fontWeight={750}>{Math.round(drawn * 100)}%</text>
        </>
      ) : null}
      {scene.distance ? <LabelChip x={width-pad} y={height*0.87} text={scene.distance} foreground={background} background={accent} fontSize={size * 0.56} anchor="end" opacity={enter} /> : null}
      {scene.label ? <text x={pad} y={height * 0.9} fill={foreground} fontSize={size * 0.64} fontWeight={650}>{scene.label}</text> : null}
      <text x={pad} y={height * 0.962} fill={muted} fontSize={size * 0.42} fontWeight={600}>
        Map data: {route.source.name} · {route.source.license}
      </text>
    </svg>
  );
};
