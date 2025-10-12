#!/usr/bin/env node
import "dotenv/config";
import * as cdk from "aws-cdk-lib";
import { CottonbroStack } from "../lib/cottonbro-stack.ts";

const toArray = (v?: string) =>
  (v ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

const app = new cdk.App();

if (process.env.EXISTING_USER_POOL_ID)
  app.node.setContext("existingUserPoolId", process.env.EXISTING_USER_POOL_ID);

if (process.env.HOSTED_UI_BASE_URL)
  app.node.setContext(
    "existingHostedUiBaseUrl",
    process.env.HOSTED_UI_BASE_URL
  );

const callbacks = toArray(process.env.WEB_CALLBACKS);
if (callbacks.length) app.node.setContext("webCallback", callbacks);

const logouts = toArray(process.env.WEB_LOGOUTS);
if (logouts.length) app.node.setContext("webLogout", logouts);

new CottonbroStack(app, "cottonbro-auth-eu-west-1", {
  env: { region: "eu-west-1" },
});
