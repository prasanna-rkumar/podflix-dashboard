import { Entity } from "dynamodb-toolbox";
import { CoreTable } from "../table";

export const EpisodeEntity = new Entity({
  table: CoreTable,
  name: "Episode",
  attributes: {
    PK: { partitionKey: true, default: (data: any) => `USERNAME#${data.username}` },
    SK: { sortKey: true, default: (data: any) => `EPISODE#${data.episode_id}` },
    username: { type: "string", required: true },
    episode_id: { type: "string", required: true },
    title: { type: "string", required: true },
    description: { type: "string", required: true },
    rss_audio_url: { type: "string", required: true },
    s3_audio_key: { type: "string" },

    audio_status: { type: "string", required: true, default: "PENDING" },
    publishedAt: { type: "string", required: true },
    duration: { type: "number", required: true },
    episodeArt: { type: "string", required: true },
    created_at: { type: "string", required: true, default: () => new Date().toISOString() },
    updated_at: { type: "string", required: true, default: () => new Date().toISOString(), onUpdate: true },
  }
})