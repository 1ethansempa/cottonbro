"use client";

import React, { useState } from "react";
import GoogleIcon from "../../../components/google-icon";
import AppleIcon from "../../../components/apple-icon";
import {
  generateCodeVerifier,
  codeChallengeFromVerifier,
} from "../../../lib/pkce";

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  // Hosted UI (Google) + PKCE
  const onGoogle = async () => {
    try {
      const domain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN!;
      const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!;
      const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI!;

      const verifier = await generateCodeVerifier();
      const challenge = await codeChallengeFromVerifier(verifier);
      const state = crypto.randomUUID();

      // keep these tab-scoped for the callback
      sessionStorage.setItem("pkce_verifier", verifier);
      sessionStorage.setItem("oauth_state", state);

      const params = new URLSearchParams({
        identity_provider: "Google",
        response_type: "code",
        client_id: clientId,
        redirect_uri: redirectUri,
        scope: "openid email profile",
        code_challenge_method: "S256",
        code_challenge: challenge,
        state,
      });

      // hard redirect to Cognito Hosted UI
      window.location.href = `${domain.replace(/\/+$/, "")}/oauth2/authorize?${params.toString()}`;
    } catch (err) {
      console.error("Google OAuth start failed:", err);
      window.alert("We couldn’t start Google sign-in. Please try again.");
    }
  };

  // Leave Apple for later
  const onApple = () => {
    window.alert("Apple sign-in is coming soon.");
  };

  // Email/password -> server route sets HttpOnly cookies
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;

    const form = e.currentTarget as HTMLFormElement;
    const email = (
      form.elements.namedItem("email") as HTMLInputElement
    ).value.trim();
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value;

    if (!email || !password) {
      window.alert("Enter your email and password.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Login failed:", text);
        window.alert(
          text || "Sign in failed. Check your credentials and try again."
        );
        return;
      }
      // success
      window.location.replace("/");
    } catch (err) {
      console.error("Login error:", err);
      window.alert("Something went wrong signing you in. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      {/* Card */}
      <div className="w-full max-w-md">
        <div className="relative rounded-2xl bg-white shadow-xl p-6 md:p-8">
          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              Welcome back
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Sign in to your Cottonbro account
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

            <button
              type="button"
              onClick={onApple}
              className="w-full inline-flex items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-black transition cursor-pointer"
            >
              <AppleIcon />
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

          {/* Email / Password */}
          <form onSubmit={onSubmit} className="space-y-4">
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
                autoComplete="current-password"
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-black focus:border-black"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-gray-700">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded-md border-gray-300 text-black focus:ring-black focus:ring-offset-0"
                />
                Remember me
              </label>
              <a
                href="/auth/forgot-password"
                className="text-xs text-black hover:opacity-70 underline-offset-4 hover:underline"
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="mt-2 w-full rounded-lg bg-gray-950/90 text-white px-4 py-2.5 text-sm font-semibold tracking-wide hover:bg-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-black transition disabled:opacity-60 "
            >
              Sign In
            </button>
          </form>

          {/* Footer hint */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Don’t have an account?{" "}
            <a
              href="/auth/signup"
              className="text-black hover:opacity-70 underline-offset-4 hover:underline"
            >
              Create one
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
