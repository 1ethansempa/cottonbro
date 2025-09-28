import awsLambdaFastify from "@fastify/aws-lambda";
import type { Handler } from "aws-lambda";
import { buildApp } from "./app";

const app = buildApp();

export const handler: Handler = awsLambdaFastify(app);
