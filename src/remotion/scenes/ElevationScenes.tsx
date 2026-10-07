import {useCurrentFrame, useVideoConfig} from 'remotion';
import type {ElevationRouteScene, VideoProject} from '../../project/schema';
import {progress01, spring01} from '../svg/primitives';

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const interpolateProfile = (
  samples: ReadonlyArray<{distanceKm: number; elevationM: number}>,
  distanceKm: number,
) => {
  if (distanceKm <= samples[0].distanceKm) return samples[0].elevationM;
  for (let i = 0; i < samples.length - 1; i++) {
    const a = samples[i];
    const b = samples[i + 1];
    if (distanceKm <= b.distanceKm) {
      const span = Math.max(0.000001, b.distanceKm - a.distanceKm);
      const t = clamp01((distanceKm - a.distanceKm) / span);
      return a.elevationM + (b.elevationM - a.elevationM) * t;
    }
  }
  return samples[samples.length - 1].elevationM;
};

export const ElevationRouteSceneFrame = ({
  scene,
  project,
}: {
  scene: ElevationRouteScene;
  project: VideoProject;
}) => {
  const frame = useCurrentFrame();
  const {width, height, fps, durationInFrames} = useVideoConfig();
  const profile = project.elevationProfiles?.[scene.profileId];
  if (!profile) return null;

  const {background, foreground, muted, accent} = project.theme;
  const pad = width * 0.075;
  const graphLeft = pad;
  const graphRight = width - pad;
  const graphTop = height * 0.32;
  const graphBottom = height * 0.71;
  const graphWidth = graphRight - graphLeft;
  const graphHeight = graphBottom - graphTop;
  const samples = profile.samples;
  const minDistance = samples[0].distanceKm;
  const maxDistance = samples[samples.length - 1].distanceKm;
  const distanceSpan = Math.max(0.000001, maxDistance - minDistance);
  const elevations = samples.map((sample) => sample.elevationM);
  const minElevation = Math.min(...elevations);
  const maxElevation = Math.max(...elevations);
  const elevationSpan = Math.max(1, maxElevation - minElevation);
  const projectPoint = (sample: {distanceKm: number; elevationM: number}) => ({
    x: graphLeft + ((sample.distanceKm - minDistance) / distanceSpan) * graphWidth,
    y: graphBottom - ((sample.elevationM - minElevation) / elevationSpan) * graphHeight,
  });
  const points = samples.map(projectPoint);
  const path = points.map((point, index) =>
    `${index === 0 ? 'M' : 'L'}${point.x.toFixed(2)},${point.y.toFixed(2)}`,
  ).join(' ');
  const fillPath = `${path} L${graphRight},${graphBottom} L${graphLeft},${graphBottom} Z`;
  const reveal = progress01(frame, fps * 0.12, Math.max(fps * 0.8, durationInFrames * 0.74));
  const drawn = reveal * scene.progress;
  const currentDistance = minDistance + distanceSpan * drawn;
  const currentElevation = interpolateProfile(samples, currentDistance);
  const markerX = graphLeft + drawn * graphWidth;
  const markerY = graphBottom - ((currentElevation - minElevation) / elevationSpan) * graphHeight;
  const ascent = samples.slice(1).reduce((sum, sample, index) =>
    sum + Math.max(0, sample.elevationM - samples[index].elevationM), 0);
  const enter = spring01(frame, fps);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
      <rect width={width} height={height} fill={background} />
      <defs>
        <linearGradient id={`elevation-fill-${scene.id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.32" />
          <stop offset="100%" stopColor={accent} stopOpacity="0.02" />
        </linearGradient>
        <clipPath id={`elevation-reveal-${scene.id}`}>
          <rect x={graphLeft} y={graphTop - 12} width={graphWidth * drawn} height={graphHeight + 24} />
        </clipPath>
      </defs>

      <text x={pad} y={height * 0.13} fill={foreground} fontSize={width * 0.052} fontWeight={840}>{scene.title}</text>
      <text x={pad} y={height * 0.18} fill={muted} fontSize={width * 0.022} fontWeight={720} letterSpacing={3}>ELEVATION PROFILE</text>

      {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
        const y = graphTop + ratio * graphHeight;
        const elevation = Math.round(maxElevation - ratio * elevationSpan);
        return (
          <g key={ratio}>
            <line x1={graphLeft} y1={y} x2={graphRight} y2={y} stroke={muted} strokeOpacity={0.12} strokeWidth={1.5} />
            <text x={graphLeft} y={y - 10} fill={muted} fontSize={width * 0.018} fontWeight={650}>{elevation} m</text>
          </g>
        );
      })}

      <path d={fillPath} fill={`url(#elevation-fill-${scene.id})`} clipPath={`url(#elevation-reveal-${scene.id})`} />
      <path
        d={path}
        fill="none"
        stroke={muted}
        strokeOpacity={0.22}
        strokeWidth={width * 0.011}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={path}
        fill="none"
        stroke={accent}
        strokeWidth={width * 0.008}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - drawn}
      />

      {samples.filter((sample) => sample.label).map((sample) => {
        const point = projectPoint(sample);
        return (
          <g key={`${sample.distanceKm}-${sample.label}`} opacity={drawn + 0.03 >= (sample.distanceKm - minDistance) / distanceSpan ? enter : 0.2}>
            <circle cx={point.x} cy={point.y} r={width * 0.012} fill={background} stroke={accent} strokeWidth={width * 0.005} />
            <text x={point.x} y={point.y - width * 0.03} fill={foreground} fontSize={width * 0.018} fontWeight={700} textAnchor="middle">{sample.label}</text>
          </g>
        );
      })}

      <line x1={markerX} y1={graphTop} x2={markerX} y2={graphBottom} stroke={accent} strokeOpacity={0.28} strokeWidth={2} />
      <circle cx={markerX} cy={markerY} r={width * 0.026} fill={accent} opacity={0.18} />
      <circle cx={markerX} cy={markerY} r={width * 0.012} fill={foreground} stroke={accent} strokeWidth={width * 0.006} />

      <text x={graphLeft} y={graphBottom + height * 0.045} fill={muted} fontSize={width * 0.019} fontWeight={650}>{minDistance.toFixed(1)} km</text>
      <text x={graphRight} y={graphBottom + height * 0.045} fill={muted} fontSize={width * 0.019} fontWeight={650} textAnchor="end">{maxDistance.toFixed(1)} km</text>

      {scene.showStats ? (
        <g opacity={enter}>
          <text x={pad} y={height * 0.82} fill={accent} fontSize={width * 0.065} fontWeight={880}>{Math.round(currentElevation)} m</text>
          <text x={pad} y={height * 0.86} fill={muted} fontSize={width * 0.022} fontWeight={650}>at {currentDistance.toFixed(1)} km</text>
          <text x={width - pad} y={height * 0.82} fill={foreground} fontSize={width * 0.04} fontWeight={800} textAnchor="end">+{Math.round(ascent)} m</text>
          <text x={width - pad} y={height * 0.86} fill={muted} fontSize={width * 0.02} fontWeight={650} textAnchor="end">total ascent</text>
        </g>
      ) : null}

      {scene.label ? <text x={pad} y={height * 0.92} fill={foreground} fontSize={width * 0.026} fontWeight={650}>{scene.label}</text> : null}
      {profile.source ? <text x={pad} y={height * 0.965} fill={muted} fontSize={width * 0.016} fontWeight={600}>Profile: {profile.source.name}{profile.source.license ? ` · ${profile.source.license}` : ''}</text> : null}
    </svg>
  );
};
