import {Lottie, type LottieAnimationData} from '@remotion/lottie';
import {Spark} from '@remotion/shapes';
import {useEffect, useRef, useState} from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useDelayRender,
  useVideoConfig,
} from 'remotion';
import {resolveAsset} from '../../project/assets';
import type {LottieScene, VideoProject} from '../../project/schema';

const clamp = {
  extrapolateLeft: 'clamp' as const,
  extrapolateRight: 'clamp' as const,
};

export const LottieSceneFrame = ({
  scene,
  project,
}: {
  scene: LottieScene;
  project: VideoProject;
}) => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const {delayRender, continueRender} = useDelayRender();
  const [handle] = useState(() => delayRender(`Loading Lottie asset: ${scene.src}`));
  const resolvedRef = useRef(false);
  const [animationData, setAnimationData] = useState<LottieAnimationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const finish = () => {
      if (!resolvedRef.current) {
        resolvedRef.current = true;
        continueRender(handle);
      }
    };

    fetch(resolveAsset(scene.src))
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Lottie asset returned HTTP ${response.status}`);
        }
        return response.json();
      })
      .then((json) => {
        if (!cancelled) setAnimationData(json as LottieAnimationData);
        finish();
      })
      .catch((reason) => {
        if (!cancelled) {
          setError(reason instanceof Error ? reason.message : 'Lottie asset failed to load');
        }
        finish();
      });

    return () => {
      cancelled = true;
      finish();
    };
  }, [continueRender, handle, scene.src]);

  const {background, foreground, muted, accent} = project.theme;
  const enter = interpolate(frame, [0, fps * 0.5], [0, 1], clamp);
  const float = interpolate(
    frame % Math.max(1, Math.round(fps * 2.4)),
    [0, fps * 1.2, fps * 2.4],
    [0, -height * 0.012, 0],
    clamp,
  );
  const visualSize = Math.min(width, height) * scene.size;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: background,
        color: foreground,
        fontFamily: 'Inter, Arial, sans-serif',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: visualSize * 0.22,
          height: visualSize * 0.3,
          right: width * 0.08,
          top: height * 0.12,
          opacity: 0.18 * enter,
          transform: `rotate(12deg) translateY(${float}px)`,
        }}
      >
        <Spark
          width={visualSize * 0.22}
          height={visualSize * 0.3}
          edgeRoundness={0.7}
          cornerRadius={8}
          fill={accent}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '46%',
          width: visualSize,
          height: visualSize,
          transform: `translate(-50%, -50%) translateY(${float}px) scale(${0.92 + enter * 0.08})`,
          opacity: enter,
        }}
      >
        {animationData ? (
          <Lottie
            animationData={animationData}
            loop={scene.loop}
            playbackRate={scene.playbackRate}
            renderer="svg"
            style={{width: '100%', height: '100%'}}
          />
        ) : error ? (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'grid',
              placeItems: 'center',
              border: `2px solid ${muted}`,
              borderRadius: visualSize * 0.08,
              color: muted,
              padding: visualSize * 0.08,
              textAlign: 'center',
              fontSize: visualSize * 0.06,
            }}
          >
            {error}
          </div>
        ) : null}
      </div>

      <div
        style={{
          position: 'absolute',
          left: width * 0.075,
          right: width * 0.075,
          bottom: height * 0.1,
          opacity: enter,
        }}
      >
        {scene.title ? (
          <div style={{fontSize: width * (height > width ? 0.06 : 0.04), fontWeight: 850}}>
            {scene.title}
          </div>
        ) : null}
        {scene.subtitle ? (
          <div
            style={{
              marginTop: height * 0.012,
              color: muted,
              fontSize: width * (height > width ? 0.026 : 0.018),
              fontWeight: 620,
            }}
          >
            {scene.subtitle}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
