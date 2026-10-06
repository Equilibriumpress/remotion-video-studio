import {useCurrentFrame, useVideoConfig} from 'remotion';
import type {VideoProject, VideoScene} from '../../project/schema';
import {resolveAsset} from '../../project/assets';
import {
  LabelChip,
  LocationPin,
  MotionGrid,
  ProgressRing,
  RoutePath,
  progress01,
  spring01,
} from '../svg/primitives';

type RoutePoint = {
  x: number;
  y: number;
  label: string;
  detail?: string;
  icon?: 'pin' | 'temple' | 'nature' | 'station' | 'city';
};

const routePath = (points: RoutePoint[], width: number, height: number, pad: number) => {
  const innerWidth = width - pad * 2;
  const innerHeight = height * 0.56;
  const top = height * 0.24;
  const mapped = points.map((point) => ({
    x: pad + point.x * innerWidth,
    y: top + point.y * innerHeight,
    label: point.label,
    detail: point.detail,
    icon: point.icon ?? 'pin',
  }));
  return {
    mapped,
    d: mapped.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' '),
  };
};

const positionAlongRoute = (points: {x: number; y: number}[], progress: number) => {
  if (points.length === 0) return {x: 0, y: 0};
  if (points.length === 1) return points[0];

  const lengths = points.slice(1).map((point, index) =>
    Math.hypot(point.x - points[index].x, point.y - points[index].y),
  );
  const total = lengths.reduce((sum, value) => sum + value, 0) || 1;
  let target = total * Math.max(0, Math.min(1, progress));

  for (let index = 0; index < lengths.length; index += 1) {
    if (target <= lengths[index]) {
      const start = points[index];
      const end = points[index + 1];
      const local = lengths[index] === 0 ? 0 : target / lengths[index];
      return {
        x: start.x + (end.x - start.x) * local,
        y: start.y + (end.y - start.y) * local,
      };
    }
    target -= lengths[index];
  }

  return points[points.length - 1];
};

const WatercolorField = ({
  width,
  height,
  accent,
  muted,
  frame,
}: {
  width: number;
  height: number;
  accent: string;
  muted: string;
  frame: number;
}) => (
  <g>
    {Array.from({length: 12}).map((_, index) => {
      const x = width * (((index * 37) % 101) / 101);
      const y = height * (((index * 61) % 103) / 103);
      const rx = width * (0.08 + (index % 4) * 0.035);
      const ry = height * (0.035 + (index % 3) * 0.02);
      const drift = Math.sin(frame * 0.01 + index) * width * 0.008;
      return (
        <ellipse
          key={index}
          cx={x + drift}
          cy={y}
          rx={rx}
          ry={ry}
          fill={index % 2 === 0 ? accent : muted}
          opacity={0.035 + (index % 4) * 0.012}
          transform={`rotate(${(index * 23) % 160} ${x} ${y})`}
        />
      );
    })}
  </g>
);

const FlowField = ({
  width,
  height,
  accent,
  frame,
}: {
  width: number;
  height: number;
  accent: string;
  frame: number;
}) => (
  <g opacity={0.12}>
    {Array.from({length: 18}).map((_, index) => {
      const y = height * (0.16 + index * 0.04);
      const phase = frame * 0.35 + index * 19;
      const d = `M ${-width * 0.08} ${y}
        C ${width * 0.18} ${y + Math.sin((phase + 10) * 0.02) * height * 0.07},
          ${width * 0.36} ${y + Math.cos((phase + 40) * 0.018) * height * 0.08},
          ${width * 0.54} ${y + Math.sin((phase + 80) * 0.02) * height * 0.06}
        S ${width * 0.88} ${y + Math.cos((phase + 120) * 0.02) * height * 0.06},
          ${width * 1.08} ${y}`;
      return <path key={index} d={d} fill="none" stroke={accent} strokeWidth={1.5 + (index % 3)} strokeLinecap="round" />;
    })}
  </g>
);

const MapTexture = ({
  style,
  width,
  height,
  accent,
  muted,
  frame,
}: {
  style: 'clean' | 'watercolor' | 'flow';
  width: number;
  height: number;
  accent: string;
  muted: string;
  frame: number;
}) => {
  if (style === 'watercolor') {
    return <WatercolorField width={width} height={height} accent={accent} muted={muted} frame={frame} />;
  }
  if (style === 'flow') {
    return <FlowField width={width} height={height} accent={accent} frame={frame} />;
  }
  return <MotionGrid width={width} height={height} gap={width * 0.095} stroke={accent} opacity={0.055} />;
};

