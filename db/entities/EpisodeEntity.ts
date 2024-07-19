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
    audioUrl: { type: "string", required: true },
    publishedAt: { type: "string", required: true },
    duration: { type: "string", required: true },
    episodeArt: { type: "string", required: true },
    created_at: { type: "string", required: true, default: () => new Date().toISOString() },
    updated_at: { type: "string", required: true, default: () => new Date().toISOString(), onUpdate: true },
  }
})