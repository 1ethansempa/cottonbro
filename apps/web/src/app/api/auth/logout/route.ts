// app/api/auth/logout/route.ts
import { NextResponse } from "next/server";
import { clearAuthCookies } from "../../../../lib/auth-server";

export async function POST() {
  clearAuthCookies();
  // (Optional) You can also redirect user to Cognito's logout URL, but for app logout this is enough
  return NextResponse.json({ ok: true });
}
