"use client";
import { useEffect, useState } from "react";

export default function CallbackPage() {
  const [msg, setMsg] = useState("Completing sign-in…");

  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const storedState = sessionStorage.getItem("oauth_state");
    const verifier = sessionStorage.getItem("pkce_verifier");

    if (!code) {
      setMsg("Missing authorization code.");
      return;
    }
    if (!verifier) {
      setMsg("Missing PKCE verifier. Please try signing in again.");
      return;
    }
    if (!state || state !== storedState) {
      setMsg("State mismatch.");
      return;
    }

    (async () => {
      const res = await fetch("/api/auth/callback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code, codeVerifier: verifier }),
        credentials: "include",
      });
      if (res.ok) {
        // cleanup
        sessionStorage.removeItem("pkce_verifier");
        sessionStorage.removeItem("oauth_state");
        window.location.replace("/");
      } else {
        const t = await res.text();
        setMsg(`Sign-in failed: ${t}`);
      }
    })();
  }, []);

  return <p className="p-6 text-sm text-gray-700">{msg}</p>;
}
