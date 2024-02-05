import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { createResponse } from "../libs/index.js";
import jwt from "jsonwebtoken";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const getMe = async (event) => {
  const token = event?.headers?.Authorization?.split(" ")[1];
  if (!token) {
    return createResponse(401, { message: "Unauthorized" });
  }
  try {
    const { sub: email } = jwt.verify(token, process.env.JWT_SECRET);

    const { Item: user } = await docClient.send(
      new GetCommand({
        TableName: process.env.AUTH_TABLE,
        Key: { email },
      })
    );
    if (!user) {
      return createResponse(400, { message: "Something went wrong" });
    }
    delete user.password;
    return createResponse(200, user);
  } catch (error) {
    console.log(error);
    return createResponse(500, error);
  }
};
