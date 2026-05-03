"use client";

import { useAuth } from "@cottonbro/auth-react";
import {
  isValidEmail,
  isValidOtp,
  normalizeEmail,
  normalizeOtp,
} from "@cottonbro/utils";
import { Input, GoogleButton } from "@cottonbro/ui";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Logo } from "@cottonbro/ui";
import { FormEvent, useCallback, useEffect, useState } from "react";

// declare Turnstile’s HTML widget callbacks
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

function LoginView() {
  const { requestOtp, confirmOtp, googleSignIn, busy, error, user, logout } =
    useAuth();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const turnstileConfigured = Boolean(
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "",
  );

  const searchParams = useSearchParams();
  // Send users back to the protected page that redirected them here.
  const redirect = searchParams?.get("redirect") || "/";
  const isAuthenticated = Boolean(user);
  const primaryButtonClass =
    "w-full rounded-none border border-black bg-black px-4 py-5 sm:px-8 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-all hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer";
  const secondaryButtonClass =
    "w-full rounded-none border border-gray-300 bg-white px-4 py-5 sm:px-8 text-[10px] font-bold uppercase tracking-[0.2em] text-black transition-all hover:border-black hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer [&_svg]:shrink-0";

  function validateEmail(value: string) {
    const normalizedEmail = normalizeEmail(value);

    if (!normalizedEmail) {
      setEmailError("Please enter your email address.");
      return null;
    }

    if (!isValidEmail(normalizedEmail)) {
      setEmailError("Please enter a valid email address.");
      return null;
    }

    setEmailError(null);
    return normalizedEmail;
  }

  function validateOtp(value: string) {
    const normalizedCode = normalizeOtp(value);

    if (!normalizedCode) {
      setCodeError("Please enter your verification code.");
      return null;
    }

    if (!isValidOtp(normalizedCode)) {
      setCodeError("Code must be 4 or 6 numbers.");
      return null;
    }

    setCodeError(null);
    return normalizedCode;
  }

  const resetCaptcha = useCallback(() => {
    setCaptchaToken(null);
    if (typeof window !== "undefined" && window.turnstile?.reset) {
      try {
        window.turnstile.reset();
      } catch {
        // no-op; Turnstile script handles logging
      }
    }
  }, []);

  // Turnstile calls these global functions when the captcha succeeds,
  // expires, or fails.
  useEffect(() => {
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

  // Continue with the existing signed-in session.
  const handleContinue = useCallback(() => {
    if (typeof window !== "undefined") {
      window.location.replace(redirect);
    }
  }, [redirect]);

  // Sign out so the user can log in with a different account.
  const handleSignOut = useCallback(async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    setStatus("Signing you out…");
    try {
      await logout();
      setSent(false);
      setCode("");
      setCodeError(null);
      resetCaptcha();
      setStatus("Signed out. Enter your email to continue.");
    } catch {
      setStatus("Could not sign you out. Please try again.");
    } finally {
      setIsSigningOut(false);
    }
  }, [logout, resetCaptcha, isSigningOut]);

  // Start Google auth, then return to the requested page.
  async function onGoogle() {
    setStatus(null);
    try {
      await googleSignIn();
      window.location.replace(redirect);
    } catch (e) {
      setStatus(null);
    }
  }

  // Request an email login code after captcha verification.
  async function onSend(e: FormEvent) {
    e.preventDefault();
    const emailValue = validateEmail(email);
    if (!emailValue) return;
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
      await requestOtp(emailValue, captchaToken);
      setSent(true);
      setStatus("Check your email for the next step.");
    } catch {
      setStatus("Could not send code. Please try again.");
    } finally {
      resetCaptcha();
    }
  }

  // Verify the email code, create a session, then redirect.
  async function onConfirm(e: FormEvent) {
    e.preventDefault();
    const emailValue = validateEmail(email);
    const codeValue = validateOtp(code);
    if (!emailValue || !codeValue) return;
    setStatus(null);
    try {
      await confirmOtp(emailValue, codeValue);
      window.location.replace(redirect);
    } catch {
      setStatus(null);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white px-3 py-6 sm:p-6 font-sans text-black relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="mb-12 text-center">
          <Link
            href="/"
            className="inline-block hover:opacity-70 transition-opacity"
          >
            <Logo
              size="xl"
              color="black"
              fontClassName="font-bold tracking-tight"
            />
          </Link>
        </div>

        <div className="bg-white px-5 py-8 sm:p-10 relative overflow-hidden border border-gray-200">
          <h1 className="text-3xl font-black text-black mb-2 text-center tracking-[-0.02em] uppercase">
            Sign In / Sign Up
          </h1>
          <p className="text-gray-500 text-[10px] text-center mb-10 font-bold tracking-[0.2em] uppercase">
            Access your studio dashboard
          </p>

          {/* Google Button */}
          <div className="mb-8">
            <GoogleButton
              onClick={onGoogle}
              disabled={busy}
              className={secondaryButtonClass}
            />
          </div>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest font-mono">
              <span className="bg-white px-4 text-gray-400">Or use email</span>
            </div>
          </div>

          {isAuthenticated ? (
            <div className="bg-gray-50 border border-gray-200 p-6 text-center rounded-sm">
              <p className="text-xs font-medium text-black mb-1 font-mono">
                ID: {user?.email}
              </p>
              <div className="flex flex-col gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleContinue}
                  className={primaryButtonClass}
                >
                  Proceed to Dashboard
                </button>
                <button
                  onClick={handleSignOut}
                  disabled={isSigningOut || busy}
                  className="text-[10px] text-gray-400 hover:text-black transition-colors uppercase tracking-[0.2em] font-bold cursor-pointer mt-2"
                >
                  {isSigningOut ? "Signing out..." : "Sign Out"}
                </button>
              </div>
            </div>
          ) : !sent ? (
            <form onSubmit={onSend} className="space-y-6" noValidate>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider ml-1">
                  Email
                </label>
                <Input
                  type="email"
                  value={email}
                  onBlur={(e) => {
                    if (e.target.value) validateEmail(e.target.value);
                  }}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError(null);
                  }}
                  placeholder="name@example.com"
                  aria-invalid={Boolean(emailError)}
                  aria-describedby={emailError ? "email-error" : undefined}
                  className="w-full bg-gray-50 border-gray-200 text-primary placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black rounded-none py-6 px-6 transition-all font-medium text-base h-14"
                  required
                />
                {emailError && (
                  <p
                    id="email-error"
                    className="mt-2 text-[10px] font-bold uppercase tracking-[0.15em] text-red-500"
                  >
                    {emailError}
                  </p>
                )}
              </div>

              {turnstileConfigured && (
                <div className="mb-4 flex h-[65px] w-full justify-center overflow-hidden">
                  <div
                    className="cf-turnstile w-[300px] shrink-0 origin-top scale-[0.86] min-[360px]:scale-95 sm:scale-100"
                    data-sitekey={
                      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ""
                    }
                    data-callback="cottonbroTurnstileCallback"
                    data-expired-callback="cottonbroTurnstileExpired"
                    data-error-callback="cottonbroTurnstileError"
                    data-size="flexible"
                    data-theme="dark"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={!email.trim() || busy}
                className={primaryButtonClass}
              >
                {busy ? "Sending..." : "Send Login Code"}
              </button>
            </form>
          ) : (
            <form onSubmit={onConfirm} className="space-y-6" noValidate>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider ml-1">
                  Enter Code
                </label>
                <Input
                  value={code}
                  onBlur={(e) => {
                    if (e.target.value) validateOtp(e.target.value);
                  }}
                  onChange={(e) => {
                    setCode(normalizeOtp(e.target.value));
                    if (codeError) setCodeError(null);
                  }}
                  placeholder="0000 or 000000"
                  maxLength={6}
                  aria-invalid={Boolean(codeError)}
                  aria-describedby={codeError ? "code-error" : undefined}
                  className="w-full bg-gray-50 border-gray-200 text-primary text-center text-3xl font-black placeholder:text-gray-300 focus:border-black focus:ring-1 focus:ring-black rounded-none py-6 px-4 tracking-[0.5em] transition-all font-mono h-20"
                  required
                />
                {codeError && (
                  <p
                    id="code-error"
                    className="mt-2 text-[10px] font-bold uppercase tracking-[0.15em] text-red-500"
                  >
                    {codeError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={!isValidOtp(code) || busy}
                className={primaryButtonClass}
              >
                {busy ? "Verifying..." : "Open Studio"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setSent(false);
                  setCode("");
                  setEmailError(null);
                  setCodeError(null);
                }}
                className="w-full text-[10px] font-bold text-gray-400 hover:text-black transition-colors uppercase tracking-[0.2em] cursor-pointer"
              >
                Use different email
              </button>
            </form>
          )}

          {/* Status Messages */}
          {status && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-3 bg-gray-50 border border-gray-200 text-center rounded-lg"
            >
              <p className="text-xs font-bold text-black">{status}</p>
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
          <Link href="#" className="hover:text-primary transition-colors">
            Privacy Policy
          </Link>
          <span className="mx-2">•</span>
          <Link href="#" className="hover:text-primary transition-colors">
            Terms of Service
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return <LoginView />;
}
