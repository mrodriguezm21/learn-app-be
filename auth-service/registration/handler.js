import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { createResponse } from "../libs/index.js";
import { generateFromEmail } from "unique-username-generator";
import bcrypt from "bcryptjs";
import passwordGenerator from "generate-password";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const register = async (event) => {
  const {
    email,
    firstName,
    lastName,
    specialization,
    dateOfBirth,
    address,
    role = "student",
  } = JSON.parse(event.body);
  const generatedPassword = passwordGenerator.generate({
    length: 10,
    numbers: true,
  });
  const password = await bcrypt.hash(generatedPassword, 10);
  const username = generateFromEmail(email, 2);
  const user = {
    email,
    password,
    username,
    firstName,
    lastName,
    specialization,
    dateOfBirth,
    address,
    role,
  };
  try {
    const { Item: userExist } = await docClient.send(
      new GetCommand({
        TableName: process.env.AUTH_TABLE,
        Key: { email },
      })
    );
    if (userExist) {
      return createResponse(409, { message: "Email is taken" });
    }
    await docClient.send(
      new PutCommand({
        TableName: process.env.AUTH_TABLE,
        Item: user,
      })
    );
    return createResponse(201, { ...user, password: generatedPassword });
  } catch (error) {
    console.log(error);
    return createResponse(500, error);
  }
};
