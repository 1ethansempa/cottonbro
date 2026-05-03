/**
 * Maps internal / Firebase / backend error codes to user-safe messages.
 *
 * Every string that reaches `setError` in the auth context passes through
 * `toUserMessage` so that raw stack traces, HTML error pages, or internal
 * Firebase SDK messages never leak into the UI.
 *
 * To add a new user-facing message, add a key that matches either:
 *   - a Firebase `err.code`  (e.g. "auth/too-many-requests")
 *   - an `Error.message` you throw yourself (e.g. "email_required")
 *   - a string your backend returns as the response body on a non-2xx
 */

const AUTH_ERROR_MAP: Record<string, string> = {
  /* ── client-side validation ──────────────────────────────── */
  email_required: "Please enter your email address.",
  captcha_required: "Please complete the captcha verification.",
  invalid_otp_payload: "Please enter both your email and verification code.",
  auth_not_initialized: "Authentication is not ready. Please refresh the page.",

  /* ── OTP flow ────────────────────────────────────────────── */
  missing_custom_token: "Sign-in failed. Please request a new code.",
  otp_verify_failed: "Could not verify your code. Please try again.",
  invalid_otp: "That code is incorrect. Please check and try again.",
  otp_expired: "That code has expired. Request a new one.",

  /* ── Google sign-in ──────────────────────────────────────── */
  google_signin_failed: "Google sign-in failed. Please try again.",
  "auth/account-exists-with-different-credential":
    "An account already exists with a different sign-in method. Sign in with email first, then link Google.",
  "auth/popup-closed-by-user": "Sign-in popup was closed. Please try again.",
  "auth/popup-blocked":
    "Sign-in popup was blocked by your browser. Please allow popups and try again.",
  "auth/cancelled-popup-request": "Sign-in was cancelled. Please try again.",

  /* ── Firebase general ────────────────────────────────────── */
  "auth/invalid-credential": "Invalid credentials. Please try again.",
  "auth/user-disabled": "This account has been disabled. Contact support.",
  "auth/too-many-requests":
    "Too many attempts. Please wait a moment and try again.",
  "auth/network-request-failed":
    "Network error. Check your connection and try again.",
  "auth/internal-error": "An internal error occurred. Please try again later.",
  "auth/invalid-custom-token":
    "Sign-in token is invalid. Please request a new code.",
  "auth/custom-token-mismatch":
    "Sign-in token mismatch. Please request a new code.",

  /* ── account status ─────────────────────────────────────── */
  account_deleted:
    "We sent you an email with instructions to restore your account.",
  account_unavailable:
    "We can’t sign in this account right now. Contact support.",

  /* ── session / logout ────────────────────────────────────── */
  logout_failed: "Could not sign you out. Please try again.",
};

/** Fallback when no mapping exists. Intentionally generic. */
const DEFAULT_MESSAGE = "Something went wrong. Please try again.";

/** Maximum length for user-facing error messages. */
const MAX_MESSAGE_LENGTH = 256;

/**
 * Convert an unknown caught value into a user-safe error string.
 *
 * Resolution order:
 *   1. Firebase `err.code`  (e.g. "auth/popup-closed-by-user")
 *   2. `err.message`       (e.g. "email_required", or a backend body string)
 *   3. Fallback
 */
export function toUserMessage(err: unknown): string {
  if (!err) return DEFAULT_MESSAGE;

  const code =
    typeof (err as any)?.code === "string" ? (err as any).code : undefined;
  const message =
    typeof (err as any)?.message === "string" ? (err as any).message : undefined;

  // Try code first (Firebase style), then message (our custom throws)
  const mapped = (code && AUTH_ERROR_MAP[code]) || (message && AUTH_ERROR_MAP[message]);

  if (mapped) return mapped;

  // If neither code nor message matched, return the default.
  // We intentionally do NOT fall through to err.message here — that could
  // be a raw backend response body, an HTML error page, or a stack trace.
  return DEFAULT_MESSAGE;
}

/**
 * Sanitize a raw backend error body before wrapping it in `new Error()`.
 * Caps length and strips anything that looks like HTML.
 */
export function sanitizeBackendError(raw: string): string {
  if (!raw) return DEFAULT_MESSAGE;

  // If it looks like HTML, don't use it
  if (/<[a-z][\s\S]*>/i.test(raw)) {
    return DEFAULT_MESSAGE;
  }

  // Cap length
  const trimmed = raw.trim().slice(0, MAX_MESSAGE_LENGTH);

  try {
    const parsed = JSON.parse(trimmed) as { message?: unknown };
    if (typeof parsed.message === "string") {
      return parsed.message.slice(0, MAX_MESSAGE_LENGTH);
    }
    if (
      Array.isArray(parsed.message) &&
      typeof parsed.message[0] === "string"
    ) {
      return parsed.message[0].slice(0, MAX_MESSAGE_LENGTH);
    }
  } catch {
    // Non-JSON response bodies fall through to the plain text path.
  }

  return trimmed || DEFAULT_MESSAGE;
}
