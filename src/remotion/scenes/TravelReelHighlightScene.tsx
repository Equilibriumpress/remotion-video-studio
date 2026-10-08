import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {VideoProject, VideoScene} from '../../project/schema';
import {projectGeoPath} from './GeoRouteScene';
import {FittedSvgText} from '../svg/FittedSvgText';

type Highlight = Extract<VideoScene, {type: 'travel-reel-highlight'}>;
const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
type Point = {x: number; y: number};

// Find the stop on the *committed real route* rather than inventing a normalized map position.
export const snapReelStop = (route: Point[], stop: Point) => {
  let best = {point: route[0], distance: Infinity, progress: 0};
  const segments = route.slice(1).map((p, i) => Math.hypot(p.x - route[i].x, p.y - route[i].y));
  const total = Math.max(1e-9, segments.reduce((s, n) => s + n, 0));
  let walked = 0;
  for (let i = 0; i < segments.length; i++) {
    const a = route[i], b = route[i + 1], length = segments[i];
    const t = Math.max(0, Math.min(1, ((stop.x - a.x) * (b.x - a.x) + (stop.y - a.y) * (b.y - a.y)) / Math.max(1e-9, length * length)));
    const p = {x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y)};
    const distance = Math.hypot(p.x - stop.x, p.y - stop.y);
    if (distance < best.distance) best = {point: p, distance, progress: (walked + t * length) / total};
    walked += length;
  }
  return best;
};

/**
 * Original 9:16 SVG editorial stop illustration. Abstract motifs are graphic
 * symbols, not depictions of a specific building. No external media or WebGL.
 * TikTok/Reels caption band and right-side action rail stay unobstructed.
 */
