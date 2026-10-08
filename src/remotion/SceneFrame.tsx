import {Video} from '@remotion/media';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {VideoProject, VideoScene} from '../project/schema';
import {resolveAsset} from '../project/assets';
import {motionValues, transitionValues} from './motion';
import {SvgSceneFrame} from './scenes/SvgScenes';
import {MapSceneFrame} from './scenes/MapScenes';
import {GeoRouteSceneFrame} from './scenes/GeoRouteScene';
import {ElevationRouteSceneFrame} from './scenes/ElevationScenes';
import {RouteChapterSceneFrame} from './scenes/RouteChapterScene';
import {RouteStopSceneFrame} from './scenes/RouteStopScene';
import {TravelReelHighlightSceneFrame} from './scenes/TravelReelHighlightScene';
import {MapLibreRouteSceneFrame} from './scenes/MapLibreRouteScene';
import {ThreeGlobeSceneFrame} from './scenes/ThreeGlobeScene';
import {LaunchSceneFrame} from './scenes/LaunchScenes';
import {DataSceneFrame} from './scenes/DataScenes';
import {FittedSvgText} from './svg/FittedSvgText';
import {CaptionOverlay} from './CaptionOverlay';
import {LottieSceneFrame} from './scenes/LottieScene';
import {EditorialMapSceneFrame, TravelHudSceneFrame} from './scenes/EditorialScenes';
import {AppStoreCreativeSceneFrame} from './scenes/AppStoreCreativeScene';
import {CaptionDemoSceneFrame} from './scenes/CaptionDemoScene';
import {AudioReactiveSceneFrame} from './scenes/AudioReactiveScene';
import {ThreeVehicleSceneFrame} from './scenes/ThreeVehicleScene';
import {MotionDiagramSceneFrame} from './scenes/MotionDiagramScene';
import {BitcoinExplainerSceneFrame} from './scenes/BitcoinExplainerScene';

type Props = {
  scene: VideoScene;
  project: VideoProject;
  transitionInFrames?: number;
};

const clamp = {
  extrapolateLeft: 'clamp' as const,
  extrapolateRight: 'clamp' as const,
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
  anchor = 'start',
  family = 'Inter, Arial, sans-serif',
}: {
  lines: string[];
  x: number;
  y: number;
  fontSize: number;
  lineHeight: number;
  fill: string;
  weight?: number;
  anchor?: 'start' | 'middle' | 'end';
  family?: string;
}) => (
  <text
    x={x}
    y={y}
    fill={fill}
    fontFamily={family}
    fontSize={fontSize}
    fontWeight={weight}
    textAnchor={anchor}
  >
    {lines.map((line, index) => (
      <tspan key={line + index} x={x} dy={index === 0 ? 0 : lineHeight}>
        {line}
      </tspan>
    ))}
  </text>
);

const ImageLayer = ({
  src,
  width,
  height,
  transform,
  opacity,
}: {
  src: string;
  width: number;
  height: number;
  transform: string;
  opacity: number;
}) => (
  <g opacity={opacity} transform={transform}>
    <image
      crossOrigin="anonymous"
      href={resolveAsset(src)}
      x={-width * 0.06}
      y={-height * 0.06}
      width={width * 1.12}
      height={height * 1.12}
      preserveAspectRatio="xMidYMid slice"
    />
  </g>
);

