import {useCurrentFrame, useVideoConfig} from 'remotion';
import type {VideoProject, VideoScene} from '../../project/schema';
import {MotionGrid, progress01, spring01} from '../svg/primitives';

const CornerBrackets = ({
  x,
  y,
  width,
  height,
  stroke,
  progress,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  stroke: string;
  progress: number;
}) => {
  const l = Math.min(width, height) * 0.12 * progress;
  return (
    <g stroke={stroke} strokeWidth={4} fill="none" opacity={progress}>
      <path d={`M ${x} ${y + l} V ${y} H ${x + l}`} />
      <path d={`M ${x + width - l} ${y} H ${x + width} V ${y + l}`} />
      <path d={`M ${x} ${y + height - l} V ${y + height} H ${x + l}`} />
      <path d={`M ${x + width - l} ${y + height} H ${x + width} V ${y + height - l}`} />
    </g>
  );
};

const ScannerLine = ({
  width,
  height,
  progress,
  stroke,
}: {
  width: number;
  height: number;
  progress: number;
  stroke: string;
}) => {
  const y = height * (0.18 + progress * 0.64);
  return (
    <g opacity={0.7}>
      <line x1={width * 0.12} y1={y} x2={width * 0.88} y2={y} stroke={stroke} strokeWidth={2} />
      <rect x={width * 0.12} y={y - height * 0.03} width={width * 0.76} height={height * 0.06} fill={stroke} opacity={0.05} />
    </g>
  );
};

const ParticleField = ({
  width,
  height,
  frame,
  color,
}: {
  width: number;
  height: number;
  frame: number;
  color: string;
}) => (
  <g opacity={0.38}>
    {Array.from({length: 26}).map((_, index) => {
      const baseX = ((index * 73) % 997) / 997;
      const baseY = ((index * 191) % 991) / 991;
      const drift = ((frame * (0.25 + (index % 5) * 0.07)) % height) / height;
      const yNorm = (baseY + drift) % 1;
      const size = 2 + (index % 4) * 1.3;
      return (
        <circle
          key={index}
          cx={width * baseX}
          cy={height * yNorm}
          r={size}
          fill={color}
          opacity={0.24 + (index % 5) * 0.09}
        />
      );
    })}
  </g>
);

const HudIcon = ({
  kind,
  x,
  y,
  size,
  stroke,
}: {
  kind: 'spark' | 'grid' | 'route' | 'chart' | 'play' | 'code';
  x: number;
  y: number;
  size: number;
  stroke: string;
}) => {
  const s = size;
  const common = {stroke, strokeWidth: Math.max(2, s * 0.06), fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};

  if (kind === 'grid') {
    return <g {...common}>{[0,1].flatMap(row => [0,1].map(col => <rect key={`${row}-${col}`} x={x + col*s*0.42} y={y + row*s*0.42} width={s*0.28} height={s*0.28} rx={s*0.04} />))}</g>;
  }
  if (kind === 'route') {
    return <g {...common}><circle cx={x+s*0.12} cy={y+s*0.72} r={s*0.08}/><circle cx={x+s*0.8} cy={y+s*0.2} r={s*0.08}/><path d={`M ${x+s*0.2} ${y+s*0.68} C ${x+s*0.36} ${y+s*0.64}, ${x+s*0.42} ${y+s*0.26}, ${x+s*0.72} ${y+s*0.24}`}/></g>;
  }
  if (kind === 'chart') {
    return <g {...common}><path d={`M ${x} ${y+s*0.8} H ${x+s*0.9}`}/><path d={`M ${x+s*0.08} ${y+s*0.64} L ${x+s*0.33} ${y+s*0.46} L ${x+s*0.54} ${y+s*0.56} L ${x+s*0.82} ${y+s*0.18}`}/></g>;
  }
  if (kind === 'play') {
    return <g {...common}><circle cx={x+s*0.45} cy={y+s*0.45} r={s*0.38}/><path d={`M ${x+s*0.36} ${y+s*0.28} L ${x+s*0.68} ${y+s*0.45} L ${x+s*0.36} ${y+s*0.62} Z`}/></g>;
  }
  if (kind === 'code') {
    return <g {...common}><path d={`M ${x+s*0.26} ${y+s*0.2} L ${x+s*0.05} ${y+s*0.45} L ${x+s*0.26} ${y+s*0.7}`}/><path d={`M ${x+s*0.64} ${y+s*0.2} L ${x+s*0.85} ${y+s*0.45} L ${x+s*0.64} ${y+s*0.7}`}/><line x1={x+s*0.5} y1={y+s*0.12} x2={x+s*0.4} y2={y+s*0.78}/></g>;
  }
  return <g {...common}><path d={`M ${x+s*0.45} ${y} L ${x+s*0.55} ${y+s*0.32} L ${x+s*0.9} ${y+s*0.45} L ${x+s*0.55} ${y+s*0.56} L ${x+s*0.45} ${y+s*0.9} L ${x+s*0.34} ${y+s*0.56} L ${x} ${y+s*0.45} L ${x+s*0.34} ${y+s*0.32} Z`}/></g>;
};

