// otp.ts
import { db } from "./firebase-admin.js";
import crypto from "node:crypto";

const OTP_TTL_MS = Number(process.env.OTP_TTL_MS ?? 5 * 60 * 1000); // 5 min
const OTP_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS ?? 5);

function hash(code: string) {
  return crypto.createHash("sha256").update(code).digest("hex");
}

function otpDoc(email: string) {
  // Use a stable doc id (lowercase email) to avoid duplicates
  return db.collection("auth_otp").doc(email.toLowerCase());
}

/** Generate a 6-digit code, store hash + TTL + attempts, return the code (for mailer). */
export async function startOtp(email: string): Promise<string> {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const h = hash(code);
  const now = Date.now();

  await otpDoc(email).set(
    {
      hash: h,
      expiresAt: now + OTP_TTL_MS,
      attemptsLeft: OTP_ATTEMPTS,
      createdAt: now,
    },
    { merge: true }
  );

  return code; // send via SES/Mailgun/etc
}

/** Verify an OTP; on success deletes the record. Throws on invalid/expired/exhausted. */
export async function verifyOtp(email: string, code: string): Promise<void> {
  const ref = otpDoc(email);
  const snap = await ref.get();
  if (!snap.exists) throw new Error("otp_not_found");

  const data = snap.data() as {
    hash: string;
    expiresAt: number;
    attemptsLeft: number;
  };

  const now = Date.now();

  if (now > data.expiresAt) {
    await ref.delete().catch(() => {});
    throw new Error("otp_expired");
  }

  if (data.attemptsLeft <= 0) {
    await ref.delete().catch(() => {});
    throw new Error("otp_attempts_exhausted");
  }

  const ok = data.hash === hash(code);
  if (!ok) {
    await ref.update({
      attemptsLeft: Math.max(0, (data.attemptsLeft ?? 0) - 1),
    });
    throw new Error("otp_invalid");
  }

  await ref.delete().catch(() => {});
}
