import { createHmac } from "node:crypto"
import { z } from "zod";
import { LambdaClient, InvokeCommand, InvocationType } from "@aws-sdk/client-lambda"; // ES Modules import
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { protectedProcedure, createTRPCRouter } from "./trpc";
import { getPodcastEpisodes } from "./utils";
import { EpisodeEntity } from "@/db/entities/EpisodeEntity";

const s3Client = new S3Client();
const lambdaClient = new LambdaClient();

interface User {
  id: string;
  name?: string | null | undefined;
  email?: string | null | undefined;
  image?: string | null | undefined;
}

export const Episode = z.object({
  episode_id: z.string().optional(),
  title: z.string(),
  description: z.string(),
  rss_audio_url: z.string().url(),
  s3_audio_key: z.string().url().optional(),
  audio_status: z.enum(["PENDING", "READY", "ERROR"]).optional().default("PENDING"),
  publishedAt: z.string(),
  duration: z.number(),
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
  addEpisodeToAccount: protectedProcedure.input(Episode).mutation(async (opts) => {

    const username = (opts.ctx.session.user as User).id;
    const { input: episode } = opts;
    const episodeId = createHmac('sha256', process.env.NEXTAUTH_SECRET ?? "")
      .update(episode.rss_audio_url)
      .digest('hex');

    let existingEpisodes = await EpisodeEntity.query(`EPISODE#${episodeId}`, {
      beginsWith: "USERNAME#",
      index: "reverseIndex",
      limit: 1,
    });

    if (existingEpisodes.Items && existingEpisodes.Items.length > 0) {

      const existingEpisode = existingEpisodes.Items[0];
      if (existingEpisode.audio_status === "READY") {

        await EpisodeEntity.put({
          username,
          episode_id: episodeId,
          rss_audio_url: existingEpisode.rss_audio_url,
          s3_audio_key: existingEpisode.s3_audio_key,
          description: existingEpisode.description,
          duration: existingEpisode.duration,
          episodeArt: existingEpisode.episodeArt,
          publishedAt: existingEpisode.publishedAt,
          title: existingEpisode.title,
          audio_status: "READY"
        });

        const newEpisode = Episode.parse({
          title: existingEpisode.title,
          description: existingEpisode.description,
          rss_audio_url: existingEpisode.rss_audio_url,
          publishedAt: existingEpisode.publishedAt,
          duration: existingEpisode.duration,
          episodeArt: existingEpisode.episodeArt
        })

        return {
          isImporting: false,
          episode: {
            episode_id: episodeId,
            ...newEpisode,
          }
        }
      }
    }

    await EpisodeEntity.put({
      title: episode.title,
      description: episode.description,
      episodeArt: episode.episodeArt,
      publishedAt: episode.publishedAt,
      duration: episode.duration,
      audio_status: "PENDING",
      username,
      rss_audio_url: episode.rss_audio_url,
      episode_id: episodeId,
    });

    const command = new InvokeCommand({
      FunctionName: process.env.EPISODE_IMPORT_FUNCTION_NAME ?? "",
      Payload: JSON.stringify({ episode, episodeId, username }),
      InvocationType: InvocationType.Event
    });
    await lambdaClient.send(command);
    return {
      isImporting: true,
      episode: {
        episode_id: episodeId,
        ...episode
      }
    };
  }),
  getEpisodeStatus: protectedProcedure.input(z.string()).query(async (opts) => {
    const { input: episodeId } = opts;
    const episode = (await EpisodeEntity.get({
      PK: `USERNAME#${(opts.ctx.session.user as User).id}`,
      SK: `EPISODE#${episodeId}`
    })).Item;

    if (episode?.s3_audio_key) {
      // get presigned URL with 12 hour expiration
      const command = new GetObjectCommand({
        Bucket: process.env.BUCKET_NAME ?? "",
        Key: episode.s3_audio_key,
      });

      const presigned = await getSignedUrl(s3Client, command, {
        signableHeaders: new Set(["content-type"]),
        expiresIn: 12 * 60 * 60,
      });

      episode.s3_audio_key = presigned;
    }

    return episode;
  })
});

export type AppRouter = typeof appRouter;
