"use client";

import VideoEditor from "@/components/app/video/VideoEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiRangeSlider } from "@/components/ui/MultiRangeSlider";
import { Slider } from "@/components/ui/slider";
import { cn, secondsToHHMMSS, secondsToHHMMSSWithoutZeroPadding, wait } from "@/lib/utils";
import { Episode } from "@/server";
import { trpc } from "@/trpc/client";
import { CaretDownIcon } from "@radix-ui/react-icons";
import { ArrowBigLeft, ArrowBigRight, LoaderCircle, PauseIcon, PlayIcon } from "lucide-react";
import Image from "next/image";
import { Fragment, useEffect, useRef, useState } from "react";
import { z } from "zod";

const STEPS = [
  { name: "Select Episode", description: "Choose an episode from your podcast show" },
  { name: "Select audio clip", description: "Select the audio clip you want to use for the video" },
  { name: "Create video", description: "Generate a video using the selected episode and audio clip" }
];

export default function DashboardPage() {

  const [currentStep, setCurrentStep] = useState(2);
  const [choosenEpisode, setChoosenEpisode] = useState<z.infer<typeof Episode> | null>(null);

  return (
    <div className="w-full max-w-7xl mx-auto py-12 px-4 md:px-6">
      <div className="flex justify-between items-center w-full max-w-2xl mx-auto gap-4 mb-8">
        {
          STEPS.map((step, index) => {
            return (
              <Fragment key={index}>
                <Button
                  onClick={() => setCurrentStep(index)}
                  variant={"ghost"}
                  className={cn(" text-sm font-medium", index === currentStep ? "text-blue-500" : currentStep > index ? "text-green-500" : "text-slate-800")}
                >
                  {index + 1}. {step.name}
                </Button>
                {
                  index !== STEPS.length - 1 && (
                    <div className=" w-full h-[1px] rounded-full bg-gray-500 flex-1"></div>
                  )
                }
              </Fragment>
            )
          })
        }
      </div>
      <div className="text-center">
        <h1 className="text-3xl font-bold">{STEPS[currentStep].name}</h1>
        <p className="text-muted-foreground">{STEPS[currentStep].description}</p>
      </div>
      {
        currentStep === 0
          ? (
            <SelectEpisode onSelectEpisode={(episode) => {
              setChoosenEpisode(episode)
              setCurrentStep(1)
            }} />
          )
          : currentStep === 1 ? (
            <SelectAudioClip episode={choosenEpisode} />
          ) : (
            <VideoEditor />
          )
      }
    </div>
  )
}


