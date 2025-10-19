import "server-only";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAdminAuth } from "@/server/firebase-admin";

const SESSION_COOKIE = "session";

export async function POST() {
  const c = await cookies();
  const sessionCookie = c.get(SESSION_COOKIE)?.value;

  if (sessionCookie) {
    try {
      const auth = getAdminAuth();
      const decoded = await auth.verifySessionCookie(sessionCookie, true);
      await auth.revokeRefreshTokens(decoded.sub);
    } catch (error) {
      console.log(error);
    }
  }

  c.set({
    name: SESSION_COOKIE,
    value: "",
    path: "/",
    maxAge: 0,
  });

  return NextResponse.json({ ok: true });
}
