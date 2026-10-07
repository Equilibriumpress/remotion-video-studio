import {getLength, getPointAtLength, getTangentAtLength} from '@remotion/paths';
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

const VehicleGlyph = ({
  type,
  x,
  y,
  bearing,
  size,
  color,
  ring,
}: {
  type: 'train' | 'car' | 'walker' | 'bike' | 'plane';
  x: number;
  y: number;
  bearing: number;
  size: number;
  color: string;
  ring: string;
}) => {
  const transform = `translate(${x} ${y}) rotate(${bearing})`;
  if (type === 'walker') {
    return (
      <g transform={transform}>
        <circle cx={0} cy={-size * 0.25} r={size * 0.13} fill={color} stroke={ring} strokeWidth={size * 0.06} />
        <path d={`M0,${-size * 0.08} L0,${size * 0.18} M0,${size * 0.02} L${size * 0.2},${size * 0.12} M0,${size * 0.18} L${size * 0.18},${size * 0.4} M0,${size * 0.18} L${-size * 0.16},${size * 0.42}`} fill="none" stroke={color} strokeWidth={size * 0.12} strokeLinecap="round" />
      </g>
    );
  }
  if (type === 'bike') {
    return (
      <g transform={transform}>
        <circle cx={-size * 0.28} cy={size * 0.14} r={size * 0.2} fill="none" stroke={color} strokeWidth={size * 0.08} />
        <circle cx={size * 0.28} cy={size * 0.14} r={size * 0.2} fill="none" stroke={color} strokeWidth={size * 0.08} />
        <path d={`M${-size * 0.28},${size * 0.14} L0,${-size * 0.12} L${size * 0.12},${size * 0.14} L${-size * 0.08},${size * 0.14} Z M0,${-size * 0.12} L${size * 0.2},${-size * 0.24}`} fill="none" stroke={color} strokeWidth={size * 0.07} strokeLinejoin="round" />
      </g>
    );
  }
  if (type === 'plane') {
    return (
      <g transform={transform}>
        <path d={`M${size * 0.52},0 L${-size * 0.08},${-size * 0.12} L${-size * 0.42},${-size * 0.42} L${-size * 0.18},${-size * 0.04} L${-size * 0.48},0 L${-size * 0.18},${size * 0.04} L${-size * 0.42},${size * 0.42} L${-size * 0.08},${size * 0.12} Z`} fill={color} stroke={ring} strokeWidth={size * 0.05} strokeLinejoin="round" />
      </g>
    );
  }
  const isTrain = type === 'train';
  return (
    <g transform={transform}>
      <rect
        x={-size * (isTrain ? 0.48 : 0.38)}
        y={-size * (isTrain ? 0.2 : 0.24)}
        width={size * (isTrain ? 0.96 : 0.76)}
        height={size * (isTrain ? 0.4 : 0.48)}
        rx={size * 0.16}
        fill={color}
        stroke={ring}
        strokeWidth={size * 0.055}
      />
      {isTrain ? (
        <>
          <rect x={size * 0.08} y={-size * 0.11} width={size * 0.22} height={size * 0.22} rx={size * 0.05} fill={ring} opacity={0.8} />
          <line x1={-size * 0.22} y1={-size * 0.14} x2={-size * 0.22} y2={size * 0.14} stroke={ring} strokeWidth={size * 0.045} />
        </>
      ) : (
        <>
          <circle cx={-size * 0.22} cy={size * 0.27} r={size * 0.09} fill={ring} />
          <circle cx={size * 0.22} cy={size * 0.27} r={size * 0.09} fill={ring} />
          <path d={`M${-size * 0.18},${-size * 0.2} L${-size * 0.02},${-size * 0.38} L${size * 0.22},${-size * 0.38} L${size * 0.34},${-size * 0.2}`} fill={color} stroke={ring} strokeWidth={size * 0.05} strokeLinejoin="round" />
        </>
      )}
    </g>
  );
};