const ContextMap = ({
  width,
  height,
  pad,
  path,
  stroke,
  fill,
  style,
  muted,
  frame,
}: {
  width: number;
  height: number;
  pad: number;
  path?: string;
  stroke: string;
  fill: string;
  style: 'clean' | 'watercolor' | 'flow';
  muted: string;
  frame: number;
}) => (
  <>
    <MapTexture style={style} width={width} height={height} accent={stroke} muted={muted} frame={frame} />
    {path ? (
      <path
        d={path}
        fill={fill}
        fillOpacity={style === 'watercolor' ? 0.12 : 0.08}
        stroke={stroke}
        strokeOpacity={style === 'flow' ? 0.28 : 0.2}
        strokeWidth={2}
        transform={`translate(${pad * 0.25} ${height * 0.1}) scale(0.9)`}
      />
    ) : (
      <>
        <path d={`M ${pad} ${height * 0.36} C ${width * 0.28} ${height * 0.22}, ${width * 0.38} ${height * 0.58}, ${width * 0.58} ${height * 0.38} S ${width * 0.86} ${height * 0.3}, ${width - pad} ${height * 0.48}`} fill="none" stroke={stroke} strokeOpacity={0.12} strokeWidth={3} />
        <path d={`M ${pad * 1.3} ${height * 0.68} C ${width * 0.32} ${height * 0.54}, ${width * 0.52} ${height * 0.82}, ${width - pad} ${height * 0.62}`} fill="none" stroke={stroke} strokeOpacity={0.08} strokeWidth={2} />
      </>
    )}
  </>
);

const Landmark = ({
  x,
  y,
  icon,
  size,
  fill,
  stroke,
  progress,
}: {
  x: number;
  y: number;
  icon: RoutePoint['icon'];
  size: number;
  fill: string;
  stroke: string;
  progress: number;
}) => {
  if (!icon || icon === 'pin') {
    return <LocationPin x={x} y={y} size={size} fill={fill} ring={stroke} progress={progress} />;
  }

  const s = size;
  return (
    <g transform={`translate(${x} ${y}) scale(${0.7 + 0.3 * progress})`} opacity={progress} stroke={stroke} strokeWidth={s * 0.07} strokeLinecap="round" strokeLinejoin="round">
      <circle r={s * 0.7} fill={fill} opacity={0.92} stroke="none" />
      {icon === 'temple' ? (
        <>
          <path d={`M ${-s*0.38} ${-s*0.08} L 0 ${-s*0.38} L ${s*0.38} ${-s*0.08}`} fill="none" />
          <path d={`M ${-s*0.28} ${-s*0.02} H ${s*0.28} V ${s*0.32} H ${-s*0.28} Z`} fill="none" />
          <line x1={0} y1={-s*0.38} x2={0} y2={s*0.32} />
        </>
      ) : icon === 'nature' ? (
        <>
          <path d={`M 0 ${s*0.34} V ${-s*0.04}`} fill="none" />
          <path d={`M 0 ${-s*0.38} C ${-s*0.34} ${-s*0.24}, ${-s*0.28} ${s*0.05}, 0 ${s*0.06} C ${s*0.28} ${s*0.05}, ${s*0.34} ${-s*0.24}, 0 ${-s*0.38} Z`} fill="none" />
        </>
      ) : icon === 'station' ? (
        <>
          <rect x={-s*0.27} y={-s*0.32} width={s*0.54} height={s*0.56} rx={s*0.08} fill="none" />
          <line x1={-s*0.2} y1={-s*0.12} x2={s*0.2} y2={-s*0.12} />
          <line x1={-s*0.18} y1={s*0.32} x2={-s*0.05} y2={s*0.2} />
          <line x1={s*0.18} y1={s*0.32} x2={s*0.05} y2={s*0.2} />
        </>
      ) : (
        <>
          <rect x={-s*0.32} y={-s*0.2} width={s*0.18} height={s*0.48} fill="none" />
          <rect x={-s*0.06} y={-s*0.36} width={s*0.2} height={s*0.64} fill="none" />
          <rect x={s*0.2} y={-s*0.1} width={s*0.15} height={s*0.38} fill="none" />
        </>
      )}
    </g>
  );
};

