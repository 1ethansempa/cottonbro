"use client";

import React, { useState } from "react";
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import {
  generateCodeVerifier,
  codeChallengeFromVerifier,
} from "../../../lib/pkce";

const region = process.env.NEXT_PUBLIC_AWS_REGION!;
const clientId = process.env.NEXT_PUBLIC_COGNITO_WEB_CLIENT_ID!;
const domain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN!;
const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI!;

const cognito = new CognitoIdentityProviderClient({ region });

function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Hosted UI (Google) — quickest path to sign up/log in
  const onGoogle = async () => {
    const domain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN!;
    const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!;
    const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI!;

    console.log(clientId);

    // PKCE + state
    const verifier = await generateCodeVerifier();
    const challenge = await codeChallengeFromVerifier(verifier);
    const state = crypto.randomUUID();

    // stash for callback (tab-scoped)
    sessionStorage.setItem("pkce_verifier", verifier);
    sessionStorage.setItem("oauth_state", state);

    const params = new URLSearchParams({
      identity_provider: "Google", // or omit to show chooser
      response_type: "code",
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: "openid email profile",
      code_challenge_method: "S256",
      code_challenge: challenge,
      state,
    });

    window.location.href = `${domain}/oauth2/authorize?${params.toString()}`;
  };

  // Custom email/password sign-up (uses your form)
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErr(null);
    if (busy) return;

    const form = e.currentTarget as HTMLFormElement;
    const firstName = (
      form.elements.namedItem("firstName") as HTMLInputElement
    ).value.trim();
    const lastName = (
      form.elements.namedItem("lastName") as HTMLInputElement
    ).value.trim();
    const email = (
      form.elements.namedItem("email") as HTMLInputElement
    ).value.trim();
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value;
    const confirm = (form.elements.namedItem("confirm") as HTMLInputElement)
      .value;

    if (password !== confirm) {
      setErr("Passwords do not match.");
      return;
    }

    try {
      setBusy(true);
      await cognito.send(
        new SignUpCommand({
          ClientId: clientId,
          Username: email,
          Password: password,
          UserAttributes: [
            { Name: "email", Value: email },
            { Name: "given_name", Value: firstName },
            { Name: "family_name", Value: lastName },
          ],
        })
      );

      // Success: Cognito sent a verification code to email (default).
      // Redirect to your confirm page (you build this) with email prefilled.
      window.location.href = `/auth/confirm?email=${encodeURIComponent(email)}`;
    } catch (e: any) {
      // Common errors: UsernameExistsException, InvalidPasswordException, etc.
      setErr(
        e?.name === "UsernameExistsException"
          ? "An account with this email already exists."
          : e?.message || "Sign up failed"
      );
    } finally {
      setBusy(false);
    }
  };

  const onApple = () => {
    // Placeholder until you add Apple IdP to the user pool.
    alert("Apple Sign in is coming soon.");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="relative rounded-2xl bg-white shadow-xl p-6 md:p-8">
          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              Create your account
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Join Cottonbro in a few seconds
            </p>
          </div>

          {/* OAuth */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={onGoogle}
              className="w-full inline-flex items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-black transition cursor-pointer"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.49 12.27c0-.82-.07-1.42-.22-2.04H12v3.71h6.53c-.13 1.04-.84 2.62-2.42 3.68l-.02.11 3.51 2.73.24.02c2.2-2.03 3.47-5.02 3.47-8.21"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.07 7.94-2.91l-3.78-2.94c-1.01.7-2.36 1.19-4.16 1.19-3.18 0-5.88-2.14-6.84-5.11l-.1.01-3.7 2.86-.05.1C3.94 21.62 7.64 24 12 24"
                />
                <path
                  fill="#FBBC05"
                  d="M5.16 14.23a7.26 7.26 0 0 1-.4-2.23c0-.78.15-1.54.38-2.23l-.01-.15-3.74-2.9-.12.06A11.95 11.95 0 0 0 0 12c0 1.93.46 3.74 1.27 5.33l3.89-3.1"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c2.25 0 3.76.97 4.63 1.79l3.39-3.32C17.93 1.44 15.24 0 12 0 7.64 0 3.94 2.38 1.27 6.67l3.88 3.1c.98-2.97 3.66-5.02 6.85-5.02"
                />
              </svg>
              Continue with Google
            </button>
            <button
              type="button"
              onClick={onApple}
              className="w-full inline-flex items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-black transition cursor-pointer"
            >
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="h-5 w-5 fill-current"
              >
                <path d="M16.365 12.403c-.014-1.59.711-2.79 2.17-3.676-.814-1.176-2.046-1.82-3.673-1.934-1.539-.122-3.214.894-3.815.894-.633 0-2.087-.86-3.223-.86-2.34.037-4.834 1.92-4.834 5.73 0 1.124.206 2.283.618 3.48.55 1.59 2.533 5.486 4.594 5.424 1.08-.026 1.846-.776 3.246-.776 1.36 0 2.07.776 3.26.776 2.08-.03 3.88-3.53 4.41-5.127-2.79-1.32-2.753-4.06-2.753-4.93zM14.3 4.97c1.173-1.42 1.066-2.7 1.03-2.97-1.06.06-2.29.73-2.99 1.56-.77.89-1.15 1.98-1.06 3.12 1.14.08 2.29-.57 3.02-1.71z" />
              </svg>
              Continue with Apple
            </button>
          </div>

          {/* Separator */}
          <div className="relative my-6">
            <div className="h-px w-full bg-gray-200" />
            <span className="absolute inset-0 -top-3 mx-auto w-fit px-3 text-[11px] uppercase tracking-wider text-gray-500 bg-white">
              or
            </span>
          </div>

          {/* Inline error */}
          {err && (
            <p className="mb-3 rounded-md bg-red-50 text-red-700 text-sm px-3 py-2">
              {err}
            </p>
          )}

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-4">
            {/* ... your inputs unchanged ... */}

            <button
              type="submit"
              disabled={!agree || busy}
              className="mt-2 w-full rounded-lg bg-black text-white px-4 py-2.5 text-sm font-semibold tracking-wide hover:bg-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-black transition disabled:opacity-60"
            >
              {busy ? "Creating..." : "Create account"}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-black hover:opacity-70 underline underline-offset-4"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
