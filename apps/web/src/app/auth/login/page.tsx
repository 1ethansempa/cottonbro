"use client";

import React, { useState } from "react";
import GoogleIcon from "../../../components/google-icon";
import { clientAuth } from "@/lib/firebase-client";
import {
  sendSignInLinkToEmail,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

const CONTINUE_URL = process.env.NEXT_PUBLIC_EMAIL_LINK_CONTINUE_URL!;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setBusy(true);
    setStatus(null);
    try {
      await sendSignInLinkToEmail(clientAuth, email.trim(), {
        url: CONTINUE_URL,
        handleCodeInApp: true,
      });

      window.localStorage.setItem("cb.emailForSignIn", email.trim());
      setStatus("Link sent. Check your inbox.");
    } catch (err) {
      console.error(err);
      setStatus("Could not send link. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function onGoogle() {
    setBusy(true);
    setStatus(null);
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(clientAuth, provider);
      const idToken = await cred.user.getIdToken();

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ idToken }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "Failed to establish session");
      }
      window.location.replace("/");
    } catch (err) {
      console.error("Google sign-in failed:", err);
      setStatus("Google sign-in failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const canSend = !!email && !busy;

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="relative rounded-2xl bg-white shadow-xl p-6 md:p-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              Authentication
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Sign in or create an account
            </p>
          </div>

          <div className="mb-6">
            <button
              type="button"
              onClick={onGoogle}
              disabled={busy}
              className="w-full inline-flex items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-black transition cursor-pointer disabled:opacity-60"
            >
              <GoogleIcon />
              Continue with Google
            </button>
          </div>

          <div className="relative my-6">
            <div className="h-px w-full bg-gray-200" />
            <span className="absolute inset-0 -top-3 mx-auto w-fit px-3 text-[11px] uppercase tracking-wider text-gray-500 bg-white">
              or
            </span>
          </div>

          <form onSubmit={sendMagicLink} className="space-y-4">
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-black focus:border-black"
                placeholder="you@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={!canSend}
              className="mt-2 w-full rounded-lg bg-gray-950/90 text-white px-4 py-2.5 text-sm font-semibold tracking-wide hover:bg-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-black transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {busy ? "Sending Link…" : "Continue with Email"}
            </button>
          </form>

          {status && (
            <p className="mt-4 text-center text-sm text-gray-600">{status}</p>
          )}
        </div>
      </div>
    </div>
  );
}
