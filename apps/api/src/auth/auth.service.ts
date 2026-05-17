import {
  Injectable,
  BadRequestException,
  ConflictException,
  UnauthorizedException,
  InternalServerErrorException,
  ForbiddenException,
  NotFoundException,
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
} from "@cottonplug/auth-server";
import { normalizeEmail } from "@cottonplug/utils";
import { MailService } from "../common/mail/mail.service.js";
import { R2StorageService } from "../common/storage/r2-storage.service.js";
import type {
  AppUser,
  LegalAgreementInput,
  UsersRepositoryPort,
  UserStatus,
} from "./users.repository.js";

const SESSION_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 days
const DELETED_ACCOUNT_RESTORE_WINDOW_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const MAX_AVATAR_BYTES = 5 * 1024 * 1024; // 5mb
export const USERS_REPOSITORY = Symbol("USERS_REPOSITORY");

const BLOCKED_STATUSES = new Set<UserStatus>(["suspended", "banned"]);

function parseCookieDomain(): string | undefined {
  const raw = process.env.WEB_COOKIE_DOMAIN?.trim();
  if (!raw) return undefined;

  try {
    const hostname = raw.includes("://") ? new URL(raw).hostname : raw;
    if (hostname === "localhost" || /^\d+\./.test(hostname)) return undefined;
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

type RequestUser = {
  uid?: unknown;
  email?: unknown;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly mail: MailService,
    private readonly storage: R2StorageService,
    @Optional()
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository?: UsersRepositoryPort,
  ) {}

  async startOtp(email: string, captchaToken: string, remoteIp?: string) {
    if (!email) throw new BadRequestException("Email is required");
    const normalizedEmail = normalizeEmail(email);
    await this.verifyCaptcha(captchaToken, remoteIp);

    const user = await this.usersRepository?.findByEmail(normalizedEmail);
    if (user?.status === "deleted") {
      // Deleted users are sent re-instatement email instead of a sign-in OTP.
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

  async createSessionCookie(
    idToken: string,
    res: Response,
    agreements?: LegalAgreementInput,
  ) {
    if (!idToken) throw new BadRequestException("Missing ID token");

    let cookie: string;
    try {
      // Google sign-in lands here directly, so this check covers non-OTP
      // logins before we mint a long-lived HttpOnly session.
      const decoded = await adminAuth.verifyIdToken(idToken, true);
      const firebaseUser = await adminAuth.getUser(decoded.uid);

      const user = await this.syncActiveUserForSession(
        firebaseUser,
        agreements,
      );
      this.assertHasRequiredAgreements(user);

      cookie = await adminAuth.createSessionCookie(idToken, {
        expiresIn: SESSION_TTL_MS,
      });
    } catch (err) {
      if (err instanceof ForbiddenException) {
        throw err;
      }
      console.error("createSessionCookie error:", err);
      throw new UnauthorizedException("login_session_failed");
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

  async getAccountSettings(claims: RequestUser) {
    const user = await this.getRequestUserRecord(claims);
    this.assertCanAccessAccountSettings(user);

    return {
      marketingEmailsEnabled: isMarketingEmailEnabled(user),
      marketingEmailsOptedInAt: user.marketingEmailsOptedInAt,
      marketingEmailsOptedOutAt: user.marketingEmailsOptedOutAt,
    };
  }

  async getProfile(claims: RequestUser) {
    const user = await this.getRequestUserRecord(claims);
    return toProfileResponse(user);
  }

  async updateProfileName(claims: RequestUser, name: string) {
    const { uid, email } = this.readRequestUser(claims);
    const nextName = name.trim();
    if (!nextName) {
      throw new BadRequestException("name_required");
    }

    await adminAuth.updateUser(uid, { displayName: nextName }).catch((err) => {
      console.error("Failed to update display name:", err);
      throw new InternalServerErrorException("profile_update_failed");
    });

    const user = await this.usersRepository?.updateName({
      uid,
      email,
      name: nextName,
    });

    if (!user) {
      throw new NotFoundException("account_not_found");
    }

    return toProfileResponse(user);
  }

  async updateProfilePhone(claims: RequestUser, phoneNumber?: string) {
    const { uid, email } = this.readRequestUser(claims);
    const nextPhoneNumber = normalizeOptionalText(phoneNumber);

    const user = await this.usersRepository?.updatePhoneNumber({
      uid,
      email,
      phoneNumber: nextPhoneNumber,
    });

    if (!user) {
      throw new NotFoundException("account_not_found");
    }

    return toProfileResponse(user);
  }

  async updateProfileAvatar(claims: RequestUser, imageBase64?: string) {
    const { uid, email } = this.readRequestUser(claims);
    const existingUser = await this.getRequestUserRecord(claims);
    const imageValue = normalizeOptionalText(imageBase64);

    if (!imageValue) {
      await adminAuth.updateUser(uid, { photoURL: null }).catch((err) => {
        console.error("Failed to clear profile photo:", err);
        throw new InternalServerErrorException("profile_update_failed");
      });

      const user = await this.usersRepository?.updateAvatarUrl({
        uid,
        email,
        avatarUrl: null,
        avatarObjectKey: null,
      });

      if (!user) {
        throw new NotFoundException("account_not_found");
      }

      await this.storage.deleteObject(existingUser.avatarObjectKey);
      return toProfileResponse(user);
    }

    const uploaded = await this.storage.uploadBase64Image({
      imageBase64: imageValue,
      path: `users/${existingUser.id}/avatar`,
      maxBytes: MAX_AVATAR_BYTES,
    });

    await adminAuth.updateUser(uid, { photoURL: uploaded.url }).catch((err) => {
      console.error(
        "Failed to update profile photo in identity provider:",
        err,
      );
      throw new InternalServerErrorException("profile_update_failed");
    });

    const user = await this.usersRepository?.updateAvatarUrl({
      uid,
      email,
      avatarUrl: uploaded.url,
      avatarObjectKey: uploaded.objectKey,
    });

    if (!user) {
      throw new NotFoundException("account_not_found");
    }

    await this.storage.deleteObject(existingUser.avatarObjectKey);
    return toProfileResponse(user);
  }

  async startProfileEmailChange(claims: RequestUser, nextEmail: string) {
    const { uid } = this.readRequestUser(claims);
    const user = await this.getRequestUserRecord(claims);
    this.assertCanChangeEmail(user);

    const normalizedEmail = normalizeEmail(nextEmail);

    if (normalizedEmail === user.email) {
      throw new BadRequestException("email_unchanged");
    }

    await this.assertEmailAvailable(normalizedEmail, uid);

    const code = await startOtp(normalizedEmail);
    await this.mail.sendOtpEmail(normalizedEmail, code);
  }

  async confirmProfileEmailChange(
    claims: RequestUser,
    nextEmail: string,
    code: string,
  ) {
    const { uid, email } = this.readRequestUser(claims);
    const user = await this.getRequestUserRecord(claims);
    this.assertCanChangeEmail(user);

    const normalizedEmail = normalizeEmail(nextEmail);

    if (normalizedEmail === user.email) {
      throw new BadRequestException("email_unchanged");
    }

    await this.assertEmailAvailable(normalizedEmail, uid);

    try {
      await verifyOtp(normalizedEmail, code);
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
      console.error("confirmProfileEmailChange OTP error:", err);
      throw new InternalServerErrorException("OTP verification failed");
    }

    await adminAuth
      .updateUser(uid, {
        email: normalizedEmail,
        emailVerified: true,
      })
      .catch((err: any) => {
        if (err?.code === "auth/email-already-exists") {
          throw new ConflictException("email_in_use");
        }
        console.error("Failed to update email in identity provider:", err);
        throw new InternalServerErrorException("profile_update_failed");
      });

    const updated = await this.usersRepository?.updateEmail({
      uid,
      email,
      newEmail: normalizedEmail,
    });

    if (!updated) {
      throw new NotFoundException("account_not_found");
    }

    return toProfileResponse(updated);
  }

  async updateMarketingEmailConsent(claims: RequestUser, enabled: boolean) {
    const { uid, email } = this.readRequestUser(claims);
    const existingUser = await this.getRequestUserRecord(claims);
    this.assertCanAccessAccountSettings(existingUser);

    const user = await this.usersRepository?.updateMarketingEmailConsent({
      uid,
      email,
      enabled,
    });

    if (!user) {
      throw new NotFoundException("account_not_found");
    }

    return {
      marketingEmailsEnabled: isMarketingEmailEnabled(user),
      marketingEmailsOptedInAt: user.marketingEmailsOptedInAt,
      marketingEmailsOptedOutAt: user.marketingEmailsOptedOutAt,
    };
  }

  async deleteAccount(claims: RequestUser, res: Response): Promise<void> {
    const { uid, email } = this.readRequestUser(claims);
    const existingUser = await this.getRequestUserRecord(claims);
    this.assertCanAccessAccountSettings(existingUser);

    const user = await this.usersRepository?.softDeleteUser({ uid, email });

    if (!user) {
      throw new NotFoundException("account_not_found");
    }

    await this.logoutAndRevoke(res);
    await adminAuth.revokeRefreshTokens(uid).catch((err) => {
      console.error("Failed to revoke identity provider refresh tokens:", err);
    });
  }

  // Firebase proves identity; local status decides access.
  private async syncActiveUserForSession(
    firebaseUser: {
      uid: string;
      email?: string;
      emailVerified: boolean;
      phoneNumber?: string;
      displayName?: string;
      photoURL?: string;
    },
    agreements?: LegalAgreementInput,
  ): Promise<AppUser | undefined> {
    const existing = await this.usersRepository?.findByFirebaseUidOrEmail(
      firebaseUser.uid,
      firebaseUser.email,
    );

    await this.assertCanCreateSession(existing);

    const user = await this.usersRepository?.upsertFromFirebaseUser(
      firebaseUser,
      agreements,
    );

    if (!existing && user) {
      await this.sendWelcomeEmail(user.email);
    }

    return user;
  }

  private assertHasRequiredAgreements(user?: AppUser | null): void {
    if (!user) return;

    if (!user.privacyPolicyAcceptedAt || !user.termsAcceptedAt) {
      throw new ForbiddenException("agreements_required");
    }
  }

  private async assertCanCreateSession(user?: AppUser | null): Promise<void> {
    if (!user) return;

    if (user.status === "active") return;

    if (user.status === "deleted") {
      await this.sendAccountReinstatementEmail(user);
      throw new ForbiddenException("account_deleted");
    }

    throw new ForbiddenException("account_unavailable");
  }

  private async sendAccountReinstatementEmail(user: AppUser): Promise<void> {
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

  private async sendWelcomeEmail(email: string): Promise<void> {
    await this.mail
      .sendWelcomeEmail(email, buildMarketingPreferencesUrl())
      .catch((err) => {
        console.error("Failed to send welcome email:", err);
      });
  }

  async logoutAndRevoke(res: Response) {
    res.clearCookie("__session", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      domain: COOKIE_DOMAIN,
      path: "/",
    });
  }

  private readRequestUser(claims: RequestUser) {
    if (typeof claims.uid !== "string" || !claims.uid) {
      throw new UnauthorizedException("Invalid session");
    }

    return {
      uid: claims.uid,
      email: typeof claims.email === "string" ? claims.email : undefined,
    };
  }

  private async getRequestUserRecord(claims: RequestUser): Promise<AppUser> {
    const { uid, email } = this.readRequestUser(claims);
    const user = await this.usersRepository?.findByFirebaseUidOrEmail(
      uid,
      email,
    );

    if (!user) {
      throw new NotFoundException("account_not_found");
    }

    return user;
  }

  private async assertEmailAvailable(email: string, currentUid: string) {
    const existing = await this.usersRepository?.findByEmail(email);
    if (existing && existing.firebaseUid !== currentUid) {
      throw new ConflictException("email_in_use");
    }

    await adminAuth
      .getUserByEmail(email)
      .then((firebaseUser) => {
        if (firebaseUser.uid !== currentUid) {
          throw new ConflictException("email_in_use");
        }
      })
      .catch((err: any) => {
        if (err instanceof ConflictException) {
          throw err;
        }
        if (err?.code === "auth/user-not-found") {
          return;
        }
        console.error(
          "Failed to check identity provider email availability:",
          err,
        );
        throw new InternalServerErrorException("profile_update_failed");
      });
  }

  private assertCanChangeEmail(user: AppUser): void {
    if (user.role !== "user") {
      throw new ForbiddenException("email_change_forbidden");
    }
  }

  private assertCanAccessAccountSettings(user: AppUser): void {
    if (user.role !== "user") {
      throw new ForbiddenException("settings_forbidden");
    }
  }

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

function hashRestoreToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function buildRestoreUrl(token: string) {
  const baseUrl =
    readWebBaseUrl();

  if (!baseUrl) {
    throw new Error("Missing WEB_BASE_URL for account restore links");
  }

  const url = new URL("/account/restore", baseUrl);
  url.searchParams.set("token", token);
  return url.toString();
}

function buildMarketingPreferencesUrl() {
  const baseUrl = readWebBaseUrl();

  if (!baseUrl) {
    throw new Error("Missing WEB_BASE_URL for marketing preference links");
  }

  return new URL("/dashboard/settings", baseUrl).toString();
}

function readWebBaseUrl() {
  return (
    process.env.WEB_BASE_URL?.trim().replace(/\/+$/, "") ||
    process.env.NEXT_PUBLIC_WEB_BASE_URL?.trim().replace(/\/+$/, "") ||
    process.env.CORS_ORIGINS?.split(",")[0]?.trim().replace(/\/+$/, "")
  );
}

function isMarketingEmailEnabled(user: AppUser) {
  if (!user.marketingEmailsOptedInAt) return false;
  if (!user.marketingEmailsOptedOutAt) return true;
  return user.marketingEmailsOptedInAt > user.marketingEmailsOptedOutAt;
}

function normalizeOptionalText(value?: string) {
  const nextValue = value?.trim();
  return nextValue ? nextValue : null;
}

function toProfileResponse(user: AppUser) {
  return {
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified,
    phoneNumber: user.phoneNumber,
    avatarUrl: user.avatarUrl,
    role: user.role,
    canChangeEmail: user.role === "user",
  };
}
