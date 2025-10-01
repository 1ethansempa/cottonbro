import { cookies } from "next/headers";

const domain = process.env.COGNITO_DOMAIN!;
const clientId = process.env.COGNITO_CLIENT_ID!;
const redirectUri = process.env.OAUTH_REDIRECT_URI!;

// Cookie flags: on localhost, Secure cannot be set or cookies won't persist.
// Use Secure only in prod.
const isProd = process.env.NODE_ENV === "production";

export async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string
) {
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
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<{
    id_token: string;
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    token_type: "Bearer";
  }>;
}

export async function refreshTokens(refreshToken: string) {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: clientId,
    refresh_token: refreshToken,
  });
  const res = await fetch(`${domain}/oauth2/token`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<{
    id_token?: string;
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    token_type: "Bearer";
  }>;
}

export async function setAuthCookies(tokens: {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  expires_in: number;
}) {
  const c = await cookies();

  // Access token: short-lived
  c.set("access_token", tokens.access_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/",
    maxAge: Math.min(tokens.expires_in, 3600), // seconds
  });

  // ID token (optional cookie; handy for SSR profile without hitting Cognito)
  if (tokens.id_token) {
    c.set("id_token", tokens.id_token, {
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,
      path: "/",
      maxAge: Math.min(tokens.expires_in, 3600),
    });
  }

  // Refresh token: long-lived
  if (tokens.refresh_token) {
    c.set("refresh_token", tokens.refresh_token, {
      httpOnly: true,
      sameSite: "strict",
      secure: isProd,
      path: "/",
      // Align with your pool config (e.g., 30–90 days)
      maxAge: 60 * 60 * 24 * 30,
    });
  }
}

export async function clearAuthCookies() {
  const c = await cookies();
  ["access_token", "refresh_token", "id_token"].forEach((name) =>
    c.set(name, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,
      path: "/",
      maxAge: 0,
    })
  );
}
