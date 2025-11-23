import {
  initializeApp,
  cert,
  applicationDefault,
  getApps,
  type AppOptions,
  type ServiceAccount,
} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync, existsSync } from "node:fs";
import { resolve, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

let envLoaded = false;
const moduleDir = fileURLToPath(new URL(".", import.meta.url));
const repoRoot = resolve(moduleDir, "../../..");

function ensureEnvLoaded() {
  if (envLoaded) return;
  envLoaded = true;
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
    console.log(`[auth-env] Loaded ${relativePath}`);
  }
}

ensureEnvLoaded();

function loadServiceAccount(): ServiceAccount | undefined {
  console.log("[auth-server] Loading Firebase service account credentials…");
  console.log("[auth-server] Credential env hints:", {
    FIREBASE_ADMIN_JSON: process.env.FIREBASE_ADMIN_JSON ? "present" : "missing",
    FIREBASE_ADMIN_JSON_FILE: process.env.FIREBASE_ADMIN_JSON_FILE,
    GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  });
  const inline = process.env.FIREBASE_ADMIN_JSON?.trim();
  if (inline) {
    try {
      console.log("[auth-server] Using FIREBASE_ADMIN_JSON inline payload");
      return JSON.parse(inline);
    } catch (err) {
      console.error("[auth-server] Failed to parse FIREBASE_ADMIN_JSON:", err);
    }
  }

  const filePath =
    process.env.FIREBASE_ADMIN_JSON_FILE ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (filePath) {
    const resolvedPath = isAbsolute(filePath)
      ? filePath
      : resolve(repoRoot, filePath);
    try {
      console.log("[auth-server] Reading service account file:", resolvedPath);
      const raw = readFileSync(resolvedPath, "utf8");
      return JSON.parse(raw);
    } catch (err) {
      console.error(
        `[auth-server] Failed to read credentials from ${resolvedPath}:`,
        err
      );
    }
  }

  console.warn("[auth-server] No service account credentials present.");
  return undefined;
}

if (!getApps().length) {
  console.log("[auth-server] Firebase Admin not initialized. Bootstrapping…");
  const serviceAccount = loadServiceAccount();
  const cred = serviceAccount ? cert(serviceAccount) : applicationDefault();
  if (!serviceAccount) {
    console.warn(
      "[auth-server] Falling back to applicationDefault credentials (ADC/GCP)"
    );
  }

  let projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    process.env.GOOGLE_CLOUD_PROJECT ||
    process.env.GCLOUD_PROJECT ||
    (process.env.IS_LOCAL_DEV ? "cottonbro-dev" : undefined);

  console.log("[auth-server] Project ID env candidates:", {
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    GOOGLE_CLOUD_PROJECT: process.env.GOOGLE_CLOUD_PROJECT,
    GCLOUD_PROJECT: process.env.GCLOUD_PROJECT,
    IS_LOCAL_DEV: process.env.IS_LOCAL_DEV,
  });

  if (!projectId && serviceAccount) {
    projectId =
      (serviceAccount as any).project_id ||
      serviceAccount.projectId ||
      undefined;
    console.log(
      "[auth-server] Project ID derived from service account:",
      projectId
    );
  }

  const options: AppOptions = { credential: cred };
  if (projectId) {
    options.projectId = projectId;
    console.log("[auth-server] Initializing Firebase with project:", projectId);
  } else {
    console.warn(
      "[auth-server] No project id found. Set FIREBASE_PROJECT_ID to avoid runtime errors."
    );
  }

  initializeApp(options);
  console.log("[auth-server] Firebase Admin initialized successfully");
} else {
  console.log("[auth-server] Reusing existing Firebase Admin app instance");
}

export const adminAuth = getAuth();
export const db = getFirestore();
