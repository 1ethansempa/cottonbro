// app/api/auth/callback/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { code, codeVerifier } = await req.json();

    if (!code || !codeVerifier) {
      return new NextResponse("Missing code or codeVerifier", { status: 400 });
    }

    const domain = (process.env.NEXT_PUBLIC_COGNITO_DOMAIN || "").replace(
      /\/+$/,
      ""
    );
    const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!;
    const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI!;

    const body = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: clientId,
      code_verifier: codeVerifier,
      code,
      redirect_uri: redirectUri,
    });

    const tokenRes = await fetch(`${domain}/oauth2/token`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store",
    });

    if (!tokenRes.ok) {
      const text = await tokenRes.text().catch(() => "");
      console.error("Token exchange failed:", tokenRes.status, text);
      return new NextResponse(`Token exchange failed: ${text}`, {
        status: 400,
      });
    }

    const {
      id_token,
      access_token,
      refresh_token,
      expires_in,
      token_type,
      scope,
    } = await tokenRes.json();

    const c = await cookies();
    const secure = process.env.NODE_ENV === "production";
    const base = {
      httpOnly: true,
      sameSite: "lax" as const,
      secure,
      path: "/",
      maxAge: typeof expires_in === "number" ? expires_in : 3600,
    };

    if (id_token) c.set("id_token", id_token, base);
    if (access_token) c.set("access_token", access_token, base);

    if (refresh_token) {
      c.set("refresh_token", refresh_token, {
        ...base,

        maxAge: 60 * 60 * 24 * 30,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("Callback error:", e);
    return new NextResponse("Callback crashed", { status: 500 });
  }
}
