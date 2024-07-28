import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { secondsToHHMMSS } from "@/lib/utils";
import { Episode } from "@/server";
import { trpc } from "@/trpc/client";
import { ArrowBigLeft, ArrowBigRight, LoaderCircle } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { z } from "zod";

type SelectEpisodeProps = {
  onSelectEpisode: (episode: z.infer<typeof Episode>) => void;
}
export const SelectEpisode = ({ onSelectEpisode }: SelectEpisodeProps) => {

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
  const { mutateAsync: addEpisodeToAccount } = trpc.addEpisodeToAccount.useMutation();

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
        {
          isLoading && fetchStatus !== "idle"
            ? (
              <LoaderCircle className=" animate-spin" />
            ) : (
              data && (
                <>
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Episodes</h2>
                    {/* <Button variant="outline">Refresh</Button> */}
                  </div>
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
                              console.log(resp);
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
                </>
              )
            )
        }
      </div>
    </div>
  )
}