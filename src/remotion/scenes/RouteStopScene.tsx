import {useCurrentFrame, useVideoConfig} from 'remotion';
import type {RouteStopScene, VideoProject} from '../../project/schema';
import {resolveAsset} from '../../project/assets';
import {projectGeoPath} from './GeoRouteScene';
import {progress01, spring01} from '../svg/primitives';

type Point = {x: number; y: number};

const pathData = (points: Point[]) =>
  points.map((point, index) =>
    `${index === 0 ? 'M' : 'L'}${point.x.toFixed(2)},${point.y.toFixed(2)}`,
  ).join(' ');

const pointAlongPath = (points: Point[], ratio: number) => {
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

const wrap = (value: string, maxChars: number) => {
  const words = value.split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
};

const TextLines = ({
  value,
  x,
  y,
  fontSize,
  lineHeight,
  fill,
  weight = 700,
  maxChars = 26,
}: {
  value: string;
  x: number;
  y: number;
  fontSize: number;
  lineHeight: number;
  fill: string;
  weight?: number;
  maxChars?: number;
}) => (
  <text x={x} y={y} fill={fill} fontSize={fontSize} fontWeight={weight}>
    {wrap(value, maxChars).map((line, index) => (
      <tspan key={`${line}-${index}`} x={x} dy={index === 0 ? 0 : lineHeight}>{line}</tspan>
    ))}
  </text>
);

const MiniRoute = ({
  scene,
  project,
  x,
  y,
  width,
  height,
}: {
  scene: RouteStopScene;
  project: VideoProject;
  x: number;
  y: number;
  width: number;
  height: number;
}) => {
  const route = scene.routeId ? project.geoRoutes?.[scene.routeId] : undefined;
  if (!route) return null;
  const projected = projectGeoPath(route.coordinates, width, height, scene.mapRotation);
  const path = pathData(projected.points);
  const marker = pointAlongPath(projected.points, scene.routeProgress);
  const {background, foreground, muted, accent} = project.theme;

  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={width} height={height} rx={width * 0.055} fill={background} fillOpacity={0.9} stroke={muted} strokeOpacity={0.22} strokeWidth={2} />
      <path d={path} fill="none" stroke={muted} strokeOpacity={0.28} strokeWidth={Math.max(2, width * 0.018)} strokeLinecap="round" strokeLinejoin="round" />
      <path
        d={path}
        fill="none"
        stroke={accent}
        strokeWidth={Math.max(2, width * 0.012)}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - scene.routeProgress}
      />
      <circle cx={marker.x} cy={marker.y} r={width * 0.045} fill={accent} opacity={0.16} />
      <circle cx={marker.x} cy={marker.y} r={width * 0.018} fill={foreground} stroke={accent} strokeWidth={width * 0.009} />
    </g>
  );
};

export const RouteStopSceneFrame = ({
  scene,
  project,
}: {
  scene: RouteStopScene;
  project: VideoProject;
}) => {
  const frame = useCurrentFrame();
  const {width, height, fps, durationInFrames} = useVideoConfig();
  const {background, foreground, muted, accent} = project.theme;
  const pad = width * 0.075;
  const enter = spring01(frame, fps);
  const reveal = progress01(frame, fps * 0.08, Math.max(fps * 0.65, durationInFrames * 0.46));
  const imageScale = 1.04 + reveal * 0.035;
  const isSplit = scene.layout === 'split';
  const isPhotoMap = scene.layout === 'photo-map';
  const isMinimal = scene.layout === 'minimal';
  const photoHeight = isPhotoMap ? height * 0.58 : isSplit ? height * 0.53 : height;
  const contentTop = isPhotoMap || isSplit ? photoHeight : height * 0.55;
  const mapWidth = isPhotoMap ? width * 0.36 : width * 0.31;
  const mapHeight = isPhotoMap ? height * 0.15 : height * 0.12;
  const mapX = width - pad - mapWidth;
  const mapY = isPhotoMap ? height * 0.68 : height * 0.16;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
      <rect width={width} height={height} fill={background} />

      {scene.src && !isMinimal ? (
        <g transform={`translate(${width / 2} ${photoHeight / 2}) scale(${imageScale}) translate(${-width / 2} ${-photoHeight / 2})`}>
          <image
            crossOrigin="anonymous"
            href={resolveAsset(scene.src)}
            x={0}
            y={0}
            width={width}
            height={photoHeight}
            preserveAspectRatio="xMidYMid slice"
          />
        </g>
      ) : null}

      {!isPhotoMap && !isSplit && !isMinimal ? (
        <>
          <defs>
            <linearGradient id={`stop-overlay-${scene.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="20%" stopColor="#000000" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.84" />
            </linearGradient>
          </defs>
          <rect width={width} height={height} fill={`url(#stop-overlay-${scene.id})`} />
        </>
      ) : null}

      {(isPhotoMap || isSplit) ? <rect x={0} y={photoHeight} width={width} height={height - photoHeight} fill={background} /> : null}

      <g opacity={enter} transform={`translate(0 ${(1 - enter) * height * 0.025})`}>
        {scene.kicker ? <text x={pad} y={contentTop + height * 0.06} fill={accent} fontSize={width * 0.019} fontWeight={850} letterSpacing={3}>{scene.kicker.toUpperCase()}</text> : null}
        <TextLines value={scene.title} x={pad} y={contentTop + height * 0.115} fontSize={width * 0.064} lineHeight={width * 0.07} fill={foreground} weight={850} maxChars={18} />
        {scene.subtitle ? <text x={pad} y={contentTop + height * 0.17} fill={muted} fontSize={width * 0.027} fontWeight={650}>{scene.subtitle}</text> : null}

        <g transform={`translate(${pad} ${contentTop + height * 0.225})`}>
          {scene.number ? <text x={0} y={0} fill={accent} fontSize={width * 0.042} fontWeight={900}>{scene.number}</text> : null}
          {scene.time ? <text x={width * 0.18} y={0} fill={foreground} fontSize={width * 0.025} fontWeight={750}>{scene.time}</text> : null}
          {scene.distance ? <text x={0} y={height * 0.04} fill={muted} fontSize={width * 0.021} fontWeight={650}>{scene.distance}</text> : null}
        </g>

        {scene.body ? <TextLines value={scene.body} x={pad} y={contentTop + height * 0.325} fontSize={width * 0.026} lineHeight={width * 0.038} fill={foreground} weight={560} maxChars={34} /> : null}
      </g>

      <MiniRoute scene={scene} project={project} x={mapX} y={mapY} width={mapWidth} height={mapHeight} />
      {scene.routeId && project.geoRoutes?.[scene.routeId] ? (
        <text x={pad} y={height * 0.965} fill={muted} fontSize={width * 0.015} fontWeight={600}>Map data: {project.geoRoutes[scene.routeId].source.name} · {project.geoRoutes[scene.routeId].source.license}</text>
      ) : null}
    </svg>
  );
};
