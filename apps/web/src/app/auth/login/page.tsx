"use client";

import * as React from "react";
import { useAuth } from "@cottonbro/auth-react";
import { Button, Input, GoogleButton } from "@cottonbro/ui";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

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
  const {
    requestOtp,
    confirmOtp,
    googleSignIn,
    busy,
    error,
    user,
    logout,
  } = useAuth();

  const [email, setEmail] = React.useState("");
  const [code, setCode] = React.useState("");
  const [sent, setSent] = React.useState(false);
  const [status, setStatus] = React.useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = React.useState<string | null>(null);
  const [switchingAccount, setSwitchingAccount] = React.useState(false);
  const turnstileConfigured = Boolean(TURNSTILE_SITE_KEY);
  const searchParams = useSearchParams();
  const redirect = searchParams?.get("redirect") || "/";
  const isAuthenticated = Boolean(user);

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

  const handleContinue = React.useCallback(() => {
    if (typeof window !== "undefined") {
      window.location.replace(redirect);
    }
  }, [redirect]);

  const handleSwitchAccount = React.useCallback(async () => {
    if (switchingAccount) return;
    setSwitchingAccount(true);
    setStatus("Signing you out so you can log in again…");
    try {
      await logout();
      setSent(false);
      setCode("");
      resetCaptcha();
      setStatus("Signed out. Enter your email to continue.");
    } catch {
      setStatus("Could not sign you out. Please try again.");
    } finally {
      setSwitchingAccount(false);
    }
  }, [logout, resetCaptcha, switchingAccount]);

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-start px-6 py-12"
    >
      {/* LEFT COLUMN: SIGN IN */}
      <div className="bg-white p-8 md:p-12 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
        <h1 className="font-marcellus text-5xl uppercase text-black mb-8 tracking-tight leading-[0.9]">
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
          {isAuthenticated && (
            <div className="mb-6 border-2 border-black bg-zinc-50 p-6">
              <p className="text-sm font-bold uppercase tracking-widest text-black">
                You&apos;re already signed in
                {user?.email ? ` as ${user.email}` : ""}.
              </p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Continue to your account or sign out to switch profiles.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleContinue}
                  className="w-full border-2 border-black bg-black px-6 py-3 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-street-red hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5"
                >
                  Continue
                </button>
                <button
                  type="button"
                  onClick={handleSwitchAccount}
                  disabled={switchingAccount || busy}
                  className="w-full border-2 border-black bg-white px-6 py-3 text-sm font-bold uppercase tracking-widest text-black transition hover:bg-zinc-100 disabled:opacity-60"
                >
                  {switchingAccount ? "Signing out…" : "Switch account"}
                </button>
              </div>
            </div>
          )}

          {!sent ? (
            <form onSubmit={onSend}>
              <fieldset
                disabled={isAuthenticated && !switchingAccount}
                className="space-y-6 disabled:opacity-60"
              >
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
                    className="border-2 border-black px-4 py-3 text-lg font-bold placeholder:text-zinc-300 focus:ring-0 focus:border-street-red transition-colors"
                  />
                </div>

                {turnstileConfigured ? (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
                      Verify you&apos;re human
                    </p>
                    <div
                      className="cf-turnstile"
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
                    Turnstile site key missing. Add
                    NEXT_PUBLIC_TURNSTILE_SITE_KEY to use captcha protection.
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={
                    !email ||
                    busy ||
                    !captchaToken ||
                    !turnstileConfigured ||
                    switchingAccount
                  }
                  className="w-full border-2 border-black bg-black text-white hover:bg-street-red hover:text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all uppercase font-bold tracking-widest py-4 text-lg"
                >
                  {busy ? "Sending…" : "Sign In"}
                </Button>
              </fieldset>
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
                  className="tracking-[0.5em] text-center text-3xl font-black border-2 border-black py-4"
                  placeholder="••••••"
                />
              </div>

              <Button
                type="submit"
                disabled={code.length !== 6 || busy}
                className="w-full border-2 border-black bg-black text-white hover:bg-street-red hover:text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all uppercase font-bold tracking-widest py-4 text-lg"
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
          <p className="mt-6 text-center text-sm font-bold text-green-700 uppercase tracking-wide bg-green-50 p-3 border border-green-200">
            {status}
          </p>
        )}
        {error && (
          <p className="mt-6 text-center text-sm font-bold text-red-600 uppercase tracking-wide bg-red-50 p-3 border border-red-200">
            {error}
          </p>
        )}
      </div>

      {/* RIGHT COLUMN: INFO SNIPPET */}
      <div className="hidden md:block pt-12">
        <div className="p-8 md:p-12 border-2 border-black bg-soft-pink shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform rotate-1 hover:rotate-0 transition-transform duration-300">
          <h2 className="font-marcellus text-3xl uppercase text-black mb-4">
            New to Cotton Bro?
          </h2>
          <p className="text-lg font-bold text-black mb-8 leading-relaxed uppercase">
            Use the form on the left. We&apos;ll create an account for you
            automatically if you don&apos;t have one.
          </p>
          <div className="flex gap-2">
            <div className="h-2 w-12 bg-street-red" />
            <div className="h-2 w-4 bg-black" />
          </div>
        </div>

        <div className="mt-12 p-8 md:p-12 border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform -rotate-1 hover:rotate-0 transition-transform duration-300">
          <h3 className="font-marcellus text-2xl uppercase text-black mb-2">
            Secure & Passwordless
          </h3>
          <p className="text-sm font-bold text-zinc-600 uppercase tracking-wide">
            We use magic links and OTPs so you never have to remember another password.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function LoginPage() {
  return <LoginView />;
}