export const TravelReelHighlightSceneFrame = ({scene, project}: {scene: Highlight; project: VideoProject}) => {
  const frame = useCurrentFrame();
  const {fps, width: w, height: h, durationInFrames} = useVideoConfig();
  const route = project.geoRoutes?.[scene.routeId];
  if (!route) return null;
  const {background: bg, foreground: fg, muted, accent} = project.theme;
  const x = w * 0.075;
  const enter = spring({frame, fps, config: {damping: 18, stiffness: 135, mass: 0.9}});
  const reveal = interpolate(frame, [0, fps * 1.45], [0, 1], clamp);
  const draw = interpolate(frame, [fps * 0.15, Math.max(fps * 0.9, durationInFrames * 0.72)], [0, 1], clamp);
  const haloY = h * 0.455;
  const motifX = w * 0.49;
  const motifScale = w * 0.8 / 600;
  const pathD = (points: Point[]) => points.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const proj = projectGeoPath(route.coordinates, w * 0.78, h * 0.115);
  const snapped = snapReelStop(proj.points, proj.toScreen(scene.stop.coordinates));
  const track = pathD(proj.points);
  const illustrated = (d: string, thickness = 8) => (
    <path d={d} fill="none" stroke={accent} strokeWidth={thickness}
      strokeLinejoin="round" strokeLinecap="round" pathLength={1}
      strokeDasharray={1} strokeDashoffset={1 - reveal} />
  );
  const motif = (() => {
    switch (scene.motif) {
      case 'temple':
        return <>
          {illustrated('M60 115 L300 24 L540 115 M105 130 L495 130 M132 155 L468 155 M155 167 L155 344 M445 167 L445 344 M90 356 L510 356 M214 344 L214 235 L386 235 L386 344', 10)}
          {illustrated('M218 222 L300 187 L382 222 M75 380 L525 380 M110 402 L490 402', 5)}
        </>;
      case 'old-street':
        return <>
          {illustrated('M65 360 L262 160 L338 160 L535 360 M165 360 L277 205 M435 360 L323 205 M262 160 L270 85 M338 160 L330 85', 9)}
          {illustrated('M95 242 L240 130 M360 130 L505 242 M165 215 L239 180 M361 180 L435 215 M95 360 L95 242 M505 360 L505 242', 6)}
          {illustrated('M230 360 L285 246 M370 360 L315 246', 4)}
        </>;
      case 'torii':
        return <>
          {illustrated('M95 128 L505 128 M118 149 L482 149 M145 190 L455 190 M187 190 L187 385 M413 190 L413 385 M140 383 L460 383', 13)}
          {illustrated('M150 230 L450 230 M255 195 L255 252 M345 195 L345 252', 6)}
        </>;
      case 'lanterns':
        return <>
          {illustrated('M90 96 L510 96 M150 96 L150 157 M300 96 L300 157 M450 96 L450 157', 7)}
          {[150, 300, 450].map((cx, i) => (
            <g key={i} opacity={reveal}>
              <path d={`M${cx - 35} 160 Q${cx} 135 ${cx + 35} 160 L${cx + 28} 276 Q${cx} 297 ${cx - 28} 276 Z`}
                fill={accent} fillOpacity={0.13} stroke={accent} strokeWidth={6}/>
              <path d={`M${cx - 27} 191 L${cx + 27} 191 M${cx - 27} 245 L${cx + 27} 245`} stroke={accent} strokeWidth={4}/>
              <circle cx={cx} cy={220} r={13} fill={accent} opacity={0.5}/>
            </g>
          ))}
          {illustrated('M80 360 L520 360 M125 390 L475 390', 6)}
        </>;
    }
  })();
  const pulse = 1 + Math.sin(frame / fps * 2.7) * 0.12;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%">
      <defs>
        <radialGradient id={`reel-glow-${scene.id}`}>
          <stop offset="0%" stopColor={accent} stopOpacity={0.19} />
          <stop offset="100%" stopColor={accent} stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect width={w} height={h} fill={bg} />
      <circle cx={motifX} cy={haloY} r={w * 0.6} fill={`url(#reel-glow-${scene.id})`} />
      <rect x={x} y={h * 0.125} width={w * 0.085} height={7} rx={3} fill={accent} />
      <text x={x} y={h * 0.164} fontSize={w * 0.024} fill={accent} fontWeight={850} letterSpacing={3}>
        {scene.kicker.toUpperCase()}
      </text>
      <g opacity={enter} transform={`translate(0 ${(1 - enter) * 44})`}>
        <FittedSvgText value={scene.title} x={x} y={h * 0.237}
          maxWidth={w * 0.78} maxLines={2} maxFontSize={w * 0.078}
          weight={850} fill={fg} />
        <text x={x} y={h * 0.295} fontSize={w * 0.028} fill={muted} fontWeight={560}>
          {scene.subtitle}
        </text>
      </g>
      <text x={w * 0.87} y={h * 0.386} textAnchor="end"
        fontSize={w * 0.22} fontWeight={900} fill={accent} opacity={0.055}>
        {scene.number}
      </text>
      <g transform={`translate(${motifX - 300 * motifScale} ${haloY - 210 * motifScale}) scale(${motifScale})`}
        opacity={enter}>
        {motif}
      </g>
      <rect x={x} y={h * 0.585} width={w * 0.78} height={h * 0.117}
        rx={w * 0.024} fill={fg} fillOpacity={0.043}
        stroke={accent} strokeOpacity={0.30} strokeWidth={2}/>
      <text x={x + w * 0.032} y={h * 0.609} fill={accent} fontSize={w * 0.018}
        fontWeight={850} letterSpacing={2.4}>THE WALK / ROUTE POSITION</text>
      <g transform={`translate(${x + w * 0.035} ${h * 0.606})`}>
        <path d={track} fill="none" stroke={muted} strokeWidth={w * 0.004} strokeOpacity={0.38} strokeLinecap="round"/>
        <path d={track} fill="none" stroke={accent} strokeWidth={w * 0.007}
          strokeLinecap="round" pathLength={1} strokeDasharray={1}
          strokeDashoffset={1 - snapped.progress * draw}/>
        <circle cx={snapped.point.x} cy={snapped.point.y} r={w * 0.031 * pulse}
          fill={accent} opacity={0.15 + 0.1 * reveal}/>
        <circle cx={snapped.point.x} cy={snapped.point.y} r={w * 0.010}
          fill={fg} stroke={accent} strokeWidth={w * 0.005}/>
      </g>
      <text x={x} y={h * 0.936} fill={muted} fontSize={w * 0.017} opacity={0.58}>
        Route: OpenStreetMap / ODbL · Graphic motifs are illustrative
      </text>
    </svg>
  );
};