export const SceneFrame = ({scene, project, transitionInFrames = 0}: Props) => {
  const frame = useCurrentFrame();
  const {width, height, fps, durationInFrames} = useVideoConfig();
  const pad = Math.round(width * 0.075);
  const titleSize = Math.round(width * (height > width ? 0.088 : 0.058));
  const bodySize = Math.round(width * (height > width ? 0.043 : 0.029));
  const smallSize = Math.round(bodySize * 0.63);
  const {background, foreground, muted, accent} = project.theme;
  const isTravel = project.template === 'travel-story';
  const isData = project.template === 'data-story';
  const displayFont = isTravel ? 'Georgia, serif' : 'Inter, Arial, sans-serif';
  const motion = motionValues({
    preset: scene.motion,
    amount: scene.motionAmount,
    frame,
    durationInFrames,
    fps,
    width,
    height,
    direction: project.direction,
  });
  const transition = transitionValues({
    preset: scene.transition,
    frame,
    durationInFrames: transitionInFrames,
    width,
    height,
  });
  const clipId = `wipe-${scene.id.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const irisId = `iris-${scene.id.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const lineProgress = interpolate(frame, [fps * 0.15, fps * 0.8], [0, 1], clamp);
  const springIn = spring({
    frame,
    fps,
    config: {damping: 18, stiffness: 115, mass: 0.8},
    durationInFrames: Math.max(12, Math.round(fps * 0.75)),
  });

  if (scene.type === 'bitcoin-explainer') {
    return <BitcoinExplainerSceneFrame scene={scene} project={project} />;
  }

  if (scene.type === 'motion-diagram') {
    return <MotionDiagramSceneFrame scene={scene} project={project} />;
  }

  if (scene.type === 'bar-line-chart') {
    return <DataSceneFrame scene={scene} project={project} />;
  }

  if (
    scene.type === 'launch-hero' ||
    scene.type === 'feature-grid' ||
    scene.type === 'cta'
  ) {
    return <LaunchSceneFrame scene={scene} project={project} />;
  }

  if (scene.type === 'appstore-creative') {
    return <AppStoreCreativeSceneFrame scene={scene} project={project} />;
  }

  if (scene.type === 'geo-route') {
    return <GeoRouteSceneFrame scene={scene} project={project} />;
  }

  if (scene.type === 'maplibre-route') {
    return <MapLibreRouteSceneFrame scene={scene} project={project} />;
  }

  if (scene.type === 'editorial-map') {
    return <EditorialMapSceneFrame scene={scene} project={project} />;
  }

  if (scene.type === 'travel-hud') {
    return <TravelHudSceneFrame scene={scene} project={project} />;
  }

  if (scene.type === 'three-globe') {
    return <ThreeGlobeSceneFrame scene={scene} project={project} />;
  }

  if (scene.type === 'three-vehicle') {
    return <ThreeVehicleSceneFrame scene={scene} project={project} />;
  }

  if (scene.type === 'audio-reactive') {
    return <AudioReactiveSceneFrame scene={scene} project={project} />;
  }

  if (scene.type === 'caption-demo') {
    return <CaptionDemoSceneFrame scene={scene} project={project} />;
  }

  if (scene.type === 'elevation-route') {
    return <ElevationRouteSceneFrame scene={scene} project={project} />;
  }

  if (scene.type === 'route-chapter') {
    return <RouteChapterSceneFrame scene={scene} project={project} />;
  }

  if (scene.type === 'travel-reel-highlight') {
    return <TravelReelHighlightSceneFrame scene={scene} project={project} />;
  }

  if (scene.type === 'route-stop') {
    return <RouteStopSceneFrame scene={scene} project={project} />;
  }

  if (scene.type === 'lottie') {
    return <LottieSceneFrame scene={scene} project={project} />;
  }

  if (
    scene.type === 'route-map' ||
    scene.type === 'location-card' ||
    scene.type === 'progress-route' ||
    scene.type === 'map-overlay'
  ) {
    return <MapSceneFrame scene={scene} project={project} />;
  }

  if (
    scene.type === 'photo-mask' ||
    scene.type === 'kinetic-title' ||
    scene.type === 'chapter-number' ||
    scene.type === 'lower-third' ||
    scene.type === 'callout' ||
    scene.type === 'line-chart' ||
    scene.type === 'donut-chart'
  ) {
    return <SvgSceneFrame scene={scene} project={project} />;
  }

  const common = (
    <>
      <rect width={width} height={height} fill={background} />
      {isData ? (
        <g opacity={0.11}>
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
          <circle
            cx={width * 0.83}
            cy={height * 0.18}
            r={width * 0.17}
            fill="none"
            stroke={accent}
            strokeWidth={2}
            opacity={0.28}
          />
          <text
            x={pad}
            y={pad + 12}
            fill={accent}
            fontFamily="Inter, Arial, sans-serif"
            fontSize={smallSize}
            fontWeight={800}
            letterSpacing={4}
          >
            TRAVEL STORY
          </text>
        </>
      ) : (
        <rect x={pad} y={pad} width={Math.round(width * 0.09 * lineProgress)} height={8} rx={4} fill={accent} />
      )}
    </>
  );

  const wrapScene = (content: React.ReactNode) => (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
      <defs>
        <clipPath id={clipId}>
          <rect width={width * transition.wipe} height={height} />
        </clipPath>
        <clipPath id={irisId}>
          <circle
            cx={width / 2}
            cy={height / 2}
            r={Math.hypot(width, height) * 0.52 * transition.iris}
          />
        </clipPath>
      </defs>
      <g
        opacity={transition.opacity}
        transform={transition.transform}
        clipPath={
          scene.transition === 'wipe'
            ? `url(#${clipId})`
            : scene.transition === 'iris'
              ? `url(#${irisId})`
              : undefined
        }
      >
        {content}
      </g>
    </svg>
  );

  if (scene.type === 'image') {
    return wrapScene(
      <>
        <rect width={width} height={height} fill={background} />
        <ImageLayer src={scene.src} width={width} height={height} transform={motion.transform} opacity={motion.opacity} />
        <rect width={width} height={height} fill="rgba(0,0,0,0.25)" />
        <rect x={pad} y={height - pad * 2.05} width={width * 0.12 * lineProgress} height={6} rx={3} fill={accent} />
        {scene.caption ? (
          <Lines
            lines={wrap(scene.caption, 28)}
            x={pad}
            y={height - pad * 1.35}
            fontSize={bodySize}
            lineHeight={bodySize * 1.22}
            fill="#FFFFFF"
          />
        ) : null}
      </>,
    );
  }

  if (scene.type === 'hero-image') {
    return wrapScene(
      <>
        <ImageLayer src={scene.src} width={width} height={height} transform={motion.transform} opacity={1} />
        <defs>
          <linearGradient id={`hero-${clipId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="18%" stopColor="#000000" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.82" />
          </linearGradient>
        </defs>
        <rect width={width} height={height} fill={`url(#hero-${clipId})`} />
        <g opacity={springIn}>
          {scene.kicker ? (
            <text x={pad} y={height * 0.59} fill={accent} fontSize={smallSize} fontWeight={850} letterSpacing={4}>
              {scene.kicker.toUpperCase()}
            </text>
          ) : null}
          <FittedSvgText
            value={scene.title}
            x={pad}
            y={height * 0.68}
            maxWidth={width - pad * 2}
            maxLines={2}
            maxFontSize={titleSize * 1.05}
            fill="#FFFFFF"
            family={displayFont}
            weight={800}
          />
          {scene.subtitle ? (
            <Lines
              lines={wrap(scene.subtitle, 34)}
              x={pad}
              y={height * 0.87}
              fontSize={bodySize * 0.9}
              lineHeight={bodySize * 1.28}
              fill="#E8E8E8"
              weight={500}
            />
          ) : null}
        </g>
      </>,
    );
  }

  if (scene.type === 'split-image') {
    const gap = Math.round(width * 0.018);
    const panelWidth = (width - gap) / 2;
    return wrapScene(
      <>
        <rect width={width} height={height} fill={background} />
        <g opacity={motion.opacity}>
          <image crossOrigin="anonymous" href={resolveAsset(scene.leftSrc)} x={0} y={0} width={panelWidth} height={height} preserveAspectRatio="xMidYMid slice" />
          <image crossOrigin="anonymous" href={resolveAsset(scene.rightSrc)} x={panelWidth + gap} y={0} width={panelWidth} height={height} preserveAspectRatio="xMidYMid slice" />
        </g>
        <rect width={width} height={height} fill="rgba(0,0,0,0.2)" />
        {scene.title ? (
          <Lines lines={wrap(scene.title, 20)} x={pad} y={height * 0.78} fontSize={titleSize * 0.82} lineHeight={titleSize} fill="#FFFFFF" family={displayFont} />
        ) : null}
        {scene.caption ? (
          <text x={pad} y={height - pad} fill="#E8E8E8" fontSize={bodySize * 0.72} fontWeight={600}>
            {scene.caption}
          </text>
        ) : null}
      </>,
    );
  }

  if (scene.type === 'quote') {
    return wrapScene(
      <>
        {common}
        <text x={pad} y={height * 0.22} fill={accent} fontFamily={displayFont} fontSize={titleSize * 1.6}>“</text>
        <g opacity={motion.opacity} transform={motion.transform}>
          <Lines
            lines={wrap(scene.quote, 24)}
            x={pad}
            y={height * 0.38}
            fontSize={titleSize * 0.78}
            lineHeight={titleSize * 0.95}
            fill={foreground}
            family={displayFont}
            weight={650}
          />
          {scene.attribution ? (
            <text x={pad} y={height * 0.79} fill={muted} fontSize={bodySize * 0.74} fontWeight={650}>
              {scene.attribution}
            </text>
          ) : null}
        </g>
      </>,
    );
  }

  if (scene.type === 'timeline') {
    const startY = height * 0.42;
    const step = Math.min(height * 0.115, bodySize * 3.2);
    return wrapScene(
      <>
        {common}
        <Lines lines={wrap(scene.title, 22)} x={pad} y={height * 0.25} fontSize={titleSize * 0.72} lineHeight={titleSize * 0.88} fill={foreground} />
        <line x1={pad + 18} y1={startY - 18} x2={pad + 18} y2={startY + step * (scene.items.length - 1)} stroke={accent} strokeWidth={4} opacity={0.35} />
        {scene.items.map((item, index) => {
          const reveal = interpolate(frame, [fps * 0.18 + index * fps * 0.12, fps * 0.6 + index * fps * 0.12], [0, 1], clamp);
          const y = startY + step * index;
          return (
            <g key={item.label} opacity={reveal} transform={`translate(${(1 - reveal) * 24} 0)`}>
              <circle cx={pad + 18} cy={y - 8} r={10} fill={accent} />
              <text x={pad + 58} y={y} fill={foreground} fontSize={bodySize * 0.84} fontWeight={750}>{item.label}</text>
              <text x={width - pad} y={y} fill={muted} fontSize={bodySize * 0.72} fontWeight={650} textAnchor="end">{item.value}</text>
            </g>
          );
        })}
      </>,
    );
  }

  if (scene.type === 'comparison') {
    return wrapScene(
      <>
        {common}
        <Lines lines={wrap(scene.title, 24)} x={width / 2} y={height * 0.22} fontSize={titleSize * 0.62} lineHeight={titleSize * 0.8} fill={foreground} anchor="middle" />
        <line x1={width / 2} y1={height * 0.34} x2={width / 2} y2={height * 0.78} stroke={muted} strokeWidth={2} opacity={0.25} />
        {[scene.left, scene.right].map((item, index) => {
          const x = index === 0 ? width * 0.27 : width * 0.73;
          const reveal = interpolate(frame, [index * fps * 0.12, fps * 0.65 + index * fps * 0.12], [0, 1], clamp);
          return (
            <g key={item.label} opacity={reveal}>
              <text x={x} y={height * 0.49} fill={accent} fontSize={titleSize * 1.05} fontWeight={850} textAnchor="middle">{item.value}</text>
              <text x={x} y={height * 0.59} fill={muted} fontSize={bodySize * 0.72} fontWeight={650} textAnchor="middle">{item.label}</text>
            </g>
          );
        })}
      </>,
    );
  }

  if (scene.type === 'chart') {
    const max = Math.max(...scene.items.map((item) => item.value), 1);
    const chartTop = height * 0.39;
    const chartBottom = height * 0.8;
    const chartHeight = chartBottom - chartTop;
    const gap = width * 0.025;
    const barWidth = (width - pad * 2 - gap * (scene.items.length - 1)) / scene.items.length;
    return wrapScene(
      <>
        {common}
        <Lines lines={wrap(scene.title, 24)} x={pad} y={height * 0.23} fontSize={titleSize * 0.68} lineHeight={titleSize * 0.86} fill={foreground} />
        {scene.items.map((item, index) => {
          const p = interpolate(frame, [fps * 0.15 + index * 2, fps * 0.95 + index * 2], [0, 1], clamp);
          const finalHeight = (item.value / max) * chartHeight;
          const h = finalHeight * p;
          const x = pad + index * (barWidth + gap);
          const y = chartBottom - h;
          return (
            <g key={item.label}>
              <rect x={x} y={y} width={barWidth} height={h} rx={Math.min(18, barWidth * 0.12)} fill={accent} opacity={0.82 + index * 0.02} />
              <text x={x + barWidth / 2} y={y - 16} fill={foreground} fontSize={smallSize} fontWeight={800} textAnchor="middle">
                {Math.round(item.value * p)}{scene.suffix ?? ''}
              </text>
              <text x={x + barWidth / 2} y={chartBottom + 34} fill={muted} fontSize={smallSize * 0.86} fontWeight={650} textAnchor="middle">
                {item.label}
              </text>
            </g>
          );
        })}
      </>,
    );
  }

  if (scene.type === 'video' || scene.type === 'caption-video') {
    const trimBefore = Math.round((scene.trimBefore ?? 0) * fps);
    const videoScale = scene.motion === 'zoom-out'
      ? interpolate(frame, [0, Math.max(1, durationInFrames - 1)], [1.08, 1], clamp)
      : scene.motion === 'slow-push'
        ? interpolate(frame, [0, Math.max(1, durationInFrames - 1)], [1.01, 1.08], clamp)
        : 1;
    return (
      <AbsoluteFill
        style={{
          overflow: 'hidden',
          backgroundColor: background,
          opacity: transition.opacity,
          transform: scene.transition === 'zoom' ? `scale(${0.88 + Math.min(1, frame / Math.max(1, transitionInFrames)) * 0.12})` : undefined,
        }}
      >
        <Video
          src={resolveAsset(scene.src)}
          muted={scene.muted}
          loop={scene.loop}
          trimBefore={trimBefore}
          premountFor={fps}
          style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${videoScale})`}}
        />
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" style={{position: 'absolute', inset: 0}}>
          <rect width={width} height={height} fill="rgba(0,0,0,0.15)" />
          {scene.type === 'video' && scene.title ? (
            <Lines lines={wrap(scene.title, 20)} x={pad} y={height * 0.72} fontSize={titleSize * 0.78} lineHeight={titleSize * 0.95} fill="#FFFFFF" family={displayFont} />
          ) : null}
          {scene.type === 'video' && scene.caption ? (
            <text x={pad} y={height - pad} fill="#F4F4F4" fontSize={bodySize * 0.72} fontWeight={650}>{scene.caption}</text>
          ) : null}
        </svg>
        {scene.type === 'caption-video' ? (
          <CaptionOverlay scene={scene} project={project} />
        ) : null}
      </AbsoluteFill>
    );
  }

  if (scene.type === 'stat') {
    return wrapScene(
      <>
        {common}
        <g opacity={motion.opacity} transform={motion.transform}>
          <text x={pad} y={height * 0.48} fill={accent} fontFamily={displayFont} fontSize={Math.round(titleSize * (isData ? 2.35 : 2.05))} fontWeight={800}>
            {scene.value}
          </text>
          <Lines lines={wrap(scene.label, 28)} x={pad} y={height * 0.59} fontSize={bodySize} lineHeight={bodySize * 1.35} fill={foreground} />
        </g>
      </>,
    );
  }

  if (scene.type === 'list') {
    return wrapScene(
      <>
        {common}
        <Lines lines={wrap(scene.title, 22)} x={pad} y={height * 0.25} fontSize={titleSize * 0.78} lineHeight={titleSize * 0.94} fill={foreground} />
        {scene.items.map((item, index) => {
          const reveal = interpolate(frame, [fps * 0.14 + index * fps * 0.1, fps * 0.52 + index * fps * 0.1], [0, 1], clamp);
          const y = height * 0.47 + index * bodySize * 2.05;
          return (
            <g key={item} opacity={reveal} transform={`translate(${(1 - reveal) * 28} 0)`}>
              <circle cx={pad + 8} cy={y - 10} r={7} fill={accent} />
              <text x={pad + 42} y={y} fill={muted} fontFamily="Inter, Arial, sans-serif" fontSize={bodySize} fontWeight={600}>
                {item}
              </text>
            </g>
          );
        })}
      </>,
    );
  }

  if (scene.type === 'text') {
    return wrapScene(
      <>
        {common}
        <g opacity={motion.opacity} transform={motion.transform}>
          <Lines lines={wrap(scene.headline, 22)} x={pad} y={height * 0.3} fontSize={titleSize * 0.82} lineHeight={titleSize * 0.98} fill={foreground} />
          <Lines lines={wrap(scene.body, 38)} x={pad} y={height * 0.62} fontSize={bodySize} lineHeight={bodySize * 1.45} fill={muted} weight={500} />
        </g>
      </>,
    );
  }

  const title = scene.title;
  const subtitle = scene.subtitle;

  return wrapScene(
    <>
      {common}
      <g opacity={motion.opacity} transform={motion.transform}>
        <FittedSvgText
          value={title}
          x={pad}
          y={height * 0.43}
          maxWidth={width - pad * 2}
          maxLines={3}
          maxFontSize={titleSize}
          fill={foreground}
          family={displayFont}
          weight={800}
        />
        {subtitle ? (
          <Lines lines={wrap(subtitle, 34)} x={pad} y={height * 0.68} fontSize={bodySize} lineHeight={bodySize * 1.35} fill={muted} weight={500} />
        ) : null}
      </g>

    </>,
  );
};
