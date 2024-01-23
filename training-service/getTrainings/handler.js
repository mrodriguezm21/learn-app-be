import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { createResponse } from "../libs/index.js";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const getTrainings = async () => {
  try {
    const trainings = new ScanCommand({
      ProjectionExpression:
        "id, studentId, trainerId, #n4me, #typ3, #d4te, #dur4tion, description",
      ExpressionAttributeNames: {
        "#n4me": "name",
        "#typ3": "type",
        "#d4te": "date",
        "#dur4tion": "duration",
      },
      TableName: process.env.TRAINING_TABLE,
    });
    const result = await docClient.send(trainings);
    return createResponse(200, result.Items);
  } catch (error) {
    console.log(error);
    return createResponse(500, error);
  }
};
