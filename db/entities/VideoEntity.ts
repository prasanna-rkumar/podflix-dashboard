import { Entity } from "dynamodb-toolbox";
import { CoreTable } from "../table";

export const VideoEntity = new Entity({
  table: CoreTable,
  name: "Video",
  attributes: {
    PK: { partitionKey: true, default: (data: any) => `USERNAME#${data.username}` },
    SK: { sortKey: true, default: (data: any) => `VIDEO#${data.video_id}` },
    username: { type: "string", required: true },
    video_id: { type: "string", required: true },
    title: { type: "string", required: true },
    captions: { type: "list", required: true },
    episodeArt: { type: "string", required: true },
    audio_clip_url: { type: "string", required: false },

    descriptions: { type: "list", required: false },
    audio_status: { type: "string", required: true, default: "PENDING" },
    video_status: { type: "string", required: true, default: "PENDING" },
    duration: { type: "number", required: true },
    created_at: { type: "string", required: true, default: () => new Date().toISOString() },
    updated_at: { type: "string", required: true, default: () => new Date().toISOString(), onUpdate: true },
  }
})