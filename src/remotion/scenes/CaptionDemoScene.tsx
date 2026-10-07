import {AbsoluteFill, useVideoConfig} from 'remotion';
import type {CaptionDemoScene, VideoProject} from '../../project/schema';
import {CaptionOverlay} from '../CaptionOverlay';

export const CaptionDemoSceneFrame = ({
  scene,
  project,
}: {
  scene: CaptionDemoScene;
  project: VideoProject;
}) => {
  const {width, height} = useVideoConfig();
  const paper = scene.background === 'paper';
  const gradient = scene.background === 'gradient';
  const background = paper
    ? '#F3EFE5'
    : gradient
      ? 'radial-gradient(circle at 72% 22%, #17354A 0%, #0B1722 38%, #071016 100%)'
      : project.theme.background;
  const foreground = paper ? '#111827' : project.theme.foreground;

  return (
    <AbsoluteFill
      style={{
        background,
        color: foreground,
        overflow: 'hidden',
        fontFamily: 'Inter, Arial, sans-serif',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: paper
            ? 'linear-gradient(rgba(17,24,39,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(17,24,39,0.04) 1px, transparent 1px)'
            : 'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
          backgroundSize: `${width * 0.09}px ${width * 0.09}px`,
          opacity: 0.45,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: width * 0.07,
          right: width * 0.07,
          top: height * 0.07,
        }}
      >
        <div
          style={{
            color: project.theme.accent,
            fontSize: width * 0.018,
            fontWeight: 850,
            letterSpacing: 4,
          }}
        >
          CAPTION STYLE · {scene.captionStyle.toUpperCase()}
        </div>
        {scene.title ? (
          <div
            style={{
              marginTop: height * 0.014,
              fontFamily: 'Georgia, serif',
              fontSize: width * 0.052,
              lineHeight: 1.05,
              fontWeight: 760,
              color: foreground,
            }}
          >
            {scene.title}
          </div>
        ) : null}
      </div>
      <div
        style={{
          position: 'absolute',
          left: width * 0.08,
          right: width * 0.08,
          top: height * 0.34,
          height: height * 0.3,
          borderRadius: width * 0.045,
          border: paper ? '1px solid rgba(17,24,39,0.12)' : '1px solid rgba(255,255,255,0.10)',
          background: paper ? 'rgba(255,255,255,0.46)' : 'rgba(255,255,255,0.045)',
          boxShadow: paper ? '0 24px 70px rgba(55,48,36,0.10)' : '0 24px 70px rgba(0,0,0,0.22)',
        }}
      />
      <CaptionOverlay scene={scene} project={project} />
    </AbsoluteFill>
  );
};
