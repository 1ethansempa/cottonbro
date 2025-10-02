import { NextResponse } from "next/server";
import {
  CognitoIdentityProviderClient,
  ForgotPasswordCommand,
} from "@aws-sdk/client-cognito-identity-provider";

const region = process.env.AWS_REGION || process.env.NEXT_PUBLIC_AWS_REGION!;
const clientId =
  process.env.COGNITO_CLIENT_ID || process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!;
const cognito = new CognitoIdentityProviderClient({ region });

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return new NextResponse("Email is required.", { status: 400 });

    await cognito.send(
      new ForgotPasswordCommand({ ClientId: clientId, Username: email })
    );
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    const msg =
      e?.name === "UserNotFoundException"
        ? "No account found with that email."
        : e?.message || "Could not send reset code.";
    return new NextResponse(msg, { status: 400 });
  }
}
