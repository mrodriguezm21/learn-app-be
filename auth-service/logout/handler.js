import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { createResponse } from "../libs/index.js";
import jwt from "jsonwebtoken";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const logout = async (event) => {
  const token = event?.headers?.Authorization?.split(" ")[1];
  if (!token) {
    return createResponse(401, { message: "Unauthorized" });
  }
  const { sub: email } = jwt.verify(token, process.env.JWT_SECRET);
  if (!email) {
    return createResponse(401, { message: "Unauthorized" });
  }
  try {
    await docClient.send(
      new UpdateCommand({
        TableName: process.env.AUTH_TABLE,
        Key: { email },
        UpdateExpression: "set isActive = :isActive",
        ExpressionAttributeValues: {
          ":isActive": false,
        },
      })
    );
    return createResponse(200, { message: "Logout successful" });
  } catch (error) {
    console.log(error);
    return createResponse(500, error);
  }
};
