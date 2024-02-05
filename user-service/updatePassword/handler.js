import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { createResponse } from "../libs/index.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";


const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const updatePassword = async (event) => {
    const token = event?.headers?.Authorization?.split(" ")[1];
    if (!token) {
        return createResponse(401, { message: "Unauthorized" });
    }
    try {
        const { sub: email } = jwt.verify(token, process.env.JWT_SECRET);
        const { password } = JSON.parse(event.body);
        const hashedPassword = await bcrypt.hash(password, 10);
        await docClient.send(
        new UpdateCommand({
            TableName: process.env.AUTH_TABLE,
            Key: { email },
            UpdateExpression: "set password = :password",
            ExpressionAttributeValues: {
                ":password": hashedPassword,
            },
        })
        );
        return createResponse(200, { message: "Password updated" });
    } catch (error) {
        console.log(error);
        return createResponse(500, error);
    }
};