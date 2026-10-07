import {getLength, getPointAtLength} from '@remotion/paths';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import type {AppStoreCreativeScene, VideoProject} from '../../project/schema';
import {resolveAsset} from '../../project/assets';
import {projectGeoPath} from './GeoRouteScene';

type Point = {x: number; y: number};

const pathData = (points: Point[]) =>
  points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(' ');

const loopWave = (phase: number) => 0.5 - 0.5 * Math.cos(phase * Math.PI * 2);

export const AppStoreCreativeSceneFrame = ({
  scene,
  project,
}: {
  scene: AppStoreCreativeScene;
  project: VideoProject;
}) => {
  const frame = useCurrentFrame();
  const {width, height, durationInFrames} = useVideoConfig();
  const route = project.geoRoutes?.[scene.routeId];
  if (!route) return null;

  const phase = frame / Math.max(1, durationInFrames - 1);
  const wave = loopWave(phase);
  const {accent} = project.theme;
  const wide = width / height > 2;
  const photoScale = 1.035 + wave * 0.045;
  const photoShiftX = Math.sin(phase * Math.PI * 2) * width * 0.012;
  const photoShiftY = Math.sin(phase * Math.PI * 2 + Math.PI / 2) * height * 0.008;

  const card = wide
    ? {x: width * 0.565, y: height * 0.095, w: width * 0.365, h: height * 0.81}
    : {x: width * 0.455, y: height * 0.105, w: width * 0.47, h: height * 0.79};

  const inset = Math.min(card.w, card.h) * 0.08;
  const mapW = card.w - inset * 2;
  const mapH = card.h - inset * 2;
  const projected = projectGeoPath(route.coordinates, mapW, mapH, scene.mapRotation);
  const points = projected.points;
  const routePath = pathData(points);
  const routeLength = getLength(routePath);
  const routeProgress = 0.08 + 0.92 * wave;
  const marker = getPointAtLength(routePath, routeLength * routeProgress) ?? points[0];
  const stops = [0.16, 0.38, 0.62, 0.82].map((progress) =>
    getPointAtLength(routePath, routeLength * progress) ?? points[0],
  );

  return (
    <AbsoluteFill style={{overflow: 'hidden', backgroundColor: '#1E261F'}}>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
        <defs>
          <linearGradient id={`photo-shade-${scene.id}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#142017" stopOpacity={wide ? 0.08 : 0.2} />
            <stop offset={wide ? '58%' : '44%'} stopColor="#142017" stopOpacity={wide ? 0.18 : 0.28} />
            <stop offset="100%" stopColor="#142017" stopOpacity={wide ? 0.5 : 0.58} />
          </linearGradient>
          <filter id={`card-shadow-${scene.id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy={Math.round(height * 0.018)} stdDeviation={Math.round(height * 0.018)} floodColor="#142017" floodOpacity="0.28" />
          </filter>
          <clipPath id={`map-clip-${scene.id}`}>
            <rect x={0} y={0} width={mapW} height={mapH} rx={Math.min(mapW, mapH) * 0.04} />
          </clipPath>
        </defs>

        <g transform={`translate(${photoShiftX} ${photoShiftY}) translate(${width / 2} ${height / 2}) scale(${photoScale}) translate(${-width / 2} ${-height / 2})`}>
          <image
            crossOrigin="anonymous"
            href={resolveAsset(scene.photoSrc)}
            x={-width * 0.035}
            y={-height * 0.035}
            width={width * 1.07}
            height={height * 1.07}
            preserveAspectRatio="xMidYMid slice"
          />
        </g>
        <rect width={width} height={height} fill={`url(#photo-shade-${scene.id})`} />

        <g transform={`translate(${card.x} ${card.y})`} filter={`url(#card-shadow-${scene.id})`}>
          <rect width={card.w} height={card.h} rx={Math.min(card.w, card.h) * 0.055} fill="#F1EEE3" fillOpacity={0.965} />
          <rect
            x={inset}
            y={inset}
            width={mapW}
            height={mapH}
            rx={Math.min(mapW, mapH) * 0.04}
            fill="#E7E5D9"
          />
          <g transform={`translate(${inset} ${inset})`} clipPath={`url(#map-clip-${scene.id})`}>
            <circle cx={mapW * 0.2} cy={mapH * 0.18} r={mapW * 0.26} fill="#D8DDCF" opacity={0.55} />
            <circle cx={mapW * 0.78} cy={mapH * 0.7} r={mapW * 0.34} fill="#D8DDCF" opacity={0.48} />
            {route.contextLines?.map((line, index) => (
              <path
                key={index}
                d={pathData(line.map(projected.toScreen))}
                fill="none"
                stroke="#817F75"
                strokeWidth={Math.max(2, mapW * 0.003)}
                strokeOpacity={0.18}
                strokeLinecap="round"
              />
            ))}
            <path
              d={routePath}
              fill="none"
              stroke="#8C897F"
              strokeWidth={mapW * 0.018}
              strokeOpacity={0.22}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={routePath}
              fill="none"
              stroke={accent}
              strokeWidth={mapW * 0.009}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={routeLength}
              strokeDashoffset={routeLength * (1 - routeProgress)}
            />
            {stops.map((point, index) => (
              <g key={index} opacity={0.55 + wave * 0.45}>
                <circle cx={point.x} cy={point.y} r={mapW * 0.018} fill="#F1EEE3" stroke={accent} strokeWidth={mapW * 0.007} />
                <circle cx={point.x} cy={point.y} r={mapW * 0.006} fill={accent} />
              </g>
            ))}
            <circle cx={marker.x} cy={marker.y} r={mapW * 0.034} fill={accent} opacity={0.12 + wave * 0.08} />
            <circle cx={marker.x} cy={marker.y} r={mapW * 0.015} fill="#F1EEE3" stroke={accent} strokeWidth={mapW * 0.007} />
            <circle cx={marker.x} cy={marker.y} r={mapW * 0.005} fill={accent} />
          </g>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
