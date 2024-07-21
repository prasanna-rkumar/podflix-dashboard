import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  cancelRender,
  continueRender,
  delayRender,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { ensureFont } from '../ensure-font';
import { Word } from './Word';

const useWindowedFrameSubs = (
  subs: { word: string, start: number, end: number }[],
  options: { windowStart: number; windowEnd: number },
) => {
  const { windowStart, windowEnd } = options;
  const config = useVideoConfig();
  const { fps } = config;

  return useMemo(() => {
    return subs
      .map((item) => {
        const start = Math.floor(item.start * fps);
        const end = Math.floor(item.end * fps);
        return { item, start, end };
      })
      .filter(({ start }) => {
        return start >= windowStart && start <= windowEnd;
      })
      .map(({ item, start, end }) => {
        return {
          ...item,
          start,
          end,
        };
      }, []);
  }, [fps, subs, windowEnd, windowStart]);
};

export const PaginatedSubtitles: React.FC<{
  subtitles: { word: string, start: number, end: number }[];
  startFrame: number;
  endFrame: number;
  linesPerPage: number;
  subtitlesTextColor: string;
  subtitlesZoomMeasurerSize: number;
  subtitlesLineHeight: number;
  onlyDisplayCurrentSentence: boolean;
}> = ({
  startFrame,
  endFrame,
  subtitles,
  linesPerPage,
  subtitlesTextColor: transcriptionColor,
  subtitlesZoomMeasurerSize,
  subtitlesLineHeight,
  onlyDisplayCurrentSentence,
}) => {
    const frame = useCurrentFrame();
    const windowRef = useRef<HTMLDivElement>(null);
    const zoomMeasurer = useRef<HTMLDivElement>(null);
    const [handle] = useState(() => delayRender());
    const [fontHandle] = useState(() => delayRender());
    const [fontLoaded, setFontLoaded] = useState(false);
    const windowedFrameSubs = useWindowedFrameSubs(subtitles, {
      windowStart: startFrame,
      windowEnd: endFrame,
    });

    const [lineOffset, setLineOffset] = useState(0);

    const currentAndFollowingSentences = useMemo(() => {
      // If we don't want to only display the current sentence, return all the words
      if (!onlyDisplayCurrentSentence) return windowedFrameSubs;

      const indexOfCurrentSentence =
        windowedFrameSubs.findLastIndex((w, i) => {
          const nextWord = windowedFrameSubs[i + 1];

          return (
            nextWord &&
            (w.word.endsWith('?') ||
              w.word.endsWith('.') ||
              w.word.endsWith('!')) &&
            nextWord.start < frame
          );
        }) + 1;

      return windowedFrameSubs.slice(indexOfCurrentSentence);
    }, [frame, onlyDisplayCurrentSentence, windowedFrameSubs]);

    useEffect(() => {
      if (!fontLoaded) {
        return;
      }
      const zoom =
        (zoomMeasurer.current?.getBoundingClientRect().height as number) /
        subtitlesZoomMeasurerSize;
      const linesRendered =
        (windowRef.current?.getBoundingClientRect().height as number) /
        (subtitlesLineHeight * zoom);
      const linesToOffset = Math.max(0, linesRendered - linesPerPage);
      setLineOffset(linesToOffset);
      continueRender(handle);
    }, [
      fontLoaded,
      frame,
      handle,
      linesPerPage,
      subtitlesLineHeight,
      subtitlesZoomMeasurerSize,
    ]);

    useEffect(() => {
      ensureFont()
        .then(() => {
          continueRender(fontHandle);
          setFontLoaded(true);
        })
        .catch((err) => {
          cancelRender(err);
        });
    }, [fontHandle, fontLoaded]);

    const currentFrameSentences = currentAndFollowingSentences.filter((word) => {
      return word.start < frame;
    });

    return (
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          paddingBottom: '20px',
        }}
      >
        <div
          ref={windowRef}
          style={{
            transform: `translateY(-${lineOffset * subtitlesLineHeight}px)`,
          }}
        >
          {currentFrameSentences.map((item, index) => (
            <span key={index} id={String(index)}>
              <Word
                frame={frame}
                item={item}
                transcriptionColor={transcriptionColor}
              />{' '}
            </span>
          ))}
        </div>
        <div
          ref={zoomMeasurer}
          style={{
            height: subtitlesZoomMeasurerSize,
            width: subtitlesZoomMeasurerSize,
          }}
        />
      </div>
    );
  };

declare global {
  interface Array<T> {
    findLastIndex(
      predicate: (value: T, index: number, obj: T[]) => unknown,
      thisArg?: unknown,
    ): number;
  }
}