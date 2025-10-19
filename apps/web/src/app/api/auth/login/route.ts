import "server-only";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAdminAuth } from "@/server/firebase-admin";

const SESSION_COOKIE = "session";

const SESSION_MAX_AGE_MS = 5 * 24 * 60 * 60 * 1000;

type Body = { idToken?: string };

export async function POST(req: Request) {
  let idToken: string | undefined;

  try {
    const body = (await req.json()) as Body;
    idToken = body?.idToken;
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!idToken || typeof idToken !== "string") {
    return NextResponse.json({ error: "idToken required" }, { status: 400 });
  }

  try {
    const auth = getAdminAuth();

    const decoded = await auth.verifyIdToken(idToken, true);

    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn: SESSION_MAX_AGE_MS,
    });

    const c = await cookies();
    c.set({
      name: SESSION_COOKIE,
      value: sessionCookie,
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: Math.floor(SESSION_MAX_AGE_MS / 1000),
    });

    return NextResponse.json({
      ok: true,
      user: {
        uid: decoded.uid,
        email: decoded.email ?? null,
        name: decoded.name ?? null,
        picture: decoded.picture ?? null,
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 401 }
    );
  }
}
