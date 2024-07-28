import { Fragment } from "react";
import { AbsoluteFill, Audio, Img, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { SubtitleWordType } from "../types";
import { AudioViz } from "./AudioViz";
import { Word } from "./Word";

export default function PodFlixVideo({ captions, audio_url, episode_art, episode_title }: {
  captions: { start: number, end: number, words: z.infer<typeof SubtitleWordType>[] }[],
  audio_url: string,
  episode_art: string,
  episode_title: string,
}) {

  const config = useVideoConfig();

  console.log({ captionsLength: captions.length })

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          fontSize: 24,
          backgroundColor: "white",
          gap: 12
        }}
      >
        <Img
          src={episode_art}
          style={{
            width: 512,
            height: 512,
            objectFit: "cover",
            borderRadius: 20,
            boxShadow: "0 0 10px rgba(0,0,0,.1)",
            marginBottom: 24
          }}
        />
        <h1 style={{ fontWeight: 600, fontSize: 48, textAlign: "center" }}>{episode_title}</h1>
        <Audio
          src={audio_url}
          volume={1}
        />
        <div
          style={{
            lineHeight: "100px",
            position: "absolute",
            bottom: 200,
            transform: "translateX(-50%)",
            left: "50%"
          }}
          className="captions"
        >
          {
            captions.map((frameCaptions, index) => {

              return (
                <Sequence style={{ width: "100%", justifyContent: "center" }} key={index} from={frameCaptions.start * config.fps} durationInFrames={(frameCaptions.end - frameCaptions.start) * config.fps}>
                  {
                    frameCaptions.words.map((word, index) => {
                      return (
                        <Fragment key={index}>
                          <Word
                            item={word}
                            transcriptionColor={"#000"}
                          />
                        </Fragment>
                      )
                    })
                  }
                </Sequence>
              )
            })
          }
        </div>
      </AbsoluteFill>
      <AudioViz
        audioSrc={audio_url}
        mirrorWave={true}
        waveColor={"#000000"}
        numberOfSamples={Number(256)}
        freqRangeStartIndex={1}
        waveLinesToDisplay={54}
      />
    </AbsoluteFill>
  )
}