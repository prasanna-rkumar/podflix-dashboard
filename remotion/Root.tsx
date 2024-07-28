import React from 'react';
import { Composition } from 'remotion';
import './style.css';
import { COMP_NAME, defaultCompositionProps, DURATION_IN_FRAMES, VIDEO_FPS, VIDEO_HEIGHT, VIDEO_WIDTH } from '../types/constants';
import PodFlixVideo from './PodFlixVideo';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id={COMP_NAME}
        component={PodFlixVideo}
        defaultProps={defaultCompositionProps}
        durationInFrames={DURATION_IN_FRAMES}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
      />
    </>
  );
};