"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function ConfirmPage() {
  const params = useSearchParams();
  const presetEmail = params.get("email") || "";
  const [email, setEmail] = useState(presetEmail);
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busyConfirm, setBusyConfirm] = useState(false);
  const [busyResend, setBusyResend] = useState(false);

  const onConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (!email || !code)
      return setMsg("Enter your email and the code we sent.");
    setBusyConfirm(true);
    try {
      const res = await fetch("/api/auth/confirm", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      if (!res.ok) {
        const t = await res.text();
        return setMsg(
          t || "Confirmation failed. Check the code and try again."
        );
      }
      setMsg("Your account is confirmed. You can sign in now.");
      setTimeout(() => {
        window.location.href = "/auth/login";
      }, 1000);
    } finally {
      setBusyConfirm(false);
    }
  };

  const onResend = async () => {
    setMsg(null);
    if (!email) return setMsg("Enter your email first.");
    setBusyResend(true);
    try {
      const res = await fetch("/api/auth/confirm/resend", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const t = await res.text();
        return setMsg(t || "Could not resend code.");
      }
      setMsg("We sent a new code to your email.");
    } finally {
      setBusyResend(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-6 md:p-8">
        <h1 className="text-lg font-semibold mb-4">
          Cottonbro | Confirm your account
        </h1>

        {msg && (
          <p
            className="mb-3 rounded-md bg-gray-50 text-gray-700 text-sm px-3 py-2"
            aria-live="polite"
          >
            {msg}
          </p>
        )}

        <form onSubmit={onConfirm} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm text-gray-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-black focus:border-black"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="code" className="mb-1 block text-sm text-gray-700">
              Verification code
            </label>
            <input
              id="code"
              name="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              inputMode="numeric"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-black focus:border-black"
              placeholder="6-digit code"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={busyConfirm}
              className="rounded-lg bg-black text-white px-4 py-2.5 text-sm font-semibold hover:bg-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-black transition disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
            >
              {busyConfirm ? "Confirming…" : "Confirm"}
            </button>

            <button
              type="button"
              onClick={onResend}
              disabled={busyResend}
              className="text-sm underline underline-offset-4 hover:opacity-70 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {busyResend ? "Resending…" : "Resend code"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
