import { Table } from 'dynamodb-toolbox';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'

const region = "us-east-1";
const endpoint = "https://dynamodb.us-east-1.amazonaws.com";

const marshallOptions = {
  // Specify your client options as usual
  convertEmptyValues: false
}

const translateConfig = { marshallOptions }

const DocumentClient = DynamoDBDocumentClient.from(
  new DynamoDBClient({
    region,
    endpoint
  }),
  translateConfig
)

export const CoreTable = new Table({
  DocumentClient,
  name: process.env.CORE_TABLE_NAME ?? "local-infra-CoreTable ",
  partitionKey: "PK",
  sortKey: "SK",
  indexes: {
    GSI1: { partitionKey: "GSI1PK", sortKey: "GSI1SK" },
  },
});
