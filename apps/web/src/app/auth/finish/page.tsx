"use client";
import { useEffect, useState } from "react";
import { clientAuth } from "@/lib/firebase-client";
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";

export default function Finish() {
  const [status, setStatus] = useState("Verifying link…");

  useEffect(() => {
    (async () => {
      try {
        if (!isSignInWithEmailLink(clientAuth, window.location.href)) {
          setStatus("Invalid or expired link.");
          return;
        }
        let email =
          window.localStorage.getItem("cb.emailForSignIn") ||
          window.prompt("Confirm your email") ||
          "";
        if (!email) throw new Error("Email required");

        const cred = await signInWithEmailLink(
          clientAuth,
          email,
          window.location.href
        );
        window.localStorage.removeItem("cb.emailForSignIn");

        const idToken = await cred.user.getIdToken();
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "content-type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ idToken }),
        });
        if (!res.ok) throw new Error("Session establishment failed");

        setStatus("Success! Redirecting…");
        location.replace("/");
      } catch (e) {
        console.error(e);
        setStatus("Could not complete sign-in.");
      }
    })();
  }, []);

  return <p className="p-6">{status}</p>;
}
