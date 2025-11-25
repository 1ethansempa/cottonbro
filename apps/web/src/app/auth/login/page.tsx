"use client";

import * as React from "react";
import { useAuth } from "@cottonbro/auth-react";
import { Button, Input, GoogleButton } from "@cottonbro/ui";
import WebAuthProvider from "@/app/providers/auth-provider";

declare global {
  interface Window {
    turnstile?: {
      reset: (widgetId?: string) => void;
    };
    cottonbroTurnstileCallback?: (token: string) => void;
    cottonbroTurnstileExpired?: () => void;
    cottonbroTurnstileError?: () => void;
  }
}

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

function LoginView() {
  const { requestOtp, confirmOtp, googleSignIn, busy, error } = useAuth();

  const [email, setEmail] = React.useState("");
  const [code, setCode] = React.useState("");
  const [sent, setSent] = React.useState(false);
  const [status, setStatus] = React.useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = React.useState<string | null>(null);
  const turnstileConfigured = Boolean(TURNSTILE_SITE_KEY);

  const resetCaptcha = React.useCallback(() => {
    setCaptchaToken(null);
    if (typeof window !== "undefined" && window.turnstile?.reset) {
      try {
        window.turnstile.reset();
      } catch {
        // no-op; Turnstile script handles logging
      }
    }
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined" || !turnstileConfigured) return;
    window.cottonbroTurnstileCallback = (token: string) => {
      setCaptchaToken(token);
      setStatus(null);
    };
    const invalidateToken = () => {
      setCaptchaToken(null);
      setStatus(null);
    };
    window.cottonbroTurnstileExpired = invalidateToken;
    window.cottonbroTurnstileError = invalidateToken;
    return () => {
      delete window.cottonbroTurnstileCallback;
      delete window.cottonbroTurnstileExpired;
      delete window.cottonbroTurnstileError;
    };
  }, [turnstileConfigured]);

  const redirect =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("redirect") || "/"
      : "/";

  async function onGoogle() {
    setStatus(null);
    try {
      await googleSignIn();
      window.location.replace(redirect);
    } catch (e) {
      setStatus("Google sign-in failed. Please try again.");
    }
  }

  async function onSend(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    if (!turnstileConfigured) {
      setStatus("Captcha is not configured. Contact support.");
      return;
    }
    if (!captchaToken) {
      setStatus("Please complete the captcha before requesting a code.");
      return;
    }
    setStatus(null);
    try {
      await requestOtp(email.trim(), captchaToken);
      setSent(true);
      setStatus("Code sent. Check your inbox.");
    } catch {
      setStatus("Could not send code. Please try again.");
    } finally {
      resetCaptcha();
    }
  }

  async function onConfirm(e: React.FormEvent) {
    e.preventDefault();
    if (!email || code.length !== 6) return;
    setStatus(null);
    try {
      await confirmOtp(email.trim(), code.trim());
      window.location.replace(redirect);
    } catch {
      setStatus("Invalid code. Please try again.");
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-12 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-start">
      {/* LEFT COLUMN: SIGN IN */}
      <div className="w-full max-w-md mx-auto md:mx-0">
        <h1 className="font-jamino text-5xl md:text-7xl uppercase text-black mb-8 md:mb-12 tracking-tight">
          Sign In
        </h1>

        {/* Google button */}
        <div className="mb-8">
          <GoogleButton
            onClick={onGoogle}
            disabled={busy}
          />
        </div>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-black/10"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase font-bold tracking-widest">
            <span className="bg-white px-4 text-zinc-500">Or using email</span>
          </div>
        </div>

        {/* Forms */}
        <div>
          {!sent ? (
            <form onSubmit={onSend} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-bold uppercase tracking-widest text-black"
                >
                  Email Address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="YOU@EXAMPLE.COM"
                />
              </div>

              {turnstileConfigured ? (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                    Verify you&apos;re human
                  </p>
                  <div
                    className="cf-turnstile mt-3"
                    data-sitekey={TURNSTILE_SITE_KEY}
                    data-callback="cottonbroTurnstileCallback"
                    data-expired-callback="cottonbroTurnstileExpired"
                    data-error-callback="cottonbroTurnstileError"
                    data-action="otp_start"
                    data-theme="light"
                    role="presentation"
                  />
                </div>
              ) : (
                <p className="text-sm font-semibold text-red-600">
                  Turnstile site key missing. Add NEXT_PUBLIC_TURNSTILE_SITE_KEY
                  to use captcha protection.
                </p>
              )}

              <Button
                type="submit"
                disabled={
                  !email || busy || !captchaToken || !turnstileConfigured
                }
                className="w-full"
              >
                {busy ? "Sending…" : "Sign In"}
              </Button>
            </form>
          ) : (
            <form onSubmit={onConfirm} className="space-y-6">
              <div>
                <label
                  htmlFor="code"
                  className="mb-2 block text-sm font-bold uppercase tracking-widest text-black"
                >
                  Enter 6-digit code
                </label>
                <Input
                  id="code"
                  name="code"
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  className="tracking-[0.5em] text-center text-xl font-bold"
                  placeholder="••••••"
                />
              </div>

              <Button
                type="submit"
                disabled={code.length !== 6 || busy}
                className="w-full"
              >
                {busy ? "Verifying…" : "Confirm Code"}
              </Button>

              <button
                type="button"
                onClick={onSend}
                disabled={busy || !captchaToken || !turnstileConfigured}
                className="w-full text-xs font-bold uppercase tracking-widest text-zinc-500 underline underline-offset-4 hover:text-black transition disabled:opacity-60 text-center block"
              >
                Resend code
              </button>
            </form>
          )}
        </div>

        {status && (
          <p className="mt-6 text-center text-sm font-bold text-green-700 uppercase tracking-wide">
            {status}
          </p>
        )}
        {error && (
          <p className="mt-2 text-center text-sm font-bold text-red-600 uppercase tracking-wide">
            {error}
          </p>
        )}
      </div>

      {/* RIGHT COLUMN: INFO SNIPPET */}
      <div className="hidden md:block w-full max-w-md mx-auto md:mx-0 pt-8 md:pt-24">
        <div className="p-8 border-2 border-black bg-zinc-50 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <p className="font-bold uppercase tracking-wide text-sm mb-4 text-black">
            New to Cotton Bro?
          </p>
          <p className="text-base font-medium text-zinc-600 mb-6 leading-relaxed">
            Use the form on the left. We&apos;ll create an account for you
            automatically if you don&apos;t have one.
          </p>
          <div className="h-1 w-12 bg-street-red" />
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <WebAuthProvider>
      <LoginView />
    </WebAuthProvider>
  );
}
