import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { createResponse } from "../libs/index.js";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken'


const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const login = async (event) => {
  const { email, password } = JSON.parse(event.body);
  try {
    const { Item: user } = await docClient.send(
      new GetCommand({
        TableName: process.env.AUTH_TABLE,
        Key: { email },
      })
    );
    if (!user) {
      return createResponse(401, { message: "Invalid email or password" });
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        return createResponse(401, { message: "Invalid email or password" });
    }
    delete user.password;
    const token = generateToken(email);
    return createResponse(200, {token, userData: user});
  } catch (error) {
    console.log(error);
    return createResponse(500, error);
  }
};


const generateToken = (email) => {
    const data ={sub: email}
    const secret = process.env.JWT_SECRET
    return jwt.sign(data, secret)
};
