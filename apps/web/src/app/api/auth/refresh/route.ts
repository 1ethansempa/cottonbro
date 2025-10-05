import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { refreshTokens, setAuthCookies } from "../../../../lib/auth-server";

export async function POST() {
  try {
    const c = await cookies();
    const refresh = c.get("refresh_token")?.value;
    if (!refresh) {
      return new NextResponse("No refresh token", { status: 401 });
    }

    const t = await refreshTokens(refresh);
    await setAuthCookies({
      access_token: t.access_token,
      id_token: t.id_token,
      refresh_token: t.refresh_token ?? undefined,
      expires_in: t.expires_in,
    });

    return NextResponse.json({ ok: true, expires_in: t.expires_in ?? 3600 });
  } catch (e) {
    console.error("Refresh failed:", e);
    return new NextResponse("Refresh failed", { status: 401 });
  }
}
