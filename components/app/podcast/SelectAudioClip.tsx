import { Button } from "@/components/ui/button";
import { MultiRangeSlider } from "@/components/ui/MultiRangeSlider";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { secondsToHHMMSS, secondsToHHMMSSWithoutZeroPadding, wait } from "@/lib/utils";
import { Episode, Video } from "@/server";
import { trpc } from "@/trpc/client";
import { CaretDownIcon } from "@radix-ui/react-icons";
import { Player } from "@remotion/player";
import { ArrowRightIcon, LoaderCircle, PauseIcon, PlayIcon, RotateCcw, RotateCw, ZoomInIcon, ZoomOutIcon } from "lucide-react";
import { Fragment, useEffect, useRef, useState } from "react";
import { z } from "zod";

type SelectAudioClipProps = {
  episode: z.infer<typeof Episode> | null;
  onContinue: (video: z.infer<typeof Video>) => any
}
export const SelectAudioClip = ({ episode: initEpisode, onContinue }: SelectAudioClipProps) => {

  const [isCreatingVideoFile, setIsCreatingVideoFile] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [clipDuration, setClipDuration] = useState("60");
  const [zoom, setZoom] = useState(2.5);
  const [selectionRange, setSelectionRange] = useState<[number, number]>([0, 60]);
  const [seek, setSeek] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { client } = trpc.useUtils();
  const [episode, setEpisode] = useState<z.infer<typeof Episode> | null>(initEpisode);
  const [audioIsLoading, setAudioIsLoading] = useState(false);

  const handleSeeking = () => {
    setAudioIsLoading(true);
  };

  const handlePlaying = () => {
    setAudioIsLoading(false);
  };

  const handleWaiting = () => {
    setAudioIsLoading(true);
  };

  const handleSeeked = () => {
    setAudioIsLoading(false);
  };

  useEffect(() => {
    if (!episode) return;
    if (episode.audio_status !== "PENDING") return;

    let pending = true;
    (async () => {
      while (pending) {
        const resp = await client.getEpisode.query(episode.episode_id ?? "");
        if (!resp) return;
        switch (resp.audio_status) {
          case "READY": {
            setEpisode((prevEpisode) => {
              if (!prevEpisode) return null;
              return {
                ...prevEpisode,
                audio_status: "READY",
                s3_audio_key: resp.s3_audio_key
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
  }, [client.getEpisode, episode])

  if (!episode) {
    return null;
  }

  return (
    <div className=" w-full">
      {
        episode.audio_status === "PENDING" && (
          <div className=" fixed w-screen h-screen bg-black/50 top-0 left-0 z-30 flex flex-col gap-4 justify-center items-center">
            <LoaderCircle size={32} className=" animate-spin" color="white" />
            <h2 className=" text-white font-medium text-2xl ">Downloading audio</h2>
          </div>
        )
      }
      <div className="flex justify-start items-center">
        <h3 className=" grow shrink-0 text-xl font-medium text-slate-700"><span className=" text-base font-normal text-slate-500">Episode:</span> {episode.title}</h3>
      </div>
      <div className=" mt-4 flex justify-between items-center gap-4">

        <div className=" w-36 flex justify-start items-center gap-1">
          <span className=" text-slate-600 font-light text-sm">Clip Duration: </span>
          <Select value={clipDuration} onValueChange={(val) => {
            setSelectionRange((prev) => {
              const difference = parseInt(val);
              return [prev[0], prev[0] + difference]
            })
            setClipDuration(val)
          }}>
            <TooltipProvider>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <SelectTrigger className="w-9 h-9">
                    <SelectValue placeholder="Clip Duration" />
                  </SelectTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Select clip duration</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <SelectContent>
              <SelectGroup>
                <SelectLabel>Clip Duration</SelectLabel>
                <SelectItem value="15">15s</SelectItem>
                <SelectItem value="30">30s</SelectItem>
                <SelectItem value="45">45s</SelectItem>
                <SelectItem value="60">1m</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="w-36 flex justify-start items-center gap-4">

          <Button
            variant={"outline"}
            size={"icon"}
            className=" rounded-full relative"
            onClick={() => {
              if (!audioRef.current) return;
              audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 15);
              setSelectionRange((prev) => {
                const duration = prev[1] - prev[0];
                const newStart = Math.max(0, prev[0] - 15);
                const newEnd = newStart + duration;
                return [newStart, newEnd]
              })
            }}
          >
            <RotateCcw size={24} />
            <span className="absolute top-1.5 left-[11px] text-[10px]">15</span>
          </Button>
          <Button
            disabled={audioIsLoading}
            variant={"outline"}
            size={"icon"}
            className=" rounded-full"
            onClick={() => {
              setIsPlaying((prev) => !prev);
              if (!audioRef.current) return;
              if (audioRef.current.paused) {
                audioRef.current.play();
                audioRef.current.currentTime = selectionRange[0];
              } else {
                audioRef.current.pause();
              }
            }}
          >
            {
              audioIsLoading
                ? <LoaderCircle size={24} className=" animate-spin" />
                : (
                  isPlaying
                    ? <PauseIcon size={24} />
                    : <PlayIcon size={24} />
                )
            }
          </Button>
          <Button
            variant={"outline"}
            size={"icon"}
            className=" rounded-full relative"
            onClick={() => {
              if (!audioRef.current) return;
              audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime + 15);
              setSelectionRange((prev) => {
                const duration = prev[1] - prev[0];
                const newStart = Math.min(prev[0] + 15, episode.duration);
                const newEnd = newStart + duration;
                return [newStart, newEnd]
              })
            }}
          >
            <RotateCw size={24} />
            <span className="absolute top-1.5 left-2.5 text-[10px]">15</span>
          </Button>
        </div>

        <div className="w-36 flex justify-start items-center font-medium gap-1">
          {secondsToHHMMSS(seek, false)}
          <span className=" text-gray-600 font-normal">
            /
          </span>
          <span className=" text-gray-600 font-normal">
            {secondsToHHMMSS(episode.duration, false)}
          </span>
        </div>

      </div>
      <div className=" w-full h-28 relative overflow-x-auto p-2">
        <div style={{ width: episode.duration * zoom }} className="relative flex flex-col gap-2 h-12">
          <div className="absolute top-0 z-10" style={{ left: seek * zoom }}>
            <div className="w-[1px] h-10 bg-black">
            </div>
            <CaretDownIcon className="w-6 h-6 absolute -left-3 -top-4 text-black" />
          </div>

          <MultiRangeSlider
            onValueChange={(value) => {
              setSelectionRange((prev) => {
                if (prev[0] === value[0] && prev[1] !== value[1] && value[1] - value[0] > 60) {
                  value[0] = value[1] - 60
                }
                if (prev[1] === value[1] && prev[0] !== value[0] && value[1] - value[0] > 60) {
                  value[1] = value[0] + 60
                }

                // to reset the audio to the new starting time
                if (prev[0] !== value[0]) {
                  if (audioRef.current) {
                    audioRef.current.currentTime = value[0];
                  }
                }
                return [value[0], value[1]];
              })
            }}
            minStepsBetweenThumbs={10}
            value={selectionRange}
            min={0}
            max={episode.duration}
            step={1}
            className="w-full"
          />
          <div className="relative grow shrink-0 w-full h-4 bg-slate-100">
            {
              Array.from({ length: Math.ceil(episode.duration / 30) }).map((_, index) => {
                const time = index * 30;
                return (
                  <Fragment key={index}>
                    <div style={{ left: `${time * 100 / episode.duration}%` }} className="absolute h-6 bottom-0 w-[1px] bg-gray-400 z-10 text-[10px]">
                      <span className="absolute top-full left-1/2 -translate-x-1/2">
                        {secondsToHHMMSSWithoutZeroPadding(time)}
                      </span>
                    </div>
                    <div style={{ left: `${(time + 15) * 100 / episode.duration}%` }} className="absolute bottom-2 h-4 w-[1px] bg-gray-300 z-10 text-gray-500 text-[10px]">
                      <span className="absolute top-full left-1/2 -translate-x-1/2 pt-[1px]">
                        {secondsToHHMMSSWithoutZeroPadding(time + 15).split(":").pop()}
                      </span>
                    </div>
                  </Fragment>
                )
              })
            }
          </div>
        </div>
      </div>
      <div className="w-full flex justify-end items-center my-4">
        <Button disabled={zoom === 2.5} variant={"outline"} size={"icon"} className=" rounded-full w-6 h-6" onClick={() => {
          setZoom((prev) => Math.max(2.5, prev - 0.1));
        }}>
          <ZoomOutIcon size={16} />
        </Button>
        <Slider
          className=" max-w-52"
          value={[zoom]}
          onValueChange={(value) => {
            setZoom(value[0]);
          }}
          min={2.5}
          max={10}
          step={0.1}
        />
        <Button disabled={zoom === 10} variant={"outline"} size={"icon"} className=" rounded-full w-6 h-6" onClick={() => {
          setZoom((prev) => Math.min(10, prev + 0.1));
        }}>
          <ZoomInIcon size={16} />
        </Button>
      </div>
      <div className=" w-full flex justify-end">
        <Button
          variant={"default"}
          size={"lg"}
          className=" flex justify-center items-center gap-1"
          disabled={!episode || !episode.s3_audio_key || isCreatingVideoFile}
          onClick={async () => {
            if (!episode || !episode.s3_audio_key) return;
            setIsCreatingVideoFile(true);
            const resp = await client.createVideo.mutate({
              episode,
              range: selectionRange,
              audio_url: episode.s3_audio_key
            });
            setIsCreatingVideoFile(false);
            onContinue(resp);
          }}
        >
          <span className=" font-medium">Continue</span>
          {
            isCreatingVideoFile ? <LoaderCircle size={24} className=" animate-spin" /> : <ArrowRightIcon size={24} />
          }
        </Button>
      </div>
      {
        episode.s3_audio_key && (
          <audio
            className="hidden"
            ref={audioRef}
            src={episode.s3_audio_key}
            onSeeking={handleSeeking}
            onPlaying={handlePlaying}
            onWaiting={handleWaiting}
            onSeeked={handleSeeked}
            onTimeUpdate={() => {
              if (!audioRef.current) return;
              setSeek(audioRef.current.currentTime);
              if (audioRef.current.currentTime >= selectionRange[1]) {
                audioRef.current.currentTime = selectionRange[0];
                // setIsPlaying(false);
              }
            }} controls
          />
        )
      }
    </div>
  )
}
