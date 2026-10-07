import type {ReactNode} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import type {VideoScene} from '../project/schema';
import {beatPulse} from './timing';

type BeatSync = NonNullable<VideoScene['beatSync']>;

export const BeatSyncFrame = ({
  beatSync,
  children,
}: {
  beatSync: BeatSync;
  children: ReactNode;
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const scale = beatPulse({
    frame,
    fps,
    beats: beatSync.beats,
    strength: beatSync.strength,
    decaySeconds: beatSync.decaySeconds,
  });

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <AbsoluteFill
        style={{
          transform: `scale(${scale})`,
          transformOrigin: '50% 50%',
          willChange: 'transform',
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
