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

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-page p-6 font-urbanist relative overflow-hidden">
      {/* Background Spotlights - Silver/Cold */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 opacity-20" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2 opacity-20" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.05] pointer-events-none mix-blend-overlay" />
      </div>

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

        <div className="rounded-sm border border-white/20 bg-black p-8 shadow-[0_0_50px_rgba(255,255,255,0.05)] relative overflow-hidden">
          {/* Decorative Corner lines */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white/40" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-white/40" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-white/40" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-white/40" />

          <div className="top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent absolute" />

          <h1 className="text-xl font-mono font-bold text-white mb-2 text-center uppercase tracking-widest">
            {"// ACCESS_PROTOCOL"}
          </h1>
          <p className="text-secondary text-xs text-center mb-8 font-mono">
            ESTABLISH SECURE CONNECTION
          </p>

          {/* Google Buttom wrapper */}
          <div className="mb-8 grayscale hover:grayscale-0 transition-all">
            <GoogleButton onClick={onGoogle} disabled={busy} className="w-full justify-center rounded-none border border-white/20 bg-white/5 hover:bg-white/10" />
          </div>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest font-mono">
              <span className="bg-black px-4 text-tertiary">Or Authenticate Manually</span>
            </div>
          </div>

          {isAuthenticated ? (
            <div className="bg-white/5 border border-white/10 p-6 text-center">
              <p className="text-sm font-medium text-white mb-1 font-mono">
                ID: {user?.email}
              </p>
              <div className="flex flex-col gap-3 mt-6">
                <Button
                  onClick={handleContinue}
                  className="w-full bg-white hover:bg-silver text-black font-bold py-4 rounded-sm shadow-glow-silver uppercase tracking-widest text-xs"
                >
                  Proceed to Dashboard
                </Button>
                <button
                  onClick={handleSwitchAccount}
                  disabled={switchingAccount || busy}
                  className="text-xs text-secondary hover:text-white transition-colors uppercase tracking-widest font-mono"
                >
                  {switchingAccount ? "TERMINATING SESSION..." : "TERMINATE SESSION"}
                </button>
              </div>
            </div>
          ) : (
            !sent ? (
              <form onSubmit={onSend} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-silver mb-2 font-mono">
                    Identifier (Email)
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="USER@COTTONBRO.COM"
                    className="w-full bg-black border-white/20 text-white placeholder:text-tertiary focus:border-white focus:ring-1 focus:ring-white rounded-none py-3 px-4 transition-all font-mono text-sm"
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
                  disabled={!email || busy || !captchaToken}
                  className="w-full bg-white hover:bg-gray-200 text-black font-bold py-4 rounded-none shadow-glow-silver transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-xs group"
                >
                  {busy ? "INITIATING..." : "REQUEST ACCESS CODE"}
                </Button>
              </form>
            ) : (
              <form onSubmit={onConfirm} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-silver mb-2 font-mono">
                    Security Code
                  </label>
                  <Input
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    maxLength={6}
                    className="w-full bg-black border-white/20 text-white text-center text-2xl font-bold placeholder:text-tertiary focus:border-neon-red focus:ring-1 focus:ring-neon-red rounded-none py-4 px-4 tracking-[0.5em] transition-all font-mono"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={code.length !== 6 || busy}
                  className="w-full bg-white hover:bg-gray-200 text-black font-bold py-4 rounded-none shadow-glow-silver transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-xs"
                >
                  {busy ? "VERIFYING..." : "AUTHENTICATE"}
                </Button>

                <button
                  type="button"
                  onClick={() => { setSent(false); setCode(""); }}
                  className="w-full text-[10px] font-bold text-secondary hover:text-white transition-colors uppercase tracking-widest font-mono"
                >
                  [ RETRY_IDENTIFIER ]
                </button>
              </form>
            )
          )}

          {/* Status Messages */}
          {status && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-3 bg-white/5 border border-white/10 text-center"
            >
              <p className="text-xs font-mono text-emerald-400 uppercase">{status}</p>
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-3 bg-red-500/10 border border-red-500/20 text-center"
            >
              <p className="text-xs font-mono text-neon-red uppercase">ERROR: {error}</p>
            </motion.div>
          )}
        </div>

        <div className="mt-8 text-center text-[10px] text-tertiary font-mono uppercase">
          SECURE CONNECTION ESTABLISHED <br />
          <Link href="#" className="hover:text-white border-b border-transparent hover:border-white transition-all">Privacy</Link> :: <Link href="#" className="hover:text-white border-b border-transparent hover:border-white transition-all">Terms</Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return <LoginView />;
}
