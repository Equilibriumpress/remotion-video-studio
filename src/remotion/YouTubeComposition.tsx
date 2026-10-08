import {Audio} from '@remotion/media';
import {
  AbsoluteFill,
  Img,
  interpolate,
  Sequence,
  Series,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import type {VideoProject, VideoScene, YouTubeChapter} from '../project/schema';
import {resolveAsset} from '../project/assets';
import {SceneFrame} from './SceneFrame';
import {CaptionOverlay} from './CaptionOverlay';

const ChapterCaptions = ({
  chapter,
  project,
}: {
  chapter: YouTubeChapter;
  project: VideoProject;
}) => {
  if (chapter.captions.length === 0) return null;

  const scene = {
    id: `youtube-captions-${chapter.id}`,
    type: 'caption-demo' as const,
    duration: chapter.duration,
    background: 'dark' as const,
    captionStyle: chapter.captionStyle,
    captionPosition: 'bottom' as const,
    emphasisWords: [],
    combineTokensWithinMilliseconds: 2200,
    captions: chapter.captions,
  };

  return <CaptionOverlay scene={scene} project={project} />;
};

const OverlayFrame = ({
  scene,
  project,
  durationInFrames,
}: {
  scene: VideoScene;
  project: VideoProject;
  durationInFrames: number;
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const fadeFrames = Math.min(Math.round(fps * 0.32), Math.floor(durationInFrames / 4));
  const opacity = interpolate(
    frame,
    [0, fadeFrames, Math.max(fadeFrames, durationInFrames - fadeFrames), durationInFrames - 1],
    [0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );

  return (
    <AbsoluteFill style={{opacity}}>
      <SceneFrame scene={scene} project={project} transitionInFrames={0} />
    </AbsoluteFill>
  );
};

const YouTubeEndCard = ({project}: {project: VideoProject}) => {
  const endCard = project.youtube?.endCard;
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();

  if (!endCard) return null;

  const rise = interpolate(frame, [0, Math.round(fps * 0.55)], [28, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const opacity = interpolate(frame, [0, Math.round(fps * 0.45)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const slotWidth = width * 0.31;
  const slotHeight = slotWidth * 9 / 16;

  return (
    <AbsoluteFill
      style={{
        background: '#F7F7F3',
        color: '#111827',
        fontFamily: 'Inter, Arial, sans-serif',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: width * 0.06,
          top: height * 0.16,
          width: width * 0.46,
          opacity,
          transform: `translateY(${rise}px)`,
        }}
      >
        <div
          style={{
            fontSize: width * 0.043,
            lineHeight: 1.03,
            fontWeight: 860,
            letterSpacing: -width * 0.0017,
          }}
        >
          {endCard.title}
        </div>
        {endCard.subtitle ? (
          <div
            style={{
              marginTop: height * 0.03,
              maxWidth: width * 0.36,
              fontSize: width * 0.018,
              lineHeight: 1.35,
              color: '#606772',
            }}
          >
            {endCard.subtitle}
          </div>
        ) : null}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: width * 0.014,
            marginTop: height * 0.07,
          }}
        >
          {endCard.avatarSrc ? (
            <Img
              src={resolveAsset(endCard.avatarSrc)}
              style={{
                width: width * 0.064,
                height: width * 0.064,
                objectFit: 'cover',
                borderRadius: '50%',
              }}
            />
          ) : (
            <div
              style={{
                width: width * 0.064,
                height: width * 0.064,
                borderRadius: '50%',
                background: project.theme.accent,
              }}
            />
          )}
          <div>
            <div style={{fontSize: width * 0.017, fontWeight: 800}}>
              {endCard.channelName}
            </div>
            {endCard.channelHandle ? (
              <div style={{marginTop: 4, fontSize: width * 0.012, color: '#747B85'}}>
                {endCard.channelHandle}
              </div>
            ) : null}
          </div>
        </div>

        <div
          style={{
            display: 'inline-flex',
            marginTop: height * 0.04,
            padding: `${height * 0.018}px ${width * 0.028}px`,
            borderRadius: 999,
            background: '#111827',
            color: '#FFFFFF',
            fontSize: width * 0.016,
            fontWeight: 800,
          }}
        >
          {endCard.subscribeLabel}
        </div>
      </div>

      {[0, 1].map((slot) => (
        <div
          key={slot}
          style={{
            position: 'absolute',
            right: width * 0.055,
            top: slot === 0 ? height * 0.13 : height * 0.53,
            width: slotWidth,
            height: slotHeight,
            borderRadius: width * 0.008,
            border: `${Math.max(2, width * 0.0022)}px solid #111827`,
            background: 'rgba(17,24,39,0.035)',
            opacity,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

const Chapter = ({
  chapter,
  project,
}: {
  chapter: YouTubeChapter;
  project: VideoProject;
}) => {
  const {fps} = useVideoConfig();
  const baseScene = {...chapter.base, duration: chapter.duration} as VideoScene;

  return (
    <AbsoluteFill>
      <SceneFrame scene={baseScene} project={project} transitionInFrames={0} />

      {chapter.overlays.map((overlay) => {
        const durationInFrames = Math.max(1, Math.round(overlay.scene.duration * fps));
        return (
          <Sequence
            key={overlay.scene.id}
            name={overlay.scene.id}
            from={Math.round(overlay.from * fps)}
            durationInFrames={durationInFrames}
            premountFor={Math.min(fps, durationInFrames)}
          >
            <OverlayFrame
              scene={overlay.scene}
              project={project}
              durationInFrames={durationInFrames}
            />
          </Sequence>
        );
      })}

      <ChapterCaptions chapter={chapter} project={project} />
    </AbsoluteFill>
  );
};

export const YouTubeComposition = ({project}: {project: VideoProject}) => {
  const youtube = project.youtube;
  const {fps} = useVideoConfig();

  if (!youtube) return null;

  return (
    <AbsoluteFill style={{backgroundColor: project.theme.background}}>
      {youtube.music ? (
        <Audio
          src={resolveAsset(youtube.music.src)}
          volume={youtube.music.volume}
          loop={youtube.music.loop}
        />
      ) : null}

      {youtube.voiceover ? (
        <Audio
          src={resolveAsset(youtube.voiceover.src)}
          volume={youtube.voiceover.volume}
          loop={youtube.voiceover.loop}
        />
      ) : null}

      <Series>
        {youtube.chapters.map((chapter) => (
          <Series.Sequence
            key={chapter.id}
            name={chapter.title}
            durationInFrames={Math.max(1, Math.round(chapter.duration * fps))}
            premountFor={fps}
          >
            <Chapter chapter={chapter} project={project} />
          </Series.Sequence>
        ))}

        {youtube.endCard ? (
          <Series.Sequence
            name="YouTube end card"
            durationInFrames={Math.round(youtube.endCard.duration * fps)}
            premountFor={fps}
          >
            <YouTubeEndCard project={project} />
          </Series.Sequence>
        ) : null}
      </Series>
    </AbsoluteFill>
  );
};
