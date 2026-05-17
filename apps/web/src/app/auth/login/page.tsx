"use client";

import { useAuth } from "@cottonplug/auth-react";
import {
  isValidEmail,
  isValidOtp,
  normalizeEmail,
  normalizeOtp,
} from "@cottonplug/utils";
import { Input, GoogleButton } from "@cottonplug/ui";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { safeRedirect } from "@/lib/auth-redirect";

// declare Turnstile’s HTML widget callbacks
declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback": () => void;
          "error-callback": () => void;
          size?: "normal" | "compact" | "flexible";
          theme?: "light" | "dark" | "auto";
        },
      ) => string;
      remove: (widgetId: string) => void;
      reset: (widgetId?: string) => void;
    };
  }
}

type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  hasError?: boolean;
};

function OtpInputFields({ value, onChange, hasError }: OtpInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const v = e.target.value.replace(/[^0-9]/g, "");
    if (!v) {
      const newCode = value.split("");
      newCode[index] = "";
      onChange(newCode.join(""));
      return;
    }

    // Support typing over an existing digit
    if (v.length > 1) {
      const lastChar = v[v.length - 1] ?? "";
      const newCode = value.split("");
      newCode[index] = lastChar;
      onChange(newCode.join(""));
      if (index < 5) {
        inputsRef.current[index + 1]?.focus();
      }
      return;
    }

    const newCode = value.split("");
    newCode[index] = v;
    onChange(newCode.join(""));

    if (index < 5 && v) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace") {
      if (!value[index] && index > 0) {
        inputsRef.current[index - 1]?.focus();
        const newCode = value.split("");
        newCode[index - 1] = "";
        onChange(newCode.join(""));
      } else {
        const newCode = value.split("");
        newCode[index] = "";
        onChange(newCode.join(""));
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/[^0-9]/g, "")
      .slice(0, 6);
    if (pasted) {
      onChange(pasted);
      const nextIndex = Math.min(pasted.length, 5);
      if (nextIndex < 6) {
        inputsRef.current[nextIndex]?.focus();
      } else {
        inputsRef.current[5]?.focus();
      }
    }
  };

  return (
    <div className="flex gap-2 sm:gap-3 justify-between w-full">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            inputsRef.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={2}
          value={value[i] || ""}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onPaste={handlePaste}
          className={`w-full aspect-square bg-gray-50 border border-gray-200 text-center text-xl sm:text-3xl font-black focus:border-black focus:ring-1 focus:ring-black rounded-xl transition-all font-mono placeholder:text-gray-300 outline-none ${hasError ? "border-red-500 focus:border-red-500 focus:ring-red-500 text-red-500" : "text-black"}`}
          placeholder="0"
          required
        />
      ))}
    </div>
  );
}

