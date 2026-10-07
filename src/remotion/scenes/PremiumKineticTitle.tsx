import {Easing, interpolate} from 'remotion';
import type {VideoScene} from '../../project/schema';

type KineticScene = Extract<VideoScene, {type: 'kinetic-title'}>;

export const PremiumKineticTitle = ({
  scene,
  width,
  height,
  frame,
  fps,
  foreground,
  accent,
}: {
  scene: KineticScene;
  width: number;
  height: number;
  frame: number;
  fps: number;
  foreground: string;
  accent: string;
}) => {
  const words = scene.text.split(/\s+/);
  const centerX = width / 2;
  const baseY = height * 0.39;
  const fontSize = width * 0.075;
  const lineHeight = fontSize * 1.16;

  return (
    <>
      {words.map((word, index) => {
        const local = interpolate(
          frame,
          [index * fps * 0.09, index * fps * 0.09 + fps * 0.55],
          [0, 1],
          {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.out(Easing.cubic),
          },
        );
        const highlighted = scene.highlight?.toLowerCase() === word.toLowerCase();
        const y = baseY + index * lineHeight;

        if (scene.style === 'split') {
          const direction = index % 2 === 0 ? -1 : 1;
          return (
            <text
              key={`${word}-${index}`}
              x={centerX}
              y={y}
              fill={highlighted ? accent : foreground}
              fontFamily="Inter, Arial, sans-serif"
              fontSize={fontSize}
              fontWeight={880}
              textAnchor="middle"
              opacity={local}
              transform={`translate(${direction * (1 - local) * width * 0.32} 0)`}
            >
              {word}
            </text>
          );
        }

        const scale = 1.7 - local * 0.7;
        return (
          <text
            key={`${word}-${index}`}
            x={centerX}
            y={y}
            fill={highlighted ? accent : foreground}
            fontFamily="Inter, Arial, sans-serif"
            fontSize={fontSize}
            fontWeight={880}
            textAnchor="middle"
            opacity={local}
            transform={`translate(${centerX} ${y}) scale(${scale}) translate(${-centerX} ${-y})`}
          >
            {word}
          </text>
        );
      })}
    </>
  );
};
