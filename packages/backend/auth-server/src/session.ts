// session.ts
import { adminAuth } from "./firebase-admin.js";

export async function signInOrCreateUser(email: string) {
  try {
    return await adminAuth.getUserByEmail(email);
  } catch {
    const u = await adminAuth.createUser({ email, emailVerified: true });
    await adminAuth.setCustomUserClaims(u.uid, { role: "User" });
    return u;
  }
}

export function mintCustomToken(uid: string) {
  return adminAuth.createCustomToken(uid);
}
