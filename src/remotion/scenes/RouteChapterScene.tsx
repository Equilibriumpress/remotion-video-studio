import {useCurrentFrame, useVideoConfig} from 'remotion';
import type {RouteChapterScene, VideoProject} from '../../project/schema';
import {LabelChip, LocationPin, RoutePath, progress01, spring01} from '../svg/primitives';
import {projectGeoPath, routeDistanceKm, sliceGeoRouteByProgress} from './GeoRouteScene';

type Point = {x: number; y: number};

const alongPath = (points: Point[], ratio: number) => {
  const lengths = points.slice(1).map((point, index) =>
    Math.hypot(point.x - points[index].x, point.y - points[index].y),
  );
  const total = lengths.reduce((sum, length) => sum + length, 0) || 1;
  let remaining = total * Math.max(0, Math.min(1, ratio));
  for (let i = 0; i < lengths.length; i++) {
    if (remaining <= lengths[i]) {
      const t = lengths[i] === 0 ? 0 : remaining / lengths[i];
      return {
        x: points[i].x + (points[i + 1].x - points[i].x) * t,
        y: points[i].y + (points[i + 1].y - points[i].y) * t,
      };
    }
    remaining -= lengths[i];
  }
  return points[points.length - 1];
};

const pathData = (points: Point[]) =>
  points.map((point, index) =>
    `${index === 0 ? 'M' : 'L'}${point.x.toFixed(2)},${point.y.toFixed(2)}`,
  ).join(' ');

export const RouteChapterSceneFrame = ({
  scene,
  project,
}: {
  scene: RouteChapterScene;
  project: VideoProject;
}) => {
  const frame = useCurrentFrame();
  const {width, height, fps, durationInFrames} = useVideoConfig();
  const route = project.geoRoutes?.[scene.routeId];
  if (!route) return null;

  const {background, foreground, muted, accent} = project.theme;
  const pad = width * 0.075;
  const segment = sliceGeoRouteByProgress(route.coordinates, scene.startProgress, scene.endProgress);
  const projected = projectGeoPath(segment, width, height, scene.mapRotation);
  const points = projected.points;
  const path = pathData(points);
  const reveal = progress01(frame, fps * 0.12, Math.max(fps * 0.8, durationInFrames * 0.72));
  const marker = alongPath(points, reveal);
  const enter = spring01(frame, fps);
  const segmentKm = routeDistanceKm(segment);
  const distanceText = scene.distance ?? `${segmentKm < 10 ? segmentKm.toFixed(1) : Math.round(segmentKm)} km`;
  const start = points[0];
  const end = points[points.length - 1];
  const labelSize = width * 0.021;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
      <rect width={width} height={height} fill={background} />
      <defs>
        <radialGradient id={`chapter-halo-${scene.id}`}>
          <stop offset="0%" stopColor={accent} stopOpacity="0.12" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={width * 0.5} cy={height * 0.55} r={width * 0.82} fill={`url(#chapter-halo-${scene.id})`} />

      {route.contextLines?.map((line, index) => (
        <path
          key={index}
          d={pathData(line.map(projected.toScreen))}
          fill="none"
          stroke={scene.style === 'watercolor' ? muted : accent}
          strokeOpacity={scene.style === 'watercolor' ? 0.16 : 0.08}
          strokeWidth={scene.style === 'watercolor' ? 3 : 2}
          strokeLinecap="round"
        />
      ))}

      <path d={path} fill="none" stroke={muted} strokeOpacity={0.2} strokeWidth={width * 0.014} strokeLinecap="round" strokeLinejoin="round" />
      {scene.style === 'flow' ? <path d={path} fill="none" stroke={accent} strokeOpacity={0.08} strokeWidth={width * 0.04} strokeLinecap="round" /> : null}
      <RoutePath d={path} progress={reveal} stroke={accent} strokeWidth={width * 0.009} />

      <LocationPin x={start.x} y={start.y} size={width * 0.04} fill={background} ring={accent} progress={enter} />
      <LocationPin x={end.x} y={end.y} size={width * 0.04} fill={foreground} ring={accent} progress={enter} />
      {scene.startLabel ? <LabelChip x={start.x} y={start.y - width * 0.07} text={scene.startLabel} foreground={foreground} background={background} fontSize={labelSize} anchor="middle" opacity={enter} /> : null}
      {scene.endLabel ? <LabelChip x={end.x} y={end.y + width * 0.09} text={scene.endLabel} foreground={foreground} background={background} fontSize={labelSize} anchor="middle" opacity={reveal > 0.8 ? enter : 0.35} /> : null}

      <circle cx={marker.x} cy={marker.y} r={width * 0.045} fill={accent} opacity={0.12} />
      <circle cx={marker.x} cy={marker.y} r={width * 0.014} fill={foreground} stroke={accent} strokeWidth={width * 0.006} />

      {scene.kicker ? <text x={pad} y={height * 0.105} fill={accent} fontSize={width * 0.019} fontWeight={800} letterSpacing={3}>{scene.kicker.toUpperCase()}</text> : null}
      <text x={pad} y={height * 0.15} fill={foreground} fontSize={width * 0.05} fontWeight={850}>{scene.title}</text>
      {scene.subtitle ? <text x={pad} y={height * 0.195} fill={muted} fontSize={width * 0.024} fontWeight={600}>{scene.subtitle}</text> : null}

      <g opacity={enter}>
        <LabelChip x={pad} y={height * 0.875} text={distanceText} foreground={background} background={accent} fontSize={width * 0.022} opacity={1} />
        {scene.travelTime ? <LabelChip x={width - pad} y={height * 0.875} text={scene.travelTime} foreground={foreground} background={background} fontSize={width * 0.022} anchor="end" opacity={1} /> : null}
      </g>

      <text x={pad} y={height * 0.96} fill={muted} fontSize={width * 0.016} fontWeight={600}>Map data: {route.source.name} · {route.source.license}</text>
    </svg>
  );
};
