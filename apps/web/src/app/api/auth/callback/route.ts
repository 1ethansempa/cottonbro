// app/api/auth/callback/route.ts
import { NextResponse } from "next/server";
import {
  exchangeCodeForTokens,
  setAuthCookies,
} from "../../../../lib/auth-server";

export async function POST(req: Request) {
  try {
    const { code, codeVerifier } = await req.json();
    if (!code || !codeVerifier)
      return new NextResponse("Missing code/verifier", { status: 400 });
    const tokens = await exchangeCodeForTokens(code, codeVerifier);
    setAuthCookies(tokens);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return new NextResponse(e?.message || "Callback failed", { status: 400 });
  }
}