export const LaunchSceneFrame = ({
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
  const titleSize = width * (height > width ? 0.09 : 0.06);
  const bodySize = width * (height > width ? 0.04 : 0.027);
  const enter = spring01(frame, fps);
  const scan = progress01(frame, 0, Math.max(1, durationInFrames - 1));

  if (scene.type === 'launch-hero') {
    return (
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
        <rect width={width} height={height} fill={background} />
        <MotionGrid width={width} height={height} gap={width*0.09} stroke={accent} opacity={0.07} offsetX={frame*0.25} offsetY={-frame*0.12} />
        <ParticleField width={width} height={height} frame={frame} color={accent} />
        <ScannerLine width={width} height={height} progress={scan} stroke={accent} />
        <CornerBrackets x={pad} y={height*0.16} width={width-pad*2} height={height*0.66} stroke={accent} progress={enter} />
        {scene.eyebrow ? <text x={pad} y={height*0.23} fill={accent} fontSize={bodySize*0.56} fontWeight={850} letterSpacing={4}>{scene.eyebrow.toUpperCase()}</text> : null}
        <g opacity={enter} transform={`translate(0 ${(1-enter)*height*0.05})`}>
          <text x={pad} y={height*0.45} fill={foreground} fontSize={titleSize} fontWeight={900}>{scene.title}</text>
          {scene.subtitle ? <text x={pad} y={height*0.55} fill={muted} fontSize={bodySize*0.72} fontWeight={600}>{scene.subtitle}</text> : null}
        </g>
        {scene.badge ? (
          <g opacity={enter}>
            <rect x={pad} y={height*0.69} width={width*0.35} height={height*0.055} rx={height*0.027} fill={accent} />
            <text x={pad+width*0.175} y={height*0.725} fill={background} fontSize={bodySize*0.58} fontWeight={850} textAnchor="middle">{scene.badge}</text>
          </g>
        ) : null}
      </svg>
    );
  }

  if (scene.type === 'feature-grid') {
    const cols = 2;
    const gap = width*0.025;
    const cardWidth = (width-pad*2-gap)/2;
    const cardHeight = height*0.19;
    return (
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
        <rect width={width} height={height} fill={background} />
        <MotionGrid width={width} height={height} gap={width*0.1} stroke={accent} opacity={0.045} />
        <text x={pad} y={height*0.17} fill={foreground} fontSize={titleSize*0.62} fontWeight={850}>{scene.title}</text>
        {scene.items.map((item,index)=>{
          const row=Math.floor(index/cols);
          const col=index%cols;
          const x=pad+col*(cardWidth+gap);
          const y=height*0.25+row*(cardHeight+gap);
          const p=spring01(frame,fps,index*Math.max(2,Math.round(fps*0.08)));
          return (
            <g key={item.title} opacity={p} transform={`translate(0 ${(1-p)*height*0.025})`}>
              <rect x={x} y={y} width={cardWidth} height={cardHeight} rx={width*0.025} fill={foreground} opacity={0.045} stroke={accent} strokeOpacity={0.25} />
              <HudIcon kind={item.icon} x={x+cardWidth*0.08} y={y+cardHeight*0.17} size={cardWidth*0.16} stroke={accent} />
              <text x={x+cardWidth*0.08} y={y+cardHeight*0.63} fill={foreground} fontSize={bodySize*0.7} fontWeight={800}>{item.title}</text>
              {item.body ? <text x={x+cardWidth*0.08} y={y+cardHeight*0.78} fill={muted} fontSize={bodySize*0.47} fontWeight={550}>{item.body}</text> : null}
            </g>
          );
        })}
      </svg>
    );
  }

  if (scene.type === 'cta') {
    const pulse=0.92+0.08*Math.sin((frame/fps)*Math.PI*2);
    return (
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
        <rect width={width} height={height} fill={background} />
        <ParticleField width={width} height={height} frame={frame} color={accent} />
        <circle cx={width/2} cy={height*0.45} r={width*0.28*pulse} fill={accent} opacity={0.08} />
        <circle cx={width/2} cy={height*0.45} r={width*0.2*pulse} fill={accent} opacity={0.08} />
        <g opacity={enter}>
          <text x={width/2} y={height*0.42} fill={foreground} fontSize={titleSize*0.82} fontWeight={900} textAnchor="middle">{scene.title}</text>
          {scene.subtitle ? <text x={width/2} y={height*0.53} fill={muted} fontSize={bodySize*0.7} fontWeight={600} textAnchor="middle">{scene.subtitle}</text> : null}
          {scene.action ? (
            <>
              <rect x={width*0.28} y={height*0.65} width={width*0.44} height={height*0.07} rx={height*0.035} fill={accent} />
              <text x={width/2} y={height*0.695} fill={background} fontSize={bodySize*0.62} fontWeight={850} textAnchor="middle">{scene.action}</text>
            </>
          ) : null}
        </g>
      </svg>
    );
  }

  return null;
};
