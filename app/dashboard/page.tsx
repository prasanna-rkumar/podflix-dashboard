"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn, secondsToHHMMSS, wait } from "@/lib/utils";
import { Episode } from "@/server";
import { trpc } from "@/trpc/client";
import { ArrowBigLeft, ArrowBigRight, LoaderCircle } from "lucide-react";
import Image from "next/image";
import { Fragment, useEffect, useState } from "react";
import { z } from "zod";

const STEPS = [
  { name: "Select Episode", description: "Choose an episode from your podcast show" },
  { name: "Select audio clip", description: "Select the audio clip you want to use for the video" },
  { name: "Create video", description: "Generate a video using the selected episode and audio clip" }
];

export default function DashboardPage() {

  const [currentStep, setCurrentStep] = useState(0);
  const [choosenEpisode, setChoosenEpisode] = useState<z.infer<typeof Episode> | null>(null);

  return (
    <div className="w-full max-w-4xl mx-auto py-12 px-4 md:px-6">
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
          : (
            <SelectAudioClip episode={choosenEpisode} />
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

  console.log({ isFetching, isLoading, isPreviousData })

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
                                console.log(episode)
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

  const { client } = trpc.useUtils();
  const [episode, setEpisode] = useState<z.infer<typeof Episode> | null>(initEpisode);

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
            console.log("Audio Ready!!", resp);
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

  if (!episode) {
    return null;
  }

  if (episode.s3_audio_key) {
    return (
      <div>
        <audio src={episode.s3_audio_key} controls />
      </div>
    )
  }

  return (
    <div>
      waveform
    </div>
  )
}