export const MapSceneFrame = ({
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
  const titleSize = width * (height > width ? 0.075 : 0.05);
  const bodySize = width * (height > width ? 0.038 : 0.025);
  const routeProgress = progress01(frame, fps * 0.12, Math.min(durationInFrames - 1, fps * 1.65));
  const intro = spring01(frame, fps);

  if (scene.type === 'route-map' || scene.type === 'progress-route' || scene.type === 'map-overlay') {
    const {mapped, d} = routePath(scene.points, width, height, pad);
    const targetProgress = scene.type === 'progress-route' ? scene.progress : 1;
    const drawn = routeProgress * targetProgress;
    const marker = positionAlongRoute(mapped, drawn);
    const contextPath = scene.contextPath;
    const style = scene.style ?? 'clean';
    const showDetails = scene.showDetails ?? true;
    const cameraScale = 1.07 - routeProgress * 0.07;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
        {scene.type === 'map-overlay' && scene.src ? (
          <>
            <image crossOrigin="anonymous" href={resolveAsset(scene.src)} width={width} height={height} preserveAspectRatio="xMidYMid slice" />
            <rect width={width} height={height} fill="rgba(7,10,12,0.48)" />
          </>
        ) : (
          <rect width={width} height={height} fill={background} />
        )}
        <g transform={`translate(${width/2} ${height/2}) scale(${cameraScale}) translate(${-width/2} ${-height/2})`}>
          <ContextMap width={width} height={height} pad={pad} path={contextPath} stroke={accent} fill={accent} style={style} muted={muted} frame={frame} />
          <RoutePath d={d} progress={drawn} length={1200} stroke={accent} strokeWidth={9} casing={background} />
          {mapped.map((point, index) => {
            const pinP = progress01(frame, fps * 0.28 + index * fps * 0.1, fps * 0.8 + index * fps * 0.1);
            return (
              <g key={`${point.label}-${index}`}>
                <Landmark x={point.x} y={point.y} icon={point.icon} size={width * 0.04} fill={accent} stroke={foreground} progress={pinP} />
                <LabelChip
                  x={point.x}
                  y={point.y - width * 0.062}
                  text={point.label}
                  foreground={foreground}
                  background={background}
                  fontSize={bodySize * 0.52}
                  anchor="middle"
                  opacity={pinP}
                />
                {showDetails && point.detail ? (
                  <text x={point.x} y={point.y + width*0.072} fill={muted} fontSize={bodySize*0.43} fontWeight={700} textAnchor="middle" opacity={pinP}>
                    {point.detail}
                  </text>
                ) : null}
              </g>
            );
          })}
          <circle cx={marker.x} cy={marker.y} r={width*0.045} fill={accent} opacity={0.12} />
          <LocationPin x={marker.x} y={marker.y} size={width * 0.055} fill={foreground} ring={accent} progress={intro} />
        </g>
        <text x={pad} y={height * 0.14} fill={foreground} fontSize={titleSize * 0.72} fontWeight={820}>{scene.title}</text>
        {scene.type === 'route-map' && scene.distance ? (
          <LabelChip x={width-pad} y={height*0.9} text={scene.distance} foreground={background} background={accent} fontSize={bodySize*0.62} anchor="end" opacity={intro} />
        ) : null}
        {scene.type === 'progress-route' ? (
          <>
            <ProgressRing cx={width-pad*1.55} cy={height*0.88} radius={width*0.065} progress={drawn} stroke={accent} track={foreground} strokeWidth={width*0.014} />
            <text x={width-pad*1.55} y={height*0.885} fill={foreground} fontSize={bodySize*0.55} fontWeight={800} textAnchor="middle">{Math.round(drawn*100)}%</text>
            {scene.label ? <text x={pad} y={height*0.9} fill={muted} fontSize={bodySize*0.68} fontWeight={650}>{scene.label}</text> : null}
          </>
        ) : null}
      </svg>
    );
  }

  if (scene.type === 'location-card') {
    const x = pad + scene.x * (width - pad * 2);
    const y = height * 0.24 + scene.y * (height * 0.52);
    return (
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
        <rect width={width} height={height} fill={background} />
        <ContextMap width={width} height={height} pad={pad} path={scene.contextPath} stroke={accent} fill={accent} style="clean" muted={muted} frame={frame} />
        <LocationPin x={x} y={y} size={width*0.075} fill={accent} ring={foreground} progress={intro} />
        <g opacity={intro} transform={`translate(0 ${(1-intro)*height*0.035})`}>
          <text x={pad} y={height*0.15} fill={accent} fontSize={bodySize*0.62} fontWeight={850} letterSpacing={4}>LOCATION</text>
          <text x={pad} y={height*0.82} fill={foreground} fontSize={titleSize} fontWeight={850}>{scene.location}</text>
          {scene.region ? <text x={pad} y={height*0.87} fill={muted} fontSize={bodySize*0.7} fontWeight={650}>{scene.region}</text> : null}
          <text x={pad} y={height*0.93} fill={foreground} fontSize={bodySize*0.58} fontWeight={650}>{scene.title}</text>
          {scene.subtitle ? <text x={width-pad} y={height*0.93} fill={muted} fontSize={bodySize*0.52} fontWeight={600} textAnchor="end">{scene.subtitle}</text> : null}
        </g>
      </svg>
    );
  }

  return null;
};