type SelectEpisodeProps = {
  onSelectEpisode: (episode: z.infer<typeof Episode>) => void;
}
function SelectEpisode({ onSelectEpisode }: SelectEpisodeProps) {

  const [pageNumber, setPageNumber] = useState(1);
  const [url, setUrl] = useState("");
  const [fetchTrigger, setFetchTrigger] = useState(false);
  const { isLoading, isFetching, isPreviousData, fetchStatus, data } = trpc.getShowEpisodes.useQuery(
    { url, pageNumber },
    {
      keepPreviousData: true,
      enabled: fetchTrigger,
      onSuccess: () => {
        setFetchTrigger(false);
      },
      refetchOnMount: false,
    }
  );
  const { mutateAsync: addEpisodeToAccount, } = trpc.addEpisodeToAccount.useMutation();

  const handleFetchClick = () => {
    try {
      new URL(url); // Validate URL
      setFetchTrigger(true); // Trigger fetch if URL is valid
    } catch (e) {
      console.error("Invalid URL");
    }
  }

  // Function to handle pagination
  const handlePageChange = (newPageNumber: number) => {
    setPageNumber(newPageNumber);
    setFetchTrigger(true); // Trigger fetch on page change
  };


  return (
    <div className="space-y-4 flex flex-col items-center">
      <Card className="my-4 w-full max-w-2xl">
        <CardContent className="space-y-4">
          <form onSubmit={(e) => {
            e.preventDefault();
            handleFetchClick();
          }} className="grid gap-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="rss-url">RSS URL</Label>
              <Input
                id="rss-url"
                type="url"
                placeholder="Enter podcast RSS URL"
                required
                value={url}
                onChange={(e) => { setUrl(e.target.value) }}
              />
            </div>
            <Button type="submit">Load Podcast</Button>
          </form>
        </CardContent>
      </Card>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Episodes</h2>
          {/* <Button variant="outline">Refresh</Button> */}
        </div>
        <div className="">
          {
            isLoading && fetchStatus !== "idle"
              ? (
                <LoaderCircle className=" animate-spin" />
              ) : (
                data && (
                  <div>
                    <div className="grid gap-4">
                      {
                        data.episodes.map((episode, index) => {
                          const date = new Date(episode.publishedAt);
                          const formatter = new Intl.DateTimeFormat('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' });
                          const formattedDate = formatter.format(date);
                          return (
                            (
                              <Card onClick={async () => {
                                const resp = await addEpisodeToAccount(episode);
                                onSelectEpisode(resp.episode);
                              }} key={index} className="cursor-pointer hover:shadow-md border hover:border-blue-300 transition-all">
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between gap-3.5">
                                    <Image className="rounded-md" src={episode.episodeArt} alt={episode.title} width={128} height={128} />
                                    <div className="space-y-3">
                                      <div className="space-y-0.5">
                                        <div className="font-medium">{episode.title}</div>
                                        <p className=" text-slate-700 text-sm line-clamp-2">
                                          {episode.description}
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-4 text-sm">
                                        <span className=" text-slate-700 font-light">{formattedDate}</span>
                                      </div>
                                    </div>
                                    <span className=" font-medium">{secondsToHHMMSS(episode.duration)}</span>
                                  </div>
                                </CardContent>
                              </Card>
                            )
                          )
                        })
                      }
                    </div>
                    <div className="flex justify-between items-center mt-4 mb-8">
                      <div>{(data.currentPage * 10) - 9} - {data.currentPage * 10} of {data.totalItems}</div>
                      <div className="flex justify-center items-center">
                        <Button
                          variant="outline"
                          size={"icon"}
                          onClick={() => {
                            handlePageChange(pageNumber - 1);
                          }}
                          disabled={pageNumber === 1 || isFetching}
                        >
                          <ArrowBigLeft size={20} />
                        </Button>
                        <div className=" w-6 flex justify-center items-center">
                          {
                            isFetching
                              ? (
                                <LoaderCircle className=" animate-spin" />
                              ) : (
                                pageNumber
                              )
                          }
                        </div>
                        <Button
                          variant="outline"
                          size={"icon"}
                          onClick={() => {
                            handlePageChange(pageNumber + 1);
                          }}
                          disabled={pageNumber === data.totalPages || isFetching}
                        >
                          <ArrowBigRight size={20} />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              )
          }
        </div>
      </div>
    </div>
  )
}

type SelectAudioClipProps = {
  episode: z.infer<typeof Episode> | null;
}
const SelectAudioClip = ({ episode: initEpisode }: SelectAudioClipProps) => {

  const [isPlaying, setIsPlaying] = useState(false);
  const [zoom, setZoom] = useState(2.5);
  const [selectionRange, setSelectionRange] = useState<[number, number]>([0, 60]);
  const [seek, setSeek] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { client } = trpc.useUtils();
  const [episode, setEpisode] = useState<z.infer<typeof Episode> | null>(initEpisode);

  const onAudioLoaded = () => {
    if (!audioRef.current) return;
  }

  useEffect(() => {
    if (!episode) return;
    if (episode.audio_status !== "PENDING") return;

    let pending = true;
    (async () => {
      while (pending) {
        const resp = await client.getEpisodeStatus.query(episode.episode_id ?? "");
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
            console.error("Failed to process audio");
            pending = false;
            break;
          }
          case "PENDING": {
            console.log("Processing audio");
            break;
          }
        }
        await wait(2000)
      }
    })()

    return () => {
      pending = false
    }
  }, [client.getEpisodeStatus, episode])

  if (!episode || !episode.s3_audio_key) {
    return null;
  }

  return (
    <div className=" w-full">
      <div className=" mt-4 flex justify-start items-center gap-4">
        <Button onClick={() => {
          setIsPlaying((prev) => !prev);
          if (!audioRef.current) return;
          if (audioRef.current.paused) {
            audioRef.current.play();
            audioRef.current.currentTime = selectionRange[0];
          } else {
            audioRef.current.pause();
          }
        }}>
          {
            isPlaying
              ? <PauseIcon size={20} />
              : <PlayIcon size={20} />
          }
        </Button>
        <Slider
          className="max-w-32"
          value={[zoom]}
          onValueChange={(value) => {
            setZoom(value[0]);
          }}
          min={2.5}
          max={10}
          step={0.1}
        />
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
      <audio onLoadStart={() => {
        console.log("loading")
      }} onWaiting={() => {
        console.log("waiting")
      }} className="hidden" ref={audioRef} onLoadedData={onAudioLoaded} src={episode.s3_audio_key} onTimeUpdate={() => {
        if (!audioRef.current) return;
        setSeek(audioRef.current.currentTime);
        if (audioRef.current.currentTime >= selectionRange[1]) {
          audioRef.current.currentTime = selectionRange[0];
          // setIsPlaying(false);
        }
      }} controls />
    </div>
  )
}
