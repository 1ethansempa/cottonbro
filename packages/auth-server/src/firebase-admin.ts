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
import { readFileSync } from "node:fs";

function loadServiceAccount(): ServiceAccount | undefined {
  console.log("[auth-server] Loading Firebase service account credentials…");
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
    try {
      console.log("[auth-server] Reading service account file:", filePath);
      const raw = readFileSync(filePath, "utf8");
      return JSON.parse(raw);
    } catch (err) {
      console.error(
        `[auth-server] Failed to read credentials from ${filePath}:`,
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
