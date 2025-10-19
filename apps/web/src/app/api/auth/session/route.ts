import "server-only";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAdminAuth } from "@/server/firebase-admin";

const SESSION_COOKIE = "session";

export async function GET() {
  const c = await cookies();
  const cookie = c.get(SESSION_COOKIE)?.value;
  if (!cookie)
    return NextResponse.json({ authenticated: false }, { status: 401 });

  try {
    const decoded = await getAdminAuth().verifySessionCookie(cookie, true);
    return NextResponse.json({
      authenticated: true,
      user: {
        uid: decoded.sub,
        email: decoded.email ?? null,
        name: decoded.name ?? null,
        picture: decoded.picture ?? null,
      },
    });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
