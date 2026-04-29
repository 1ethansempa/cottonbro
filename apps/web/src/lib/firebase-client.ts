import { getApp, getApps, initializeApp } from "firebase/app";
import {
  type Auth,
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { getOptionalFirebasePublicEnv } from "@/config/env";

let cachedAuth: Auth | null = null;
let persistenceConfigured = false;

export function getClientAuth() {
  if (cachedAuth) {
    return cachedAuth;
  }

  const firebaseConfig = getOptionalFirebasePublicEnv();
  if (!firebaseConfig) {
    return null;
  }

  const clientApp =
    getApps()[0] ??
    initializeApp({
      ...firebaseConfig,
    });

  cachedAuth = getAuth(clientApp ?? getApp());

  if (!persistenceConfigured && typeof window !== "undefined") {
    persistenceConfigured = true;
    setPersistence(cachedAuth, browserLocalPersistence).catch(() => {});
  }

  return cachedAuth;
}
