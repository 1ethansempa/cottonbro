import { getApp, getApps, initializeApp } from "firebase/app";
import {
  type Auth,
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { getFirebasePublicEnv } from "@/config/env";

let cachedAuth: Auth | null = null;
let persistenceConfigured = false;

export function getClientAuth() {
  if (cachedAuth) {
    return cachedAuth;
  }

  const clientApp =
    getApps()[0] ??
    initializeApp({
      ...getFirebasePublicEnv(),
    });

  cachedAuth = getAuth(clientApp ?? getApp());

  if (!persistenceConfigured && typeof window !== "undefined") {
    persistenceConfigured = true;
    setPersistence(cachedAuth, browserLocalPersistence).catch(() => {});
  }

  return cachedAuth;
}
