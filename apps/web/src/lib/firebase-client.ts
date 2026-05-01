import { getApps, initializeApp } from "firebase/app";
import {
  type Auth,
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";

let cachedAuth: Auth | null = null;
let persistenceConfigured = false;

function getFirebaseConfig() {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim();
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim();
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim();

  if (!apiKey || !authDomain || !projectId) {
    return null;
  }

  return {
    apiKey,
    authDomain,
    projectId,
    ...(appId ? { appId } : {}),
  };
}

export function getClientAuth() {
  if (cachedAuth) {
    return cachedAuth;
  }

  const firebaseConfig = getFirebaseConfig();
  if (!firebaseConfig) {
    return null;
  }

  const clientApp =
    getApps()[0] ??
    initializeApp({
      ...firebaseConfig,
    });

  cachedAuth = getAuth(clientApp);

  if (!persistenceConfigured && typeof window !== "undefined") {
    persistenceConfigured = true;
    setPersistence(cachedAuth, browserLocalPersistence).catch((err) => {
      if (process.env.NODE_ENV !== "production") {
        console.warn("Failed to configure Firebase auth persistence", err);
      }
    });
  }

  return cachedAuth;
}
