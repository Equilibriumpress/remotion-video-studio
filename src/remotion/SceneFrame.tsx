import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import type {VideoProject, VideoScene} from '../project/schema';
import {resolveAsset} from '../project/assets';

type Props = {
  scene: VideoScene;
  project: VideoProject;
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

const Lines = ({
  lines,
  x,
  y,
  fontSize,
  lineHeight,
  fill,
  weight = 700,
}: {
  lines: string[];
  x: number;
  y: number;
  fontSize: number;
  lineHeight: number;
  fill: string;
  weight?: number;
}) => (
  <text x={x} y={y} fill={fill} fontFamily="Inter, Arial, sans-serif" fontSize={fontSize} fontWeight={weight}>
    {lines.map((line, index) => (
      <tspan key={line + index} x={x} dy={index === 0 ? 0 : lineHeight}>
        {line}
      </tspan>
    ))}
  </text>
);

export const SceneFrame = ({scene, project}: Props) => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const fade = interpolate(frame, [0, Math.max(1, fps * 0.35)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const pad = Math.round(width * 0.085);
  const titleSize = Math.round(width * (height > width ? 0.095 : 0.064));
  const bodySize = Math.round(width * (height > width ? 0.045 : 0.03));
  const {background, foreground, muted, accent} = project.theme;
  const isTravel = project.template === 'travel-story';
  const isData = project.template === 'data-story';
  const displayFont = isTravel ? 'Georgia, serif' : 'Inter, Arial, sans-serif';

  const common = (
    <>
      <rect width={width} height={height} fill={background} />
      {isData ? (
        <g opacity={0.12}>
          {Array.from({length: 9}).map((_, index) => (
            <line
              key={index}
              x1={pad}
              y1={pad + index * ((height - pad * 2) / 8)}
              x2={width - pad}
              y2={pad + index * ((height - pad * 2) / 8)}
              stroke={accent}
              strokeWidth={1}
            />
          ))}
        </g>
      ) : null}
      {isTravel ? (
        <>
          <circle cx={width * 0.82} cy={height * 0.19} r={width * 0.19} fill="none" stroke={accent} strokeWidth={2} opacity={0.35} />
          <text x={pad} y={pad + 16} fill={accent} fontFamily="Inter, Arial, sans-serif" fontSize={Math.round(bodySize * 0.55)} fontWeight={800} letterSpacing={4}>
            TRAVEL STORY
          </text>
        </>
      ) : (
        <rect x={pad} y={pad} width={Math.round(width * 0.08)} height={8} rx={4} fill={accent} />
      )}
    </>
  );

  if (scene.type === 'image') {
    return (
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" opacity={fade}>
        <image href={resolveAsset(scene.src)} x={0} y={0} width={width} height={height} preserveAspectRatio="xMidYMid slice" />
        <rect x={0} y={0} width={width} height={height} fill="rgba(0,0,0,0.28)" />
        {scene.caption ? (
          <Lines lines={wrap(scene.caption, 26)} x={pad} y={height - pad * 1.4} fontSize={bodySize} lineHeight={bodySize * 1.25} fill="#FFFFFF" />
        ) : null}
      </svg>
    );
  }

  if (scene.type === 'stat') {
    return (
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" opacity={fade}>
        {common}
        <text x={pad} y={height * 0.48} fill={accent} fontFamily={displayFont} fontSize={Math.round(titleSize * (isData ? 2.35 : 2.1))} fontWeight={800}>
          {scene.value}
        </text>
        <Lines lines={wrap(scene.label, 28)} x={pad} y={height * 0.58} fontSize={bodySize} lineHeight={bodySize * 1.35} fill={foreground} />
      </svg>
    );
  }

  if (scene.type === 'list') {
    return (
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" opacity={fade}>
        {common}
        <Lines lines={wrap(scene.title, 22)} x={pad} y={height * 0.25} fontSize={titleSize} lineHeight={titleSize * 1.08} fill={foreground} />
        {scene.items.map((item, index) => {
          const y = height * 0.47 + index * bodySize * 2.1;
          return (
            <g key={item}>
              <circle cx={pad + 8} cy={y - 10} r={7} fill={accent} />
              <text x={pad + 42} y={y} fill={muted} fontFamily="Inter, Arial, sans-serif" fontSize={bodySize} fontWeight={600}>
                {item}
              </text>
            </g>
          );
        })}
      </svg>
    );
  }

  if (scene.type === 'text') {
    return (
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" opacity={fade}>
        {common}
        <Lines lines={wrap(scene.headline, 22)} x={pad} y={height * 0.3} fontSize={titleSize} lineHeight={titleSize * 1.08} fill={foreground} />
        <Lines lines={wrap(scene.body, 38)} x={pad} y={height * 0.62} fontSize={bodySize} lineHeight={bodySize * 1.45} fill={muted} weight={500} />
      </svg>
    );
  }

  const title = scene.title;
  const subtitle = scene.subtitle;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" opacity={fade}>
      {common}
      <g style={{fontFamily: displayFont}}>
        <Lines lines={wrap(title, 20)} x={pad} y={height * 0.43} fontSize={titleSize} lineHeight={titleSize * 1.06} fill={foreground} />
      </g>
      {subtitle ? (
        <Lines lines={wrap(subtitle, 34)} x={pad} y={height * 0.68} fontSize={bodySize} lineHeight={bodySize * 1.35} fill={muted} weight={500} />
      ) : null}
      {scene.type === 'outro' ? (
        <text x={pad} y={height - pad} fill={accent} fontFamily="Inter, Arial, sans-serif" fontSize={Math.round(bodySize * 0.72)} fontWeight={700}>
          REMOTION VIDEO STUDIO
        </text>
      ) : null}
    </svg>
  );
};
