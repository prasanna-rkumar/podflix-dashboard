import { Easing } from 'remotion';
import { interpolate } from 'remotion';
import React from 'react';

export const Word: React.FC<{
  item: { word: string, start: number, end: number };
  frame: number;
  transcriptionColor: string;
}> = ({ item, frame, transcriptionColor }) => {
  const opacity = interpolate(frame, [item.start, item.start + 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const translateY = interpolate(
    frame,
    [item.start, item.start + 10],
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
        fontSize: 128
      }}
    >
      {item.word}
    </span>
  );
};