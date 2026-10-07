import {useMemo} from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import type {VideoProject, VideoScene} from '../project/schema';
import {captionPagesFromSegments} from './captionPages';

type CaptionVideoScene = Extract<VideoScene, {type: 'caption-video'}>;

export const CaptionOverlay = ({
  scene,
  project,
}: {
  scene: CaptionVideoScene;
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
  const highlight = scene.captionStyle === 'word-highlight';

  return (
    <div
      style={{
        position: 'absolute',
        left: basic ? '9%' : '7%',
        right: basic ? '9%' : '7%',
        bottom: vertical ? '12%' : '9%',
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
        fontFamily: 'Inter, Arial, sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'baseline',
          gap: basic ? 0 : Math.max(6, width * 0.008),
          maxWidth: vertical ? '92%' : '78%',
          padding: basic
            ? `${height * 0.018}px ${width * 0.03}px`
            : `${height * 0.022}px ${width * 0.035}px`,
          borderRadius: Math.max(18, width * 0.028),
          background: 'rgba(0,0,0,0.68)',
          boxShadow: '0 14px 40px rgba(0,0,0,0.22)',
          color: '#FFFFFF',
          textAlign: 'center',
          lineHeight: 1.08,
          fontSize,
          fontWeight: basic ? 760 : 900,
          letterSpacing: basic ? 0 : -fontSize * 0.025,
        }}
      >
        {basic ? (
          <span>{page.text}</span>
        ) : (
          page.tokens.map((token, index) => {
            const active = highlight && nowMs >= token.fromMs && nowMs < token.toMs;
            return (
              <span
                key={`${token.fromMs}-${index}-${token.text}`}
                style={{
                  color: active ? accent : '#FFFFFF',
                  transform: active ? 'scale(1.06)' : 'scale(1)',
                  transformOrigin: '50% 80%',
                  textShadow: active ? '0 0 24px rgba(0,0,0,0.35)' : undefined,
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