const pathData = (points: Point[]) =>
  points.map((point, i) => `${i === 0 ? 'M' : 'L'}${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(' ');

const geoDistanceKm = (a: Position, b: Position) => {
  const rad = Math.PI / 180;
  const dLat = (b[1] - a[1]) * rad;
  const dLon = (b[0] - a[0]) * rad;
  const value =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a[1] * rad) * Math.cos(b[1] * rad) *
    Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
};

export const routeDistanceKm = (route: ReadonlyArray<Position>) =>
  route.slice(1).reduce((total, point, index) => total + geoDistanceKm(route[index], point), 0);

export const sliceGeoRouteByProgress = (
  route: ReadonlyArray<Position>,
  startProgress: number,
  endProgress: number,
): Position[] => {
  const start = constrain(Math.min(startProgress, endProgress));
  const end = constrain(Math.max(startProgress, endProgress));
  const segmentLengths = route.slice(1).map((point, index) => geoDistanceKm(route[index], point));
  const cumulative = [0];
  for (const length of segmentLengths) cumulative.push(cumulative[cumulative.length - 1] + length);
  const total = cumulative[cumulative.length - 1] || 1;
  const startDistance = total * start;
  const endDistance = total * end;

  const interpolateAt = (target: number): Position => {
    for (let i = 0; i < segmentLengths.length; i++) {
      if (target <= cumulative[i + 1]) {
        const span = Math.max(0.0000001, segmentLengths[i]);
        const t = constrain((target - cumulative[i]) / span);
        return [
          route[i][0] + (route[i + 1][0] - route[i][0]) * t,
          route[i][1] + (route[i + 1][1] - route[i][1]) * t,
        ];
      }
    }
    return route[route.length - 1];
  };

  const result: Position[] = [interpolateAt(startDistance)];
  for (let i = 1; i < route.length - 1; i++) {
    if (cumulative[i] > startDistance && cumulative[i] < endDistance) {
      result.push(route[i]);
    }
  }
  result.push(interpolateAt(endDistance));
  return result;
};

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
  const pathLength = getLength(path);
  const revealed = progress01(frame, fps * 0.14, Math.max(fps * 0.7, durationInFrames * 0.78));
  const drawn = revealed * scene.progress;
  const markerDistance = pathLength * constrain(drawn);
  const markerPoint = getPointAtLength(path, markerDistance);
  const markerTangent = getTangentAtLength(path, markerDistance);
  const marker = {
    x: markerPoint.x,
    y: markerPoint.y,
    bearing: Math.atan2(markerTangent.y, markerTangent.x) * 180 / Math.PI,
  };
  const enter = spring01(frame, fps);
  const compass = scene.mapRotation * Math.PI / 180;
  const stops = scene.stops.map((stop) => ({
    stop,
    ...closestOnPath(points, projected.toScreen(stop.coordinates)),
  }));
  const cameraProgress = scene.camera === 'follow'
    ? progress01(frame, fps * 0.18, Math.max(fps * 1.1, durationInFrames * 0.58))
    : 0;
  const cameraScale = 1 + (scene.cameraZoom - 1) * cameraProgress;
  const mapCenterX = width / 2;
  const mapCenterY = height * 0.54;
  const focusX = mapCenterX + (marker.x - mapCenterX) * cameraProgress;
  const focusY = mapCenterY + (marker.y - mapCenterY) * cameraProgress;
  const cameraTransform =
    `translate(${mapCenterX} ${mapCenterY}) scale(${cameraScale}) translate(${-focusX} ${-focusY})`;
  const computedDistance = routeDistanceKm(route.coordinates);
  const distanceLabel = scene.distance ??
    `${computedDistance < 10 ? computedDistance.toFixed(1) : Math.round(computedDistance)} km`;

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
      <g transform={cameraTransform}>
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
      {scene.vehicle?.showPulse !== false ? (
        <circle cx={marker.x} cy={marker.y} r={width * 0.064} fill={accent} opacity={0.14} />
      ) : null}
      {scene.vehicle ? (
        <VehicleGlyph
          type={scene.vehicle.type}
          x={marker.x}
          y={marker.y}
          bearing={marker.bearing}
          size={width * 0.07 * scene.vehicle.scale}
          color={scene.vehicle.color ?? foreground}
          ring={accent}
        />
      ) : (
        <LocationPin x={marker.x} y={marker.y} size={width * 0.065} fill={foreground} ring={accent} progress={enter} />
      )}
      </g>
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
      <LabelChip x={width-pad} y={height*0.87} text={distanceLabel} foreground={background} background={accent} fontSize={size * 0.56} anchor="end" opacity={enter} />
      {scene.label ? <text x={pad} y={height * 0.9} fill={foreground} fontSize={size * 0.64} fontWeight={650}>{scene.label}</text> : null}
      <text x={pad} y={height * 0.962} fill={muted} fontSize={size * 0.42} fontWeight={600}>
        Map data: {route.source.name} · {route.source.license}
      </text>
    </svg>
  );
};
