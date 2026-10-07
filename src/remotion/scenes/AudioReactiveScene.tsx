import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import type {AudioReactiveScene, VideoProject} from '../../project/schema';

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

export const AudioReactiveSceneFrame = ({
  scene,
  project,
}: {
  scene: AudioReactiveScene;
  project: VideoProject;
}) => {
  const frame = useCurrentFrame();
  const {width, height, durationInFrames} = useVideoConfig();
  const {background, foreground, muted, accent} = project.theme;
  const progress = frame / Math.max(1, durationInFrames - 1);
  const samplePosition = progress * Math.max(0, scene.energy.length - 1);
  const index = Math.floor(samplePosition);
  const nextIndex = Math.min(scene.energy.length - 1, index + 1);
  const mix = samplePosition - index;
  const raw = scene.energy[index] * (1 - mix) + scene.energy[nextIndex] * mix;
  const energy = clamp01(raw * scene.sensitivity);
  const eased = Easing.out(Easing.cubic)(energy);
  const bars = 26;
  const pad = width * 0.065;

  return (
    <AbsoluteFill style={{backgroundColor: background, overflow: 'hidden'}}>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
        <defs>
          <radialGradient id={`audio-glow-${scene.id}`}>
            <stop offset="0%" stopColor={accent} stopOpacity={0.32 + eased * 0.24} />
            <stop offset="100%" stopColor={accent} stopOpacity={0} />
          </radialGradient>
        </defs>
        <rect width={width} height={height} fill={background} />
        <circle
          cx={width * 0.5}
          cy={height * 0.5}
          r={width * (0.24 + eased * 0.12)}
          fill={`url(#audio-glow-${scene.id})`}
        />

        {scene.mode === 'bars' ? (
          <g>
            {Array.from({length: bars}).map((_, barIndex) => {
              const offset = barIndex - Math.floor(bars / 2);
              const sampleIndex = Math.max(
                0,
                Math.min(
                  scene.energy.length - 1,
                  Math.round(samplePosition + offset * 0.75),
                ),
              );
              const local = clamp01(scene.energy[sampleIndex] * scene.sensitivity);
              const barWidth = (width - pad * 2) / bars * 0.58;
              const step = (width - pad * 2) / bars;
              const x = pad + barIndex * step + step / 2 - barWidth / 2;
              const h = height * (0.045 + local * 0.23);
              return (
                <rect
                  key={barIndex}
                  x={x}
                  y={height * 0.55 - h / 2}
                  width={barWidth}
                  height={h}
                  rx={barWidth / 2}
                  fill={barIndex % 4 === 0 ? accent : foreground}
                  opacity={0.42 + local * 0.58}
                />
              );
            })}
          </g>
        ) : null}

        {scene.mode === 'pulse' ? (
          <>
            {[0, 1, 2].map((ring) => {
              const phase = (progress * 3 + ring / 3) % 1;
              return (
                <circle
                  key={ring}
                  cx={width / 2}
                  cy={height * 0.52}
                  r={width * (0.09 + phase * (0.18 + eased * 0.07))}
                  fill="none"
                  stroke={accent}
                  strokeWidth={Math.max(2, width * 0.006 * (1 - phase))}
                  opacity={(1 - phase) * (0.28 + eased * 0.65)}
                />
              );
            })}
            <circle
              cx={width / 2}
              cy={height * 0.52}
              r={width * (0.065 + eased * 0.04)}
              fill={accent}
              opacity={0.8}
            />
          </>
        ) : null}

        {scene.mode === 'orbit' ? (
          <g transform={`translate(${width / 2} ${height * 0.52})`}>
            <circle r={width * 0.16} fill="none" stroke={foreground} strokeOpacity={0.12} />
            {Array.from({length: 12}).map((_, particle) => {
              const angle = progress * Math.PI * 4 + particle / 12 * Math.PI * 2;
              const radius = width * (0.105 + (particle % 3) * 0.03 + eased * 0.025);
              return (
                <circle
                  key={particle}
                  cx={Math.cos(angle) * radius}
                  cy={Math.sin(angle) * radius * 0.65}
                  r={width * (0.006 + eased * 0.005)}
                  fill={particle % 3 === 0 ? accent : foreground}
                  opacity={0.4 + eased * 0.6}
                />
              );
            })}
          </g>
        ) : null}

        <text
          x={pad}
          y={height * 0.13}
          fill={accent}
          fontFamily="Inter, Arial, sans-serif"
          fontSize={width * 0.018}
          fontWeight={850}
          letterSpacing={4}
        >
          AUDIO REACTIVE · {scene.mode.toUpperCase()}
        </text>
        <text
          x={pad}
          y={height * 0.2}
          fill={foreground}
          fontFamily="Georgia, serif"
          fontSize={width * 0.056}
          fontWeight={760}
        >
          {scene.title}
        </text>
        {scene.subtitle ? (
          <text
            x={pad}
            y={height * 0.245}
            fill={muted}
            fontFamily="Inter, Arial, sans-serif"
            fontSize={width * 0.021}
            fontWeight={600}
          >
            {scene.subtitle}
          </text>
        ) : null}

        <g transform={`translate(${pad} ${height * 0.83})`}>
          <rect width={width - pad * 2} height={8} rx={4} fill={foreground} opacity={0.12} />
          <rect
            width={(width - pad * 2) * progress}
            height={8}
            rx={4}
            fill={accent}
          />
          <text y={height * 0.055} fill={muted} fontSize={width * 0.014}>
            Precomputed energy envelope · deterministic in preview and export
          </text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
