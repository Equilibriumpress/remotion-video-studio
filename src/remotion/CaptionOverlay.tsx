import {useMemo} from 'react';
import {Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import type {VideoProject, VideoScene} from '../project/schema';
import {captionPagesFromSegments} from './captionPages';

type CaptionScene =
  | Extract<VideoScene, {type: 'caption-video'}>
  | Extract<VideoScene, {type: 'caption-demo'}>;

const normalizeWord = (value: string) =>
  value.toLocaleLowerCase().replace(/[^\p{L}\p{N}]/gu, '');

export const CaptionOverlay = ({
  scene,
  project,
}: {
  scene: CaptionScene;
  project: VideoProject;
}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const nowMs = frame / fps * 1000;

  const pages = useMemo(
    () => captionPagesFromSegments({
      segments: scene.captions,
      combineTokensWithinMilliseconds: scene.combineTokensWithinMilliseconds,
      breakOnSilenceAfterMilliseconds: scene.breakOnSilenceAfterMilliseconds,
    }),
    [
      scene.breakOnSilenceAfterMilliseconds,
      scene.captions,
      scene.combineTokensWithinMilliseconds,
    ],
  );

  const page = pages.find(
    (item) => nowMs >= item.startMs && nowMs < item.startMs + item.durationMs,
  );

  if (!page) return null;

  const {accent} = project.theme;
  const vertical = height > width;
  const fontSize = width * (vertical ? 0.055 : 0.034);
  const basic = scene.captionStyle === 'basic';
  const cinematic = scene.captionStyle === 'cinematic';
  const editorial = scene.captionStyle === 'editorial-highlight';
  const pill = scene.captionStyle === 'pill';
  const emphasis = new Set(scene.emphasisWords.map(normalizeWord));
  const centered = scene.captionPosition === 'center';

  const containerBackground = cinematic || editorial
    ? 'transparent'
    : basic
      ? 'rgba(0,0,0,0.62)'
      : 'rgba(0,0,0,0.72)';

  return (
    <div
      style={{
        position: 'absolute',
        left: '6%',
        right: '6%',
        ...(centered
          ? {top: '50%', transform: 'translateY(-50%)'}
          : {bottom: vertical ? '12%' : '9%'}),
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
        fontFamily: cinematic ? 'Georgia, serif' : 'Inter, Arial, sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'baseline',
          gap: basic ? 0 : Math.max(6, width * 0.008),
          maxWidth: vertical ? '94%' : '80%',
          padding: cinematic || editorial
            ? 0
            : basic
              ? `${height * 0.018}px ${width * 0.03}px`
              : `${height * 0.022}px ${width * 0.035}px`,
          borderRadius: Math.max(18, width * 0.028),
          background: containerBackground,
          boxShadow: cinematic || editorial ? undefined : '0 14px 40px rgba(0,0,0,0.22)',
          color: '#FFFFFF',
          textAlign: 'center',
          lineHeight: cinematic ? 1.16 : 1.08,
          fontSize: cinematic ? fontSize * 1.02 : fontSize,
          fontWeight: basic ? 760 : cinematic ? 760 : 900,
          letterSpacing: cinematic ? -fontSize * 0.012 : basic ? 0 : -fontSize * 0.025,
          textShadow: cinematic || editorial
            ? '0 3px 24px rgba(0,0,0,0.72)'
            : undefined,
        }}
      >
        {basic ? (
          <span>{page.text}</span>
        ) : (
          page.tokens.map((token, index) => {
            const active = nowMs >= token.fromMs && nowMs < token.toMs;
            const duration = Math.max(1, token.toMs - token.fromMs);
            const tokenProgress = Math.max(0, Math.min(1, (nowMs - token.fromMs) / duration));
            const word = normalizeWord(token.text);
            const emphasized = emphasis.has(word);
            const activeScale = interpolate(
              Math.max(0, Math.min(1, tokenProgress)),
              [0, 0.3, 1],
              [1, 1.12, 1.04],
              {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
                easing: Easing.out(Easing.cubic),
              },
            );

            if (scene.captionStyle === 'karaoke') {
              const fill = active ? tokenProgress * 100 : nowMs >= token.toMs ? 100 : 0;
              return (
                <span
                  key={`${token.fromMs}-${index}-${token.text}`}
                  style={{
                    display: 'inline-block',
                    color: 'transparent',
                    backgroundImage: `linear-gradient(90deg, ${accent} 0%, ${accent} ${fill}%, rgba(255,255,255,0.92) ${fill}%, rgba(255,255,255,0.92) 100%)`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    transform: active ? `scale(${activeScale})` : undefined,
                    transformOrigin: '50% 80%',
                  }}
                >
                  {token.text.trim()}
                </span>
              );
            }

            const highlight =
              active &&
              (
                scene.captionStyle === 'word-highlight' ||
                scene.captionStyle === 'tiktok' ||
                editorial ||
                pill ||
                cinematic
              );

            return (
              <span
                key={`${token.fromMs}-${index}-${token.text}`}
                style={{
                  display: 'inline-block',
                  color: highlight || emphasized ? accent : '#FFFFFF',
                  transform: highlight ? `scale(${activeScale}) translateY(-2%)` : 'scale(1)',
                  transformOrigin: '50% 80%',
                  padding: pill ? `${height * 0.004}px ${width * 0.012}px` : undefined,
                  borderRadius: pill ? 999 : undefined,
                  background: pill && highlight ? accent : pill ? 'rgba(255,255,255,0.12)' : undefined,
                  ...(pill && highlight ? {color: '#061014'} : {}),
                  textDecoration: editorial && emphasized ? 'underline' : undefined,
                  textDecorationThickness: editorial && emphasized ? Math.max(3, width * 0.004) : undefined,
                  textUnderlineOffset: editorial && emphasized ? Math.max(5, width * 0.006) : undefined,
                  textShadow: cinematic && highlight
                    ? `0 0 30px ${accent}`
                    : highlight
                      ? '0 0 24px rgba(0,0,0,0.35)'
                      : undefined,
                }}
              >
                {token.text.trim()}
              </span>
            );
          })
        )}
      </div>
    </div>
  );
};
