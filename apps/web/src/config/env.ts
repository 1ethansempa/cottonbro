// TODO: replace with the stricter zod-based loader later if you want.
export const APP_ENV = (process.env.APP_ENV as "qa" | "prod") ?? "qa";

export const publicEnv = {
  FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  EMAIL_LINK_CONTINUE_URL: process.env.NEXT_PUBLIC_EMAIL_LINK_CONTINUE_URL!, // e.g. https://qa.cottonbro.app/auth/finish
};
