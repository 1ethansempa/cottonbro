import { config } from "dotenv";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const moduleDir = fileURLToPath(new URL(".", import.meta.url));
const repoRoot = resolve(moduleDir, "../../..");

const rawTarget =
  process.env.API_ENV ??
  process.env.APP_ENV ??
  process.env.RUNTIME_ENV ??
  process.env.ENV_TARGET ??
  process.env.NODE_ENV ??
  "qa";

const normalized = rawTarget.toLowerCase();
const envFlavor =
  normalized === "prod" || normalized === "production" ? "prod" : "qa";

const baseFiles = [
  ".env",
  ".env.local",
  "apps/api/.env",
  "apps/api/.env.local",
];

const flavorFiles = [
  `.env.${envFlavor}`,
  `.env.${envFlavor}.local`,
  `apps/api/.env.${envFlavor}`,
  `apps/api/.env.${envFlavor}.local`,
];

for (const relativePath of [...baseFiles, ...flavorFiles]) {
  const fullPath = resolve(repoRoot, relativePath);
  if (!existsSync(fullPath)) continue;
  config({ path: fullPath, override: true });
  console.log(`[api-env] Loaded ${relativePath}`);
}