function LoginView() {
  const { requestOtp, confirmOtp, googleSignIn, busy, error, user } = useAuth();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const turnstileContainerRef = useRef<HTMLDivElement | null>(null);
  const turnstileWidgetIdRef = useRef<string | null>(null);
  const hasRedirectedRef = useRef(false);
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
  const turnstileConfigured = Boolean(turnstileSiteKey);

  const searchParams = useSearchParams();
  // Send users back to the protected page that redirected them here.
  const redirect = safeRedirect(searchParams?.get("redirect"));
  const isAuthenticated = Boolean(user);
  const primaryButtonClass =
    "w-full rounded-full bg-black px-4 py-5 sm:px-8 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-all hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer";
  const secondaryButtonClass =
    "w-full rounded-full border border-gray-200 bg-white px-4 py-5 sm:px-8 text-[10px] font-bold uppercase tracking-[0.2em] text-black transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer [&_svg]:shrink-0";
  const agreements = {
    privacyPolicyAccepted: true,
    termsAccepted: true,
  };

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
      setCodeError("Code must be 6 digits.");
      return null;
    }

    setCodeError(null);
    return normalizedCode;
  }

  const resetCaptcha = useCallback(() => {
    setCaptchaToken(null);
    if (typeof window !== "undefined" && window.turnstile?.reset) {
      try {
        window.turnstile.reset(turnstileWidgetIdRef.current ?? undefined);
      } catch {
        // no-op; Turnstile script handles logging
      }
    }
  }, []);

  // Render Turnstile explicitly so client navigation cannot miss the widget.
  useEffect(() => {
    if (typeof window === "undefined" || !turnstileConfigured) return;
    if (sent || isAuthenticated) return;

    let cancelled = false;
    let attempts = 0;
    let timer: number | undefined;

    const clearWidget = () => {
      const widgetId = turnstileWidgetIdRef.current;
      if (widgetId && window.turnstile?.remove) {
        try {
          window.turnstile.remove(widgetId);
        } catch {
          // The script owns widget cleanup errors.
        }
      }
      turnstileWidgetIdRef.current = null;
    };

    const renderWidget = () => {
      if (cancelled) return;
      const container = turnstileContainerRef.current;
      const turnstile = window.turnstile;

      if (!container || !turnstile?.render) {
        attempts += 1;
        if (attempts < 50) {
          timer = window.setTimeout(renderWidget, 100);
        }
        return;
      }

      clearWidget();
      turnstileWidgetIdRef.current = turnstile.render(container, {
        sitekey: turnstileSiteKey,
        callback: (token) => {
          setCaptchaToken(token);
          setStatus(null);
        },
        "expired-callback": () => {
          setCaptchaToken(null);
          setStatus(null);
        },
        "error-callback": () => {
          setCaptchaToken(null);
          setStatus(null);
        },
        size: "flexible",
        theme: "dark",
      });
    };

    renderWidget();

    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
      clearWidget();
    };
  }, [isAuthenticated, sent, turnstileConfigured, turnstileSiteKey]);

  useEffect(() => {
    if (!isAuthenticated || busy || hasRedirectedRef.current) return;
    if (typeof window !== "undefined") {
      hasRedirectedRef.current = true;
      setIsRedirecting(true);
      window.location.replace(redirect);
    }
  }, [busy, isAuthenticated, redirect]);

  // Start Google auth, then return to the requested page.
  async function onGoogle() {
    setStatus(null);
    setIsRedirecting(true);
    try {
      await googleSignIn(agreements);
      window.location.replace(redirect);
    } catch (e) {
      setIsRedirecting(false);
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
    setIsRedirecting(true);
    try {
      await confirmOtp(emailValue, codeValue, agreements);
      window.location.replace(redirect);
    } catch {
      setIsRedirecting(false);
      setStatus(null);
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-white font-sans text-black relative overflow-hidden">
      <div className="flex-1 flex items-center justify-center px-3 py-6 sm:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="bg-white px-5 py-8 sm:p-10 relative overflow-hidden border border-gray-200 rounded-3xl">
            <h1 className="text-3xl font-black text-black mb-2 text-center tracking-[-0.02em] uppercase">
              Continue to Cotton Plug
            </h1>
            <p className="text-gray-500 text-[10px] text-center mb-10 font-bold tracking-[0.2em] uppercase">
              Sign in or create an account to continue.
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
                <span className="bg-white px-4 text-gray-400">
                  Or use email
                </span>
              </div>
            </div>

            {isRedirecting || isAuthenticated ? (
              <div className="bg-gray-50 border border-gray-200 p-6 text-center rounded-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-black">
                  Redirecting...
                </p>
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
                    className="w-full bg-gray-50 border border-gray-200 text-primary placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black rounded-xl py-6 px-6 transition-all font-medium text-base h-14"
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
                  <div className="mb-4 flex min-h-16.25 w-full justify-center overflow-hidden">
                    <div ref={turnstileContainerRef} className="w-full" />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!email.trim() || busy}
                  className={primaryButtonClass}
                >
                  {busy ? "Sending..." : "Send Code"}
                </button>
              </form>
            ) : (
              <form onSubmit={onConfirm} className="space-y-6" noValidate>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider ml-1">
                    Enter 6-Digit Code
                  </label>
                  <div
                    onBlur={() => {
                      if (code.length === 6) validateOtp(code);
                    }}
                  >
                    <OtpInputFields
                      value={code}
                      onChange={(val) => {
                        setCode(val);
                        if (codeError) setCodeError(null);
                      }}
                      hasError={Boolean(codeError)}
                    />
                  </div>
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
                  {busy ? "Verifying..." : "Continue"}
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

            {!isAuthenticated && (
              <p className="mt-6 text-center text-[10px] font-bold uppercase tracking-[0.12em] leading-5 text-gray-400">
                By continuing, you agree to the{" "}
                <Link
                  href="#"
                  className="text-black border-b border-black hover:opacity-70 transition-opacity"
                >
                  Privacy Policy
                </Link>{" "}
                and{" "}
                <Link
                  href="#"
                  className="text-black border-b border-black hover:opacity-70 transition-opacity"
                >
                  Terms of Service
                </Link>
                .
              </p>
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
    </div>
  );
}

export default function LoginPage() {
  return <LoginView />;
}
