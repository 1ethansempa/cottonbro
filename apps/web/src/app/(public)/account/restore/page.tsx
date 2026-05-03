"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Logo } from "@cottonbro/ui";

type RestoreState = "loading" | "success" | "error";

function RestoreAccountView() {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token") ?? "";
  const [state, setState] = useState<RestoreState>("loading");

  useEffect(() => {
    let cancelled = false;

    async function restoreAccount() {
      if (!token) {
        setState("error");
        return;
      }

      try {
        const res = await fetch("/api/auth/restore", {
          method: "POST",
          credentials: "include",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        if (!res.ok) {
          throw new Error("restore_failed");
        }

        if (!cancelled) {
          setState("success");
        }
      } catch {
        if (!cancelled) {
          setState("error");
        }
      }
    }

    restoreAccount();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const content = {
    loading: {
      title: "Restoring your account.",
      body: "Give us a moment while we bring your Cotton Bro account back.",
    },
    success: {
      title: "Your account is restored.",
      body: "You can sign in again and keep building your next drop.",
    },
    error: {
      title: "This restore link is not available.",
      body: "The link may have expired or already been used. Request a new restore email from the sign-in page.",
    },
  }[state];

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white px-3 py-6 sm:p-6 font-sans text-black">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-md"
      >
        <div className="mb-12 text-center">
          <Link href="/" className="inline-block hover:opacity-70 transition-opacity">
            <Logo
              size="xl"
              color="black"
              fontClassName="font-bold tracking-tight"
            />
          </Link>
        </div>

        <div className="border border-gray-200 bg-white px-5 py-8 text-center sm:p-10">
          <p className="mb-4 text-xs font-semibold tracking-wide text-black/50">
            Account restoration
          </p>
          <h1 className="mb-4 text-4xl font-bold leading-[0.98] text-black">
            {content.title}
          </h1>
          <p className="mx-auto mb-8 max-w-sm text-sm font-medium leading-relaxed text-black/60">
            {content.body}
          </p>

          {state !== "loading" && (
            <Link
              href="/auth/login"
              className="inline-flex w-full items-center justify-center border border-black bg-black px-8 py-5 text-xs font-semibold tracking-wide text-white transition-all hover:opacity-80"
            >
              Go to sign in
            </Link>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function RestoreAccountPage() {
  return (
    <Suspense fallback={null}>
      <RestoreAccountView />
    </Suspense>
  );
}
