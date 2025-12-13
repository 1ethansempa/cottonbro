"use client";

import * as React from "react";
import { useAuth } from "@cottonbro/auth-react";
import { Button, Input, GoogleButton } from "@cottonbro/ui";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Logo } from "@cottonbro/ui";

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
    setStatus("Signing you out…");
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

  // ...existing code...
  // ...existing code...
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-page p-6 font-urbanist relative overflow-hidden">
      {/* Solid Black Background - No Noise */}

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="mb-10 text-center">
          <Link href="/" className="inline-block grayscale hover:grayscale-0 transition-opacity">
            <Logo size="xl" color="white" fontClassName="font-bold tracking-tight" />
          </Link>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#0A0A0A] p-8 relative overflow-hidden shadow-2xl">

          <div className="top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan/50 to-transparent absolute" />

          <h1 className="text-3xl font-black text-white mb-2 text-center tracking-tighter uppercase">
            Sign In / Sign Up
          </h1>
          <p className="text-gray-400 text-sm text-center mb-8 font-medium">
            Access your studio dashboard
          </p>

          {/* Google Button */}
          <div className="mb-8">
            <GoogleButton
              onClick={onGoogle}
              disabled={busy}
              className="w-full justify-center rounded-full border border-white/10 bg-white text-black hover:bg-gray-200 font-bold transition-all py-3 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
            />
          </div>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest font-mono">
              <span className="bg-[#0A0A0A] px-4 text-gray-500">Or use email</span>
            </div>
          </div>

          {isAuthenticated ? (
            <div className="bg-white/5 border border-white/10 p-6 text-center rounded-2xl">
              <p className="text-sm font-medium text-white mb-1 font-mono">
                ID: {user?.email}
              </p>
              <div className="flex flex-col gap-3 mt-6">
                <Button
                  onClick={handleContinue}
                  className="w-full bg-cyan hover:bg-cyan-bold text-black font-bold py-4 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.3)] uppercase tracking-widest text-xs cursor-pointer transition-all hover:scale-[1.02]"
                >
                  Proceed to Dashboard
                </Button>
                <button
                  onClick={handleSwitchAccount}
                  disabled={switchingAccount || busy}
                  className="text-xs text-gray-500 hover:text-white transition-colors uppercase tracking-widest font-bold cursor-pointer mt-2"
                >
                  {switchingAccount ? "Signing out..." : "Sign Out"}
                </button>
              </div>
            </div>
          ) : (
            !sent ? (
              <form onSubmit={onSend} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider ml-1">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-black/50 border-white/10 text-white placeholder:text-zinc-700 focus:border-cyan focus:ring-1 focus:ring-cyan rounded-xl py-6 px-6 transition-all font-medium text-base h-14"
                    required
                  />
                </div>

                {turnstileConfigured && (
                  <div className="mb-4">
                    <div
                      className="cf-turnstile"
                      data-sitekey={TURNSTILE_SITE_KEY}
                      data-callback="cottonbroTurnstileCallback"
                      data-expired-callback="cottonbroTurnstileExpired"
                      data-error-callback="cottonbroTurnstileError"
                      data-theme="dark"
                    />
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={!email || busy}
                  className="w-full bg-cyan hover:bg-cyan-bold text-black font-bold py-4 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs uppercase tracking-widest group cursor-pointer hover:scale-[1.02]"
                >
                  {busy ? "Sending..." : "Send Login Code"}
                </Button>
              </form>
            ) : (
              <form onSubmit={onConfirm} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider ml-1">
                    Enter Code
                  </label>
                  <Input
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    maxLength={6}
                    className="w-full bg-black/50 border-white/10 text-white text-center text-3xl font-black placeholder:text-zinc-800 focus:border-cyan focus:ring-1 focus:ring-cyan rounded-xl py-6 px-4 tracking-[0.5em] transition-all font-mono h-20"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={code.length !== 6 || busy}
                  className="w-full bg-cyan hover:bg-cyan-bold text-black font-bold py-4 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs uppercase tracking-widest cursor-pointer hover:scale-[1.02]"
                >
                  {busy ? "Verifying..." : "Open Studio"}
                </Button>

                <button
                  type="button"
                  onClick={() => { setSent(false); setCode(""); }}
                  className="w-full text-xs font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest cursor-pointer"
                >
                  Use different email
                </button>
              </form>
            )
          )}

          {/* Status Messages */}
          {status && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-3 bg-cyan/10 border border-cyan/20 text-center rounded-lg"
            >
              <p className="text-xs font-bold text-cyan">{status}</p>
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-3 bg-red-500/10 border border-red-500/20 text-center rounded-lg"
            >
              <p className="text-xs font-bold text-red-400">{error}</p>
            </motion.div>
          )}
        </div>

        <div className="mt-8 text-center text-xs text-secondary">
          <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
          <span className="mx-2">•</span>
          <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
        </div>
      </motion.div >
    </div >
  );
}

export default function LoginPage() {
  return <LoginView />;
}
