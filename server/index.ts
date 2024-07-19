import { z } from "zod";
import { LambdaClient, InvokeCommand, InvocationType } from "@aws-sdk/client-lambda"; // ES Modules import

import { protectedProcedure, createTRPCRouter } from "./trpc";
import { getPodcastEpisodes } from "./utils";
import { EpisodeEntity } from "@/db/entities/EpisodeEntity";

import { nanoid } from "nanoid"

const lambdaClient = new LambdaClient();

interface User {
  id: string;
  name?: string | null | undefined;
  email?: string | null | undefined;
  image?: string | null | undefined;
}

export const Episode = z.object({
  title: z.string(),
  description: z.string(),
  audioUrl: z.string().url(),
  publishedAt: z.string(),
  duration: z.string(),
  episodeArt: z.string().url(),
})

export const appRouter = createTRPCRouter({
  getShowEpisodes: protectedProcedure.input(z.object({
    url: z.string().url(),
    pageNumber: z.number()
  })).query(async (opts) => {
    const { input } = opts;
    try {
      const episodes = await getPodcastEpisodes(input.url, input.pageNumber);
      return episodes;
    } catch (e) {
      throw e;
    }
  }),
  addEpisodeToAccount: protectedProcedure.use(({ ctx, next }) => {
    const username = (ctx.session.user as User).id;
    if (!username) {
      throw new Error("No session found");
    }
    return next();
  }).input(Episode).mutation(async (opts) => {
    const { input: episode } = opts;
    // download the audio file to S3 and cache the URL in cache table
    const item = {
      ...episode,
      username: (opts.ctx.session.user as User).id,
      episode_id: nanoid(10),
    }
    console.log(EpisodeEntity)
    await EpisodeEntity.put(item);
    const command = new InvokeCommand({
      FunctionName: process.env.EPISODE_IMPORT_FUNCTION_NAME ?? "",
      Payload: JSON.stringify({ episode }),
      InvocationType: InvocationType.Event
    });
    await lambdaClient.send(command);
    return episode;
  })
});

export type AppRouter = typeof appRouter;
