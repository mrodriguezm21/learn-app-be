import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { createResponse } from "../libs/index.js";
import jwt from "jsonwebtoken";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const deleteMe = async (event) => {
    const token = event?.headers?.Authorization?.split(" ")[1];
    if (!token) {
        return createResponse(401, { message: "Unauthorized" });
    }
    try {
        const { sub: email } = jwt.verify(token, process.env.JWT_SECRET);
    
        await docClient.send(
        new DeleteCommand({
            TableName: process.env.AUTH_TABLE,
            Key: { email },
        })
        );
        return createResponse(204, { message: "User deleted" });
    } catch (error) {
        console.log(error);
        return createResponse(500, error);
    }
};