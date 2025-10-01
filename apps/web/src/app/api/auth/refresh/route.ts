// app/api/auth/refresh/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { refreshTokens, setAuthCookies } from "../../../../lib/auth-server";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const rt = cookieStore.get("refresh_token")?.value;
    if (!rt) return new NextResponse("No refresh token", { status: 401 });
    const tokens = await refreshTokens(rt);
    setAuthCookies(tokens);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return new NextResponse(e?.message || "Refresh failed", { status: 401 });
  }
}
