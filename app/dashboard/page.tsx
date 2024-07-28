"use client";

import { SelectAudioClip } from "@/components/app/podcast/SelectAudioClip";
import { SelectEpisode } from "@/components/app/podcast/SelectEpisode";
import VideoEditor from "@/components/app/video/VideoEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiRangeSlider } from "@/components/ui/MultiRangeSlider";
import { Slider } from "@/components/ui/slider";
import { cn, secondsToHHMMSS, secondsToHHMMSSWithoutZeroPadding, wait } from "@/lib/utils";
import { Episode, Video } from "@/server";
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

  const [currentStep, setCurrentStep] = useState(0);
  const [choosenEpisode, setChoosenEpisode] = useState<z.infer<typeof Episode> | null>(null);
  const [video, setVideo] = useState<z.infer<typeof Video> | null>(null);

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
        {/* <h1 className="text-3xl font-bold">{STEPS[currentStep].name}</h1> */}
        <p className="text-lg font-medium my-3">{STEPS[currentStep].description}</p>
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
            <SelectAudioClip
              episode={choosenEpisode}
              onContinue={(resp) => {
                setVideo(resp)
                setCurrentStep(2)
              }}
            />
          ) : (
            <VideoEditor video={video} />
          )
      }
    </div>
  )
}
