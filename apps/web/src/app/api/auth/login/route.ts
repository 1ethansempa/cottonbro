import { NextResponse } from "next/server";
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  AuthFlowType,
} from "@aws-sdk/client-cognito-identity-provider";
import { setAuthCookies } from "../../../../lib/auth-server";

const region = process.env.AWS_REGION || process.env.NEXT_PUBLIC_AWS_REGION!;
const clientId =
  process.env.COGNITO_CLIENT_ID || process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!;

const cognito = new CognitoIdentityProviderClient({ region });

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return new NextResponse("Email and password are required.", {
        status: 400,
      });
    }

    const res = await cognito.send(
      new InitiateAuthCommand({
        AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
        ClientId: clientId,
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
        },
      })
    );

    const r = res.AuthenticationResult;
    if (!r?.AccessToken || !r?.ExpiresIn) {
      return new NextResponse("Authentication failed.", { status: 401 });
    }

    await setAuthCookies({
      access_token: r.AccessToken,
      refresh_token: r.RefreshToken,
      id_token: r.IdToken,
      expires_in: r.ExpiresIn,
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    const name = e?.name;
    const msg =
      name === "NotAuthorizedException"
        ? "Incorrect email or password."
        : name === "UserNotConfirmedException"
          ? "Account not confirmed. Check your email for the code."
          : name === "UserNotFoundException"
            ? "No account found with that email."
            : e?.message || "Sign in failed.";
    return new NextResponse(msg, { status: 400 });
  }
}
