import { Button } from "@/components/ui/button";
import { wait } from "@/lib/utils";
import { MAX_CHARACTERS_IN_FRAME, WORDS_IN_FRAME } from "@/remotion/constants";
import PodFlixVideo from "@/remotion/PodFlixVideo";
import { SubtitleWordType } from "@/remotion/types";
import { Video } from "@/server";
import { trpc } from "@/trpc/client";
import { Player } from "@remotion/player";
import { ClipboardCopy, CopyCheckIcon, CopyIcon, LoaderCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import HighlightHashtags from "../HighlightHashtags";
import clsx from "clsx";
import { RenderControls } from "./RenderControls";

const formattedSubs = (video: z.infer<typeof Video>) => {
  let subsPaginated: { start: number, end: number, words: z.infer<typeof SubtitleWordType>[] }[] = [];
  if (!video) {
    return subsPaginated;
  }

  let frameTemp: z.infer<typeof SubtitleWordType>[] = [];

  for (let i = 0; i < video.captions.length; i++) {
    if (
      frameTemp.length < WORDS_IN_FRAME &&
      frameTemp.map((frame) => frame.word).join(" ").length < MAX_CHARACTERS_IN_FRAME &&
      ![...frameTemp].pop()?.word.endsWith(".")
    ) {
      frameTemp.push({
        word: video.captions[i].punctuated_word ?? video.captions[i].word,
        start: video.captions[i].start,
        end: video.captions[i].end
      });
      continue;
    }

    subsPaginated.push({
      start: frameTemp[0].start,
      end: frameTemp[frameTemp.length - 1].end,
      words: frameTemp.map((frame) => ({
        word: frame.word,
        start: frame.start - frameTemp[0].start,
        end: frame.end - frameTemp[0].start
      }))
    });
    frameTemp = [];
    i--;

  }

  if (frameTemp.length > 0) {
    subsPaginated.push({
      start: frameTemp[0].start,
      end: frameTemp[frameTemp.length - 1].end,
      words: frameTemp.map((frame) => ({
        word: frame.word,
        start: frame.start - frameTemp[0].start,
        end: frame.end - frameTemp[0].start
      }))
    });
  }

  return subsPaginated; // Add this line to fix the return type
}

export default function VideoEditor({ video: initVideo }: { video: z.infer<typeof Video> | null }) {

  const [video, setVideo] = useState<z.infer<typeof Video> | null>(initVideo);
  const [descriptionIndex, setDescriptionIndex] = useState(0);
  const { client } = trpc.useUtils();

  useEffect(() => {
    if (!video) return;
    if (video.audio_status !== "PENDING") return;

    let pending = true;
    (async () => {
      while (pending) {
        const resp = await client.getVideo.query(video.video_id ?? "");
        if (!resp) return;
        switch (resp.audio_status) {
          case "READY": {
            setVideo((prevVideo) => {
              if (!prevVideo) return null;
              return {
                ...prevVideo,
                audio_status: "READY",
                audio_clip_url: resp.audio_clip_url,
                captions: resp.captions,
                descriptions: resp.descriptions
              }
            });
            pending = false;
            break;
          }
          case "FAILED": {
            console.error("Failed to download audio");
            window.alert("Failed to download audio");
            pending = false;
            break;
          }
          case "PENDING": {
            console.log("Downloading audio");
            break;
          }
        }
        await wait(2000)
      }
    })()

    return () => {
      pending = false
    }
  }, [client.getVideo, video])


  return (
    <div className="flex h-full justify-center">
      <div className="w-full max-h-[896px] max-w-4xl">
        {
          !video || video.audio_status !== "READY" || !video.audio_clip_url ? (
            <div className=" fixed w-screen h-screen bg-black/50 top-0 left-0 z-30 flex flex-col gap-4 justify-center items-center">
              <LoaderCircle size={32} className=" animate-spin" color="white" />
              <h2 className=" text-white font-medium text-2xl ">Creating your video</h2>
            </div>
          ) : (
            <>
              <RenderControls inputProps={{
                captions: formattedSubs(video),
                audio_url: video.audio_clip_url,
                episode_art: video.episodeArt,
                episode_title: video.title
              }} />
              <div
                className="border-2 mt-3 border-slate-300 w-full rounded-md flex justify-center items-center"
                style={{ height: "calc(100vh * 2 / 3)" }}
              >
                <Player
                  className="bg-slate-100"
                  style={{
                    width: "100%",
                    height: "100%",
                  }}
                  compositionHeight={1080}
                  compositionWidth={1080}
                  controls
                  component={PodFlixVideo}
                  durationInFrames={24 * 60}
                  fps={24}
                  inputProps={{
                    captions: formattedSubs(video),
                    audio_url: video.audio_clip_url,
                    episode_art: video.episodeArt,
                    episode_title: video.title
                  }}
                />
              </div>
              {
                video.descriptions && video.descriptions.length > 0 && (
                  <div className="descriptions mb-4">
                    <div className=" flex justify-between">
                      <h2 className="text-slate-900 font-medium text-lg mt-4 mb-2">Description</h2>
                      <div className=" flex gap-2 items-center justify-end">
                        {
                          video.descriptions?.map((description, index) => (
                            <Button onClick={() => setDescriptionIndex(index)} key={index} variant="outline" size="sm" className={
                              clsx("mr-2", descriptionIndex === index && "bg-slate-900 text-slate-100 hover:bg-slate-800 hover:text-slate-50")
                            }>
                              {index + 1}
                            </Button>
                          ))
                        }
                      </div>
                    </div>
                    <div className="text-slate-900 text-base flex item-center justify-between">
                      <HighlightHashtags text={video.descriptions[descriptionIndex]} />
                      <CopyToClipboardButton text={video.descriptions[descriptionIndex]} />
                    </div>
                  </div>
                )
              }
            </>
          )
        }
      </div>
    </div>
  );
}

const CopyToClipboardButton = ({ text }: { text: string }) => {

  const [copied, setCopied] = useState(false);

  return (
    <Button className={clsx(" w-7 h-7 grow shrink-0 text-center", copied && "bg-green-300 hover:bg-green-300")} variant={"outline"} size="icon" onClick={() => {
      console.log("copy to clipboard!")
      setCopied(true);
      navigator.clipboard.writeText(text);
      setTimeout(() => {
        setCopied(false);
      }, 2000)
    }}>
      {
        copied ? (
          <CopyCheckIcon size={20} color="black" />
        ) : (
          <CopyIcon size={20} />
        )
      }
    </Button>
  )
}
