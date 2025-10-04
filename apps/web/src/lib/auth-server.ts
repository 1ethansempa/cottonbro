// lib/auth-server.ts
import { cookies } from "next/headers";

/**
 * Env: read from NEXT_PUBLIC_* first (so dev .env stays simple),
 * then fall back to server-only names if you prefer that style.
 * Trailing slashes are trimmed from the domain.
 */
const domain = (
  process.env.NEXT_PUBLIC_COGNITO_DOMAIN ??
  process.env.COGNITO_DOMAIN ??
  ""
).replace(/\/+$/, "");
const clientId =
  process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID ??
  process.env.COGNITO_CLIENT_ID ??
  "";
const redirectUri =
  process.env.NEXT_PUBLIC_REDIRECT_URI ?? process.env.OAUTH_REDIRECT_URI ?? "";

const isProd = process.env.NODE_ENV === "production";

function assertEnv() {
  if (!domain || !clientId || !redirectUri) {
    throw new Error("Auth env vars missing: domain/clientId/redirectUri");
  }
}

/** Exchange the authorization code (PKCE) for tokens */
export async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string
) {
  assertEnv();

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  });

  const res = await fetch(`${domain}/oauth2/token`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });

  if (!res.ok) throw new Error(await res.text());

  return res.json() as Promise<{
    id_token?: string;
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    token_type: "Bearer";
    scope?: string;
  }>;
}

/** Use refresh_token to mint a new access (and possibly id/refresh) token */
export async function refreshTokens(refreshToken: string) {
  assertEnv();

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: clientId,
    refresh_token: refreshToken,
  });

  const res = await fetch(`${domain}/oauth2/token`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });

  if (!res.ok) throw new Error(await res.text());

  return res.json() as Promise<{
    id_token?: string;
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    token_type: "Bearer";
    scope?: string;
  }>;
}

/** Set HttpOnly cookies for access/id/refresh tokens */
export async function setAuthCookies(tokens: {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  expires_in: number;
}) {
  const c = await cookies();

  const base = {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: isProd,
    path: "/",
  };

  // Access token (short-lived)
  c.set("access_token", tokens.access_token, {
    ...base,
    maxAge: Math.min(tokens.expires_in || 3600, 3600), // cap at 1h
  });

  // ID token (optional but handy for profile parsing on server)
  if (tokens.id_token) {
    c.set("id_token", tokens.id_token, {
      ...base,
      maxAge: Math.min(tokens.expires_in || 3600, 3600),
    });
  }

  // Refresh token (long-lived)
  if (tokens.refresh_token) {
    c.set("refresh_token", tokens.refresh_token, {
      ...base,
      sameSite: "strict", // CSRF-safer for refresh
      maxAge: 60 * 60 * 24 * 30, // 30d; align with pool config
    });
  }
}

/** Clear all auth cookies */
export async function clearAuthCookies() {
  const c = await cookies();
  const gone = {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: isProd,
    path: "/",
    maxAge: 0,
  };
  c.set("access_token", "", gone);
  c.set("id_token", "", gone);
  c.set("refresh_token", "", gone);
}
