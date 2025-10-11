import "reflect-metadata";
import type { Handler } from "aws-lambda";
import serverlessExpress from "@vendia/serverless-express";
import { bootstrapNestApp } from "./main";

let inner: ReturnType<typeof serverlessExpress> | undefined;

export const lambdaHandler: Handler = async (event, context, callback) => {
  if (!inner) {
    const app = await bootstrapNestApp();
    inner = serverlessExpress({ app: app.getHttpAdapter().getInstance() });
  }
  return inner(event, context, callback);
};
