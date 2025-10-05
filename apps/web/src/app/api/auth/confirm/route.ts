import { NextResponse } from "next/server";
import {
  CognitoIdentityProviderClient,
  ConfirmSignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";

const region = process.env.AWS_REGION || process.env.NEXT_PUBLIC_AWS_REGION!;
const clientId =
  process.env.COGNITO_CLIENT_ID || process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!;

const cognito = new CognitoIdentityProviderClient({ region });

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();
    if (!email || !code) {
      return new NextResponse("Email and code are required.", { status: 400 });
    }
    await cognito.send(
      new ConfirmSignUpCommand({
        ClientId: clientId,
        Username: email,
        ConfirmationCode: code,
      })
    );
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    const msg =
      e?.name === "CodeMismatchException"
        ? "That code is incorrect."
        : e?.name === "ExpiredCodeException"
          ? "That code expired. Request a new one."
          : e?.message || "Confirmation failed.";
    return new NextResponse(msg, { status: 400 });
  }
}
