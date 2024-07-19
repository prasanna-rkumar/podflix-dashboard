import { Entity } from "dynamodb-toolbox";
import { CoreTable } from "../table";

export const UserEntity = new Entity({
  table: CoreTable,
  name: "User",
  attributes: {
    PK: { partitionKey: true, default: (data: any) => `USERNAME#${data.username}` },
    SK: { sortKey: true, default: (data: any) => `USERNAME#${data.username}` },
    username: { type: "string", required: true },
    usage: { type: "map", required: false },
    created_at: { type: "string", required: true, default: () => new Date().toISOString() },
    updated_at: { type: "string", required: true, default: () => new Date().toISOString(), onUpdate: true },
  }
})