import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { useAudioData, visualizeAudio } from '@remotion/media-utils';

export const AudioViz: React.FC<{
  waveColor: string;
  numberOfSamples: number;
  freqRangeStartIndex: number;
  waveLinesToDisplay: number;
  mirrorWave: boolean;
  audioSrc: string;
}> = ({
  waveColor,
  numberOfSamples,
  freqRangeStartIndex,
  waveLinesToDisplay,
  mirrorWave,
  audioSrc,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const audioData = useAudioData(audioSrc);

    if (!audioData) {
      return null;
    }

    const frequencyData = visualizeAudio({
      fps,
      frame,
      audioData,
      numberOfSamples, // Use more samples to get a nicer visualisation
    });

    // Pick the low values because they look nicer than high values
    // feel free to play around :)
    const frequencyDataSubset = frequencyData.slice(
      freqRangeStartIndex,
      freqRangeStartIndex +
      (mirrorWave ? Math.round(waveLinesToDisplay / 2) : waveLinesToDisplay),
    );

    const frequenciesToDisplay = mirrorWave
      ? [...frequencyDataSubset.slice(1).reverse(), ...frequencyDataSubset]
      : frequencyDataSubset;

    return (
      <AbsoluteFill
        style={{
          top: 10,
          justifyContent: "start",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "row", height: 48, width: 48 * 4, justifyContent: "center", alignItems: "center", gap: 12, marginTop: 48 }}>
          {frequenciesToDisplay.map((v, i) => {
            return (
              <div
                key={i}
                className="bar"
                style={{
                  minWidth: '2px',
                  backgroundColor: waveColor,
                  height: `${750 * Math.sqrt(v)}%`,
                }}
              />
            );
          })}
        </div>
      </AbsoluteFill>
    );
  };