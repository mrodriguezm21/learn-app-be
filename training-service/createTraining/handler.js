import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { createResponse } from "../libs/index.js";
import { v4 as uuidv4 } from "uuid";
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const createTraining = async (event) => {
  const { studentId, trainerId, name, type, date, duration, description } =
    JSON.parse(event.body);
  const training = {
    id: uuidv4(),
    studentId,
    trainerId,
    name,
    type,
    date,
    duration,
    description,
  };
  try {
    await docClient.send(
      new PutCommand({
        TableName: process.env.TRAINING_TABLE,
        Item: training,
      })
    );
    return createResponse(201, training);
  } catch (error) {
    console.log(error);
    return createResponse(500, error);
  }
};
