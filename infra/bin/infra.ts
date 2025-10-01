#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { MainStack } from "../lib/main-stack.js";

const app = new cdk.App();
new MainStack(app, "cottonbro-eu-west-1", {
  env: { region: "eu-west-1" },
});
