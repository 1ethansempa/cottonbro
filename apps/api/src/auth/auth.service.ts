import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
  ForbiddenException,
  Inject,
  Optional,
} from "@nestjs/common";
import type { Response } from "express";
import crypto from "node:crypto";
import {
  adminAuth,
  startOtp,
  verifyOtp,
  signInOrCreateUser,
  mintCustomToken,
} from "@cottonbro/auth-server";
import { normalizeEmail } from "@cottonbro/utils";
import { MailService } from "../common/mail/mail.service.js";
import type {
  AppUser,
  UsersRepositoryPort,
  UserStatus,
} from "./users.repository.js";

// Firebase owns identity; our local users table owns account access.
// Every token/session creation path must check local account status first.
const SESSION_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 days
const DELETED_ACCOUNT_RESTORE_WINDOW_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
export const USERS_REPOSITORY = Symbol("USERS_REPOSITORY");

// Deleted accounts are handled separately because they can self-restore by email.
const BLOCKED_STATUSES = new Set<UserStatus>(["suspended", "banned"]);

/**
 * Derive the cookie domain from WEB_BASE_URL so the session cookie is
 * scoped to the root domain (e.g. `.cottonbro.com`). Falls back to
 * `undefined` (exact-host scoping) when the env var is absent.
 */
function parseCookieDomain(): string | undefined {
  const raw = process.env.WEB_BASE_URL?.trim();
  if (!raw) return undefined;
  try {
    const hostname = new URL(raw).hostname;
    // If it's localhost or an IP, don't set a domain — let the browser scope to the exact host.
    if (hostname === "localhost" || /^\d+\./.test(hostname)) return undefined;
    // Prefix with a dot so the cookie is shared across subdomains.
    return hostname.startsWith(".") ? hostname : `.${hostname}`;
  } catch {
    return undefined;
  }
}

const COOKIE_DOMAIN = parseCookieDomain();

