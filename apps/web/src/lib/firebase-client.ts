import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { publicEnv } from "@/config/env";

const config = {
  apiKey: publicEnv.FIREBASE_API_KEY,
  authDomain: publicEnv.FIREBASE_AUTH_DOMAIN,
  projectId: publicEnv.FIREBASE_PROJECT_ID,
};

export const clientApp = getApps()[0] ?? initializeApp(config);
export const clientAuth = getAuth(clientApp);
