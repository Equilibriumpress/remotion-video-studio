import {fitTextOnNLines} from '@remotion/layout-utils';

export const FittedSvgText = ({
  value,
  x,
  y,
  maxWidth,
  maxLines,
  maxFontSize,
  fill,
  weight = 700,
  anchor = 'start',
  family = 'Inter, Arial, sans-serif',
  lineHeight = 1.08,
}: {
  value: string;
  x: number;
  y: number;
  maxWidth: number;
  maxLines: number;
  maxFontSize: number;
  fill: string;
  weight?: number;
  anchor?: 'start' | 'middle' | 'end';
  family?: string;
  lineHeight?: number;
}) => {
  const fitted = fitTextOnNLines({
    text: value,
    maxLines,
    maxBoxWidth: maxWidth,
    fontFamily: family,
    fontWeight: weight,
    validateFontIsLoaded: false,
    maxFontSize,
  });

  const fontSize = Math.min(maxFontSize, fitted.fontSize);
  return (
    <text
      x={x}
      y={y}
      fill={fill}
      fontFamily={family}
      fontSize={fontSize}
      fontWeight={weight}
      textAnchor={anchor}
    >
      {fitted.lines.map((line, index) => (
        <tspan
          key={`${line}-${index}`}
          x={x}
          dy={index === 0 ? 0 : fontSize * lineHeight}
        >
          {line}
        </tspan>
      ))}
    </text>
  );
};