type TurnstileVerifyResponse = {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  "error-codes"?: string[];
  action?: string;
  cdata?: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly mail: MailService,
    @Optional()
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository?: UsersRepositoryPort,
  ) {}

  /**
   * Starts an OTP authentication flow.
   *
   * Validates the captcha, normalizes the email, and generates a one-time
   * password that is sent to the user via email. Silently no-ops for
   * blocked (suspended/banned) accounts to avoid leaking account status.
   * For soft-deleted accounts, sends a reinstatement email instead.
   *
   * @param email    - The user's email address.
   * @param captchaToken - Cloudflare Turnstile captcha response token.
   * @param remoteIp - Optional client IP forwarded for captcha verification.
   * @throws {BadRequestException} If the email is missing or captcha fails.
   */
  async startOtp(email: string, captchaToken: string, remoteIp?: string) {
    if (!email) throw new BadRequestException("Email is required");
    const normalizedEmail = normalizeEmail(email);
    await this.verifyCaptcha(captchaToken, remoteIp);

    const user = await this.usersRepository?.findByEmail(normalizedEmail);
    if (user?.status === "deleted") {
      // Deleted users get the recovery path instead of a sign-in OTP.
      await this.sendAccountReinstatementEmail(user);
      return;
    }

    if (user && BLOCKED_STATUSES.has(user.status)) {
      // Keep this silent so callers cannot probe whether an account exists
      // or whether it is banned/suspended.
      return;
    }

    const code = await startOtp(normalizedEmail);
    await this.mail.sendOtpEmail(normalizedEmail, code);
  }

  /**
   * Verifies the OTP code and mints a Firebase Custom Token.
   *
   * On success the user record is synced (upserted) into the local
   * database and a short-lived Firebase custom token is returned so the
   * client can exchange it for a full ID token via `signInWithCustomToken`.
   *
   * @param email - The user's email address.
   * @param code  - The one-time password to verify.
   * @returns A Firebase custom token string.
   * @throws {BadRequestException}          If email or code is empty.
   * @throws {UnauthorizedException}        If the OTP is invalid, expired, or attempts are exhausted.
   * @throws {ForbiddenException}           If the account is blocked or deleted.
   * @throws {InternalServerErrorException} On unexpected verification errors.
   */
  async verifyOtpAndMintCustomToken(
    email: string,
    code: string,
  ): Promise<string> {
    if (!email || !code) throw new BadRequestException("Invalid request");
    const normalizedEmail = normalizeEmail(email);
    try {
      await verifyOtp(normalizedEmail, code);
      const firebaseUser = await signInOrCreateUser(normalizedEmail);
      // The OTP proves email ownership; local status still decides whether
      // this account is allowed to receive a Firebase custom token.
      await this.syncActiveUserForSession(firebaseUser);
      return await mintCustomToken(firebaseUser.uid);
    } catch (err: any) {
      if (
        [
          "otp_invalid",
          "otp_expired",
          "otp_not_found",
          "otp_attempts_exhausted",
        ].includes(err?.message)
      ) {
        throw new UnauthorizedException("Invalid or expired code");
      }
      if (err instanceof ForbiddenException) {
        throw err;
      }
      console.error("verifyOtp error:", err);
      throw new InternalServerErrorException("OTP verification failed");
    }
  }

  /**
   * Exchanges a Firebase ID token for an HttpOnly session cookie.
   *
   * Verifies the ID token's authenticity, syncs the corresponding user
   * record, and sets a secure `__session` cookie on the response with a
   * 14-day TTL. The cookie is marked `httpOnly`, `sameSite=lax`, and
   * `secure` in production.
   *
   * @param idToken - A valid Firebase ID token obtained from the client.
   * @param res     - Express response object used to set the cookie.
   * @throws {BadRequestException}   If the ID token is missing.
   * @throws {UnauthorizedException} If the ID token is invalid or revoked.
   * @throws {ForbiddenException}    If the account is blocked or deleted.
   */
  async createSessionCookie(idToken: string, res: Response) {
    if (!idToken) throw new BadRequestException("Missing ID token");

    let cookie: string;
    try {
      const decoded = await adminAuth.verifyIdToken(idToken, true);
      const firebaseUser = await adminAuth.getUser(decoded.uid);
      // Google sign-in lands here directly, so this check covers non-OTP
      // logins before we mint a long-lived HttpOnly session.
      await this.syncActiveUserForSession(firebaseUser);

      cookie = await adminAuth.createSessionCookie(idToken, {
        expiresIn: SESSION_TTL_MS,
      });
    } catch (err) {
      if (err instanceof ForbiddenException) {
        throw err;
      }
      console.error("createSessionCookie error:", err);
      throw new UnauthorizedException("Invalid ID token");
    }

    const secure = process.env.NODE_ENV === "production";

    res.cookie("__session", cookie, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      maxAge: SESSION_TTL_MS,
      domain: COOKIE_DOMAIN,
      path: "/",
    });
  }

  /**
   * Restores a soft-deleted account using a one-time restore token.
   *
   * Looks up the hashed token in the database and re-activates the
   * associated user if the token is still within the 30-day restore
   * window.
   *
   * @param token - The plaintext restore token from the reinstatement email link.
   * @throws {BadRequestException} If the token is empty, invalid, or expired.
   */
  async restoreDeletedAccount(token: string): Promise<void> {
    const tokenValue = token.trim();
    if (!tokenValue) {
      throw new BadRequestException("Missing restore token");
    }

    // We only store token hashes, so leaked database rows cannot be used
    // as account-restore links.
    const restored = await this.usersRepository?.restoreDeletedUserByTokenHash(
      hashRestoreToken(tokenValue),
    );

    if (!restored) {
      throw new BadRequestException("invalid_or_expired_restore_token");
    }
  }

  /**
   * Syncs the Firebase user into the local database before creating a session.
   *
   * Checks whether the user is allowed to start a session (not blocked or
   * deleted) and then upserts the Firebase user data into the local users
   * table.
   *
   * @param firebaseUser - A subset of the Firebase `UserRecord` fields.
   * @returns The upserted local `AppUser`, or `undefined` if the repository is unavailable.
   * @throws {ForbiddenException} If the account is blocked or deleted.
   */
  private async syncActiveUserForSession(firebaseUser: {
    uid: string;
    email?: string;
    emailVerified: boolean;
    phoneNumber?: string;
    displayName?: string;
  }): Promise<AppUser | undefined> {
    const existing = await this.usersRepository?.findByFirebaseUidOrEmail(
      firebaseUser.uid,
      firebaseUser.email,
    );

    await this.assertCanCreateSession(existing);

    return this.usersRepository?.upsertFromFirebaseUser(firebaseUser);
  }

  /**
   * Guards session creation based on account status.
   *
   * - **active / new user** → allows the session.
   * - **deleted** → sends a reinstatement email and throws `ForbiddenException`.
   * - **suspended / banned** → throws `ForbiddenException` with a generic message.
   *
   * @param user  - The existing local user record, if any.
   * @throws {ForbiddenException} If the user account cannot create a session.
   */
  private async assertCanCreateSession(
    user?: AppUser | null,
  ): Promise<void> {
    if (!user) return;

    if (user.status === "active") return;

    if (user.status === "deleted") {
      await this.sendAccountReinstatementEmail(user);
      throw new ForbiddenException("account_deleted");
    }

    throw new ForbiddenException("account_unavailable");
  }

  /**
   * Generates a restore token and emails a reinstatement link to the user.
   *
   * A SHA-256 hash of the token is persisted so it can be verified later
   * without storing the plaintext. The email is only sent if the account
   * is still within the 30-day restore window.
   *
   * @param user          - The soft-deleted `AppUser` record.
   */
  private async sendAccountReinstatementEmail(
    user: AppUser,
  ): Promise<void> {
    if (!this.usersRepository) return;

    const restoreWindowStartedAt = user.deletedAt ?? new Date();
    const expiresAt = new Date(
      restoreWindowStartedAt.getTime() + DELETED_ACCOUNT_RESTORE_WINDOW_MS,
    );

    if (expiresAt <= new Date()) {
      return;
    }

    const token = crypto.randomBytes(32).toString("base64url");
    await this.usersRepository.createAccountReinstatementToken({
      userId: user.id,
      tokenHash: hashRestoreToken(token),
      expiresAt,
    });

    await this.mail.sendAccountReinstatementEmail(
      user.email,
      buildRestoreUrl(token),
      expiresAt,
    );
  }

  /**
   * Clears the `__session` cookie to log the user out.
   *
   * This performs a best-effort cookie removal. Full token revocation is
   * handled client-side via `firebase.auth().signOut()`. A dedicated
   * `/auth/revoke` endpoint can be added if server-side revocation is
   * needed.
   *
   * @param res - Express response object used to clear the cookie.
   */
  async logoutAndRevoke(res: Response) {
    // Best-effort clear; revocation is optional without a req context/uid
    res.clearCookie("__session", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      domain: COOKIE_DOMAIN,
      path: "/",
    });
    // If you want to revoke, do it on the client by calling Firebase Auth signOut (already handled),
    // or add a /auth/revoke endpoint that verifies the session cookie and calls:
    // await adminAuth.revokeRefreshTokens(uid);
  }

  /**
   * Verifies a Cloudflare Turnstile captcha token.
   *
   * Sends the token and the optional client IP to Cloudflare's
   * `/siteverify` endpoint and throws if verification fails at any stage
   * (network error, non-2xx response, JSON parse error, or rejection).
   *
   * @param token    - The Turnstile response token from the client.
   * @param remoteIp - Optional client IP for additional verification.
   * @throws {BadRequestException}          If the token is missing or rejected.
   * @throws {InternalServerErrorException} If the secret is missing or the
   *                                        request to Cloudflare fails.
   */
  private async verifyCaptcha(token: string, remoteIp?: string) {
    if (!token) {
      throw new BadRequestException("Captcha token is required");
    }
    const secret = process.env.TURNSTILE_SECRET?.trim();
    if (!secret) {
      console.error("Turnstile secret is not configured");
      throw new InternalServerErrorException(
        "Captcha verification unavailable",
      );
    }

    const params = new URLSearchParams();
    params.append("secret", secret);
    params.append("response", token);
    if (remoteIp) {
      params.append("remoteip", remoteIp);
    }

    let response: globalThis.Response;
    try {
      response = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",
          headers: {
            "content-type": "application/x-www-form-urlencoded",
          },
          body: params,
        },
      );
    } catch (err) {
      console.error("Turnstile verification request failed:", err);
      throw new InternalServerErrorException("Captcha verification failed");
    }

    if (!response.ok) {
      console.error(
        "Turnstile verification returned non-2xx status:",
        response.status,
        response.statusText,
      );
      throw new InternalServerErrorException("Captcha verification failed");
    }

    let payload: TurnstileVerifyResponse;
    try {
      payload = (await response.json()) as TurnstileVerifyResponse;
    } catch (err) {
      console.error("Turnstile verification JSON parse failed:", err);
      throw new InternalServerErrorException("Captcha verification failed");
    }

    if (!payload.success) {
      console.warn("Turnstile verification rejected request", payload);
      throw new BadRequestException("Captcha verification failed");
    }
  }
}

/**
 * Returns the SHA-256 hex digest of a restore token so the plaintext is
 * never stored in the database.
 */
function hashRestoreToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Builds the full account-restore URL that is emailed to the user.
 *
 * Resolves the web base URL from environment variables in order of
 * priority: `WEB_BASE_URL` → `NEXT_PUBLIC_WEB_BASE_URL` → first entry
 * in `CORS_ORIGINS`.
 *
 * @param token - The plaintext restore token to embed as a query param.
 * @returns The absolute restore URL, e.g. `https://app.cottonbro.com/account/restore?token=…`.
 * @throws {Error} If no base URL can be resolved from the environment.
 */
function buildRestoreUrl(token: string) {
  const baseUrl =
    process.env.WEB_BASE_URL?.trim().replace(/\/+$/, "") ||
    process.env.NEXT_PUBLIC_WEB_BASE_URL?.trim().replace(/\/+$/, "") ||
    process.env.CORS_ORIGINS?.split(",")[0]?.trim().replace(/\/+$/, "");

  if (!baseUrl) {
    throw new Error("Missing WEB_BASE_URL for account restore links");
  }

  const url = new URL("/account/restore", baseUrl);
  url.searchParams.set("token", token);
  return url.toString();
}
