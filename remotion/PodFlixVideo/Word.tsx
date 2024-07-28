import { Easing, useCurrentFrame, useVideoConfig } from 'remotion';
import { interpolate } from 'remotion';
import React from 'react';

export const Word: React.FC<{
  item: { word: string, start: number, end: number };
  transcriptionColor: string;
}> = ({ item, transcriptionColor }) => {

  const frame = useCurrentFrame();
  const config = useVideoConfig()

  const opacity = interpolate(frame, [item.start * config.fps, (item.start + item.end * 0.25) * config.fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: 'clamp',
  });

  const translateY = interpolate(
    frame,
    [item.start * config.fps, (item.start + item.end * 0.25) * config.fps],
    [0.25, 0],
    {
      easing: Easing.out(Easing.quad),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    },
  );

  return (
    <span
      style={{
        display: 'inline-block',
        opacity,
        translate: `0 ${translateY}em`,
        color: transcriptionColor,
        fontSize: 36,
        marginRight: 16,
        fontWeight: 500
      }}
    >
      {item.word}
    </span>
  );
};