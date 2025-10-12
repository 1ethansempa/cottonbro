#!/usr/bin/env node
import "dotenv/config";
import * as cdk from "aws-cdk-lib";
import { CottonbroStack } from "../lib/cottonbro-stack.ts";

const toArray = (v?: string) =>
  (v ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

const normalize = (v?: string) => {
  const s = (v ?? "").trim();
  return s && s.toLowerCase() !== "null" && s.toLowerCase() !== "undefined"
    ? s
    : undefined;
};

const app = new cdk.App();

// ---- Read env and push into CDK context ----
const EXISTING_USER_POOL_ID = normalize(process.env.EXISTING_USER_POOL_ID);
const HOSTED_UI_BASE_URL = normalize(process.env.HOSTED_UI_BASE_URL);
const DOMAIN_PREFIX = normalize(process.env.DOMAIN_PREFIX); // optional
const ALLOW_CREATE = (() => {
  const s = (process.env.ALLOW_CREATE ?? "").trim().toLowerCase();
  return s === "1" || s === "true" || s === "yes";
})();

if (EXISTING_USER_POOL_ID) {
  app.node.setContext("existingUserPoolId", EXISTING_USER_POOL_ID);
}
if (HOSTED_UI_BASE_URL) {
  app.node.setContext("existingHostedUiBaseUrl", HOSTED_UI_BASE_URL);
}
if (DOMAIN_PREFIX) {
  app.node.setContext("domainPrefix", DOMAIN_PREFIX);
}
if (ALLOW_CREATE) {
  app.node.setContext("allowCreate", true);
}

const callbacks = toArray(process.env.WEB_CALLBACKS);
if (callbacks.length) app.node.setContext("webCallback", callbacks);

const logouts = toArray(process.env.WEB_LOGOUTS);
if (logouts.length) app.node.setContext("webLogout", logouts);

// Visibility: what CDK will use
// eslint-disable-next-line no-console
console.log("BIN_CTX =>", {
  EXISTING_USER_POOL_ID,
  HOSTED_UI_BASE_URL,
  DOMAIN_PREFIX,
  ALLOW_CREATE,
  callbacks,
  logouts,
});

new CottonbroStack(app, "cottonbro-auth-eu-west-1", {
  env: { region: "eu-west-1" },
});
