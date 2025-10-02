"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"request" | "confirm">("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const request = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (!email) return setMsg("Enter your email.");
    setBusy(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const t = await res.text();
        return setMsg(t || "Could not send reset code.");
      }
      setMsg("We sent a reset code to your email.");
      setStep("confirm");
    } finally {
      setBusy(false);
    }
  };

  const confirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (!email || !code || !password) return setMsg("Fill all fields.");
    setBusy(true);
    try {
      const res = await fetch("/api/auth/forgot-password/confirm", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, code, password }),
      });
      if (!res.ok) {
        const t = await res.text();
        return setMsg(t || "Password reset failed.");
      }
      setMsg("Password updated. Redirecting to sign in…");
      setTimeout(() => (window.location.href = "/auth/login"), 1500);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-6 md:p-8">
        <h1 className="text-lg font-semibold mb-4">Reset your password</h1>
        {msg && (
          <p className="mb-3 rounded-md bg-gray-50 text-gray-700 text-sm px-3 py-2">
            {msg}
          </p>
        )}

        {step === "request" ? (
          <form onSubmit={request} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-black focus:border-black"
                placeholder="you@example.com"
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-lg bg-black text-white px-4 py-2.5 text-sm font-semibold hover:bg-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-black transition disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
            >
              {busy ? "Sending…" : "Send reset code"}
            </button>
          </form>
        ) : (
          <form onSubmit={confirm} className="space-y-4">
            <div>
              <label
                htmlFor="code"
                className="mb-1 block text-sm text-gray-700"
              >
                Code
              </label>
              <input
                id="code"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-black focus:border-black"
                placeholder="6-digit code"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-sm text-gray-700"
              >
                New password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-black focus:border-black"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-lg bg-black text-white px-4 py-2.5 text-sm font-semibold hover:bg-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-black transition disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
            >
              {busy ? "Updating…" : "Update password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
