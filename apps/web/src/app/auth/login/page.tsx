"use client";

import * as React from "react";
import GoogleIcon from "@/components/google-icon";
import { useAuth } from "@cottonbro/auth-react";

export default function LoginPage() {
  const { requestOtp, confirmOtp, googleSignIn, busy, error } = useAuth();

  const [email, setEmail] = React.useState("");
  const [code, setCode] = React.useState("");
  const [sent, setSent] = React.useState(false);
  const [status, setStatus] = React.useState<string | null>(null);

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
    setStatus(null);
    try {
      await requestOtp(email.trim());
      setSent(true);
      setStatus("Code sent. Check your inbox.");
    } catch (e) {
      setStatus("Could not send code. Please try again.");
    }
  }

  async function onConfirm(e: React.FormEvent) {
    e.preventDefault();
    if (!email || code.length !== 6) return;
    setStatus(null);
    try {
      await confirmOtp(email.trim(), code.trim());
      window.location.replace(redirect);
    } catch (e) {
      setStatus("Invalid code. Please try again.");
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-6 py-12 bg-white text-black selection:bg-street-red selection:text-white">
      <div className="w-full max-w-md">
        <div className="relative bg-white border-2 border-black p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="mb-8 text-center">
            <h1 className="font-jamino text-4xl uppercase text-black">
              Authentication
            </h1>
            <p className="mt-2 text-sm font-bold text-black uppercase tracking-widest">
              Sign in or create an account
            </p>
          </div>

          <div className="mb-6">
            <button
              type="button"
              onClick={onGoogle}
              disabled={busy}
              className="w-full inline-flex items-center justify-center gap-3 border-2 border-black bg-white px-4 py-3 text-sm font-bold uppercase tracking-widest text-black hover:bg-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-black transition cursor-pointer disabled:opacity-60"
            >
              <GoogleIcon />
              Continue with Google
            </button>
          </div>

          <div className="relative my-8">
            <div className="h-0.5 w-full bg-black" />
            <span className="absolute inset-0 -top-3 mx-auto w-fit px-3 text-xs font-bold uppercase tracking-widest text-black bg-white">
              or
            </span>
          </div>

          {!sent ? (
            <form onSubmit={onSend} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="mb-1 block text-sm font-bold uppercase tracking-widest text-black"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border-2 border-black bg-white px-3 py-2 text-sm font-medium text-black placeholder:text-zinc-400 outline-none focus:border-street-red transition"
                  placeholder="you@example.com"
                />
              </div>

              <button
                type="submit"
                disabled={!email || busy}
                className="mt-4 w-full bg-black text-white px-4 py-3 text-sm font-bold uppercase tracking-widest hover:bg-street-red focus:outline-none focus-visible:ring-2 focus-visible:ring-black transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {busy ? "Sending…" : "Send code"}
              </button>
            </form>
          ) : (
            <form onSubmit={onConfirm} className="space-y-4">
              <div>
                <label
                  htmlFor="code"
                  className="mb-1 block text-sm font-bold uppercase tracking-widest text-black"
                >
                  6-digit code
                </label>
                <input
                  id="code"
                  name="code"
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  className="w-full tracking-[1em] text-center border-2 border-black bg-white px-3 py-2 text-sm font-bold text-black placeholder:text-zinc-400 outline-none focus:border-street-red transition"
                  placeholder="••••••"
                />
              </div>

              <button
                type="submit"
                disabled={code.length !== 6 || busy}
                className="mt-4 w-full bg-black text-white px-4 py-3 text-sm font-bold uppercase tracking-widest hover:bg-street-red focus:outline-none focus-visible:ring-2 focus-visible:ring-black transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {busy ? "Verifying…" : "Confirm"}
              </button>

              <button
                type="button"
                onClick={onSend}
                disabled={busy}
                className="w-full text-sm font-bold uppercase tracking-widest text-zinc-500 underline underline-offset-4 mt-4 hover:text-black transition"
              >
                Resend code
              </button>
            </form>
          )}

          {(status || error) && (
            <p className="mt-4 text-center text-sm text-red-400">
              {status || error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
