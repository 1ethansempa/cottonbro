import { z } from "zod";

export const APP_ENV = (process.env.APP_ENV as "qa" | "prod") ?? "qa";

const nonEmptyEnvString = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().min(1),
);

const firebasePublicSchema = z.object({
  apiKey: nonEmptyEnvString,
  authDomain: nonEmptyEnvString,
  projectId: nonEmptyEnvString,
  appId: nonEmptyEnvString.optional(),
  messagingSenderId: nonEmptyEnvString.optional(),
  storageBucket: nonEmptyEnvString.optional(),
});

export function getFirebasePublicEnv() {
  return firebasePublicSchema.parse({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

export function getOptionalFirebasePublicEnv() {
  const result = firebasePublicSchema.safeParse({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });

  return result.success ? result.data : null;
}

export function getPublicApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL;
}
