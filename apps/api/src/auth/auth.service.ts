import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
} from "@nestjs/common";
import type { Response } from "express";
import {
  adminAuth,
  startOtp,
  verifyOtp,
  signInOrCreateUser,
  mintCustomToken,
} from "@cottonbro/auth-server";
import { ConfigService } from "../common/config/config.service.js";

const DEFAULT_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 days
const MAX_TTL_MS = DEFAULT_TTL_MS; // cap at 14d
const MIN_TTL_MS = 5 * 60 * 1000; // Firebase requires >= 5 minutes

function clampTtlMs(ttlMs?: number) {
  if (!ttlMs || ttlMs <= 0) return DEFAULT_TTL_MS;
  return Math.min(Math.max(ttlMs, MIN_TTL_MS), MAX_TTL_MS);
}

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
  constructor(private readonly config: ConfigService) {}

  /** Starts an OTP flow: generate & email the code */
  async startOtp(email: string, captchaToken: string, remoteIp?: string) {
    if (!email) throw new BadRequestException("Email is required");
    await this.verifyCaptcha(captchaToken, remoteIp);
    const code = await startOtp(email);
    // TODO: send via your mailer (SES/Mailgun/etc.)
    console.log(`[OTP] ${email} => ${code}`);
  }

  /** Verifies code, ensures user, returns a Firebase Custom Token */
  async verifyOtpAndMintCustomToken(
    email: string,
    code: string
  ): Promise<string> {
    if (!email || !code) throw new BadRequestException("Invalid request");
    try {
      await verifyOtp(email, code);
      const user = await signInOrCreateUser(email);
      return await mintCustomToken(user.uid);
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
      console.error("verifyOtp error:", err);
      throw new InternalServerErrorException("OTP verification failed");
    }
  }

  /** Exchanges a Firebase ID token for an HttpOnly session cookie (max 14d) */
  async createSessionCookie(
    idToken: string,
    ttlMs: number | undefined,
    res: Response
  ) {
    if (!idToken) throw new BadRequestException("Missing ID token");
    const expiresIn = clampTtlMs(ttlMs);

    let cookie: string;
    try {
      cookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
    } catch (err) {
      console.error("createSessionCookie error:", err);
      throw new UnauthorizedException("Invalid ID token");
    }

    const secure =
      process.env.NODE_ENV === "production" ||
      String(process.env.COOKIE_SECURE ?? "").toLowerCase() === "true";

    res.cookie("__session", cookie, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      maxAge: expiresIn,
      domain: process.env.COOKIE_DOMAIN || undefined, // e.g., .cottonbro.com
      path: "/",
    });
  }

  /** Clears the session cookie (and optionally revokes tokens) */
  async logoutAndRevoke(res: Response) {
    // Best-effort clear; revocation is optional without a req context/uid
    res.clearCookie("__session", {
      httpOnly: true,
      secure:
        process.env.NODE_ENV === "production" ||
        String(process.env.COOKIE_SECURE ?? "").toLowerCase() === "true",
      sameSite: "lax",
      domain: process.env.COOKIE_DOMAIN || undefined,
      path: "/",
    });
    // If you want to revoke, do it on the client by calling Firebase Auth signOut (already handled),
    // or add a /auth/revoke endpoint that verifies the session cookie and calls:
    // await adminAuth.revokeRefreshTokens(uid);
  }

  private async verifyCaptcha(token: string, remoteIp?: string) {
    if (!token) {
      throw new BadRequestException("Captcha token is required");
    }
    const secret = this.config.TURNSTILE_SECRET;
    if (!secret) {
      console.error("Turnstile secret is not configured");
      throw new InternalServerErrorException("Captcha verification unavailable");
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
        }
      );
    } catch (err) {
      console.error("Turnstile verification request failed:", err);
      throw new InternalServerErrorException("Captcha verification failed");
    }

    if (!response.ok) {
      console.error(
        "Turnstile verification returned non-2xx status:",
        response.status,
        response.statusText
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
