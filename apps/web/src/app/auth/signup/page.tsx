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
import GoogleIcon from "../../../components/google-icon";

const region = process.env.NEXT_PUBLIC_AWS_REGION!;
const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!;

const cognito = new CognitoIdentityProviderClient({ region });

function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onGoogle = async () => {
    const domain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN!;
    const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!;
    const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI!;

    console.log(clientId);

    // --- PKCE (Proof Key for Code Exchange) + CSRF state ---
    // Generate a random string (verifier) and its hashed version (challenge).
    // Cognito will receive the challenge now, and later you prove you know the verifier.
    const verifier = await generateCodeVerifier();
    const challenge = await codeChallengeFromVerifier(verifier);

    // Generate a random state string to prevent CSRF attacks.
    const state = crypto.randomUUID();

    // Store verifier + state in sessionStorage (tab-scoped).
    // These will be retrieved on /callback to validate the flow.
    sessionStorage.setItem("pkce_verifier", verifier);
    sessionStorage.setItem("oauth_state", state);

    // --- Build query string for Cognito Hosted UI ---
    const params = new URLSearchParams({
      identity_provider: "Google", // Force Google login; omit to show provider chooser
      response_type: "code", // Ask Cognito for an authorization code
      client_id: clientId, // Your Cognito app client ID
      redirect_uri: redirectUri, // Where Cognito should send the user after login
      scope: "openid email profile", // Request OIDC claims: OpenID, email, basic profile
      code_challenge_method: "S256", // PKCE: SHA-256 hashing for code challenge
      code_challenge: challenge, // The hashed verifier
      state, // Random state value to match later
    });

    // --- Redirect browser to Cognito Hosted UI ---
    // User will be sent through Cognito → Google → back to your /callback with a code.
    window.location.href = `${domain}/oauth2/authorize?${params.toString()}`;
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErr(null);
    if (busy) return;

    const form = e.currentTarget as HTMLFormElement;
    const name = (
      form.elements.namedItem("name") as HTMLInputElement
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
            { Name: "name", Value: name },
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
              <GoogleIcon />
              Continue with Google
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

          <form onSubmit={onSubmit} className="space-y-4">
            {/* First Name */}
            {/* Full Name */}
            <div>
              <label
                htmlFor="name"
                className="mb-1 block text-sm text-gray-700"
              >
                Name(Moniker)
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-black focus:border-black"
                placeholder="What would you like us to call you?"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-black focus:border-black"
                placeholder="you@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="mb-1 block text-sm text-gray-700"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-xs text-black hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black rounded px-1 py-0.5"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-black focus:border-black"
                placeholder="••••••••"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="confirm"
                  className="mb-1 block text-sm text-gray-700"
                >
                  Confirm password
                </label>
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="text-xs text-black hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black rounded px-1 py-0.5"
                >
                  {showConfirm ? "Hide" : "Show"}
                </button>
              </div>
              <input
                id="confirm"
                name="confirm"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-black focus:border-black"
                placeholder="••••••••"
              />
            </div>

            {/* Terms / Agreement */}
            <div className="flex items-center">
              <input
                id="agree"
                name="agree"
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
              />
              <label
                htmlFor="agree"
                className="ml-2 block text-xs text-gray-700"
              >
                I agree to the{" "}
                <a href="#" className="underline hover:opacity-70">
                  Terms and Conditions
                </a>
              </label>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={!agree || busy}
              className="mt-2 w-full rounded-lg bg-black text-white px-4 py-2.5 text-sm font-semibold tracking-wide 
             hover:bg-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-black 
             transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {busy ? "Creating..." : "Create account"}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <a
              href="/auth/login"
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
