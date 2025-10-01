// app/api/auth/session/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function decodeJwt(token: string) {
  const [, payload] = token.split(".");
  return JSON.parse(Buffer.from(payload, "base64").toString("utf8"));
}

export async function GET() {
  const c = await cookies();
  const at = c.get("access_token")?.value;
  const idt = c.get("id_token")?.value;

  if (!at && !idt) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  // Light parse of ID token for profile (no signature verify here)
  let profile: any = null;
  if (idt) {
    try {
      profile = decodeJwt(idt);
    } catch {}
  }

  return NextResponse.json({
    authenticated: true,
    user: profile
      ? {
          sub: profile.sub,
          email: profile.email,
          name:
            profile.name ??
            [profile.given_name, profile.family_name].filter(Boolean).join(" "),
          picture: profile.picture,
        }
      : null,
  });
}
