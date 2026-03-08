import {
  initializeApp,
  cert,
  getApps,
  type AppOptions,
  type ServiceAccount,
} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function loadServiceAccount(): ServiceAccount | undefined {
  const inline = process.env.FIREBASE_ADMIN_JSON?.trim();
  if (!inline) {
    return undefined;
  }

  try {
    return JSON.parse(inline);
  } catch (err) {
    console.error("[auth-server] Failed to parse FIREBASE_ADMIN_JSON:", err);
    throw new Error("Invalid FIREBASE_ADMIN_JSON: expected valid JSON");
  }
}

if (!getApps().length) {
  const serviceAccount = loadServiceAccount();
  if (!serviceAccount) {
    throw new Error(
      "Missing FIREBASE_ADMIN_JSON for Firebase Admin initialization"
    );
  }

  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  if (!projectId) {
    throw new Error(
      "Missing FIREBASE_PROJECT_ID for Firebase Admin initialization"
    );
  }

  const options: AppOptions = {
    credential: cert(serviceAccount),
    projectId,
  };

  initializeApp(options);
}

export const adminAuth = getAuth();
export const db = getFirestore();
