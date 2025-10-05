import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function decodeBase64Url(input: string) {
  const pad = (s: string) => s + "===".slice((4 - (s.length % 4)) % 4);
  const base64 = pad(input.replace(/-/g, "+").replace(/_/g, "/"));
  return Buffer.from(base64, "base64").toString("utf8");
}

function decodeJwt(token: string) {
  const parts = token.split(".");
  if (parts.length < 2) throw new Error("Bad JWT");
  const payload = JSON.parse(decodeBase64Url(parts[1]));
  return payload;
}

export async function GET() {
  const c = await cookies();
  const idt = c.get("id_token")?.value ?? null;
  const refresh = c.get("refresh_token")?.value ?? null;

  if (!idt && !refresh) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  if (!idt && refresh) {
    return NextResponse.json({ authenticated: false, needsRefresh: true });
  }

  try {
    const p = decodeJwt(idt!);
    const expMs = typeof p.exp === "number" ? p.exp * 1000 : null;

    if (expMs && expMs <= Date.now()) {
      return NextResponse.json({ authenticated: false, needsRefresh: true });
    }

    const user = p && {
      sub: p.sub,
      email: p.email,
      name: p.name ?? [p.given_name, p.family_name].filter(Boolean).join(" "),
      picture: p.picture,
    };

    return NextResponse.json({
      authenticated: true,
      user,
      expiresAt: expMs,
    });
  } catch {
    return new NextResponse("Bad token", { status: 400 });
  }
}
