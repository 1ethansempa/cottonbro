"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowUpRightIcon,
  CheckCircleIcon,
  CircleNotchIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { useUserStore } from "@/stores/user-store";

function RestoreAccountView() {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token") ?? "";
  const { restoreAccountStatus, restoreAccount, resetRestoreAccount } =
    useUserStore();

  useEffect(() => {
    restoreAccount(token);

    return () => {
      resetRestoreAccount();
    };
  }, [resetRestoreAccount, restoreAccount, token]);

  const content = {
    loading: {
      eyebrow: "Account restoration",
      title: "Restoring your account.",
      body: "Give us a moment while we bring your Cotton Bro account back.",
      status: "Checking restore link",
      accent: "bg-black text-white",
      icon: (
        <CircleNotchIcon className="h-5 w-5 animate-spin" aria-hidden="true" />
      ),
    },
    success: {
      eyebrow: "Account restored",
      title: "Your account is restored.",
      body: "You can sign in again and continue where you left off.",
      status: "Ready to sign in",
      accent: "bg-black text-white",
      icon: <CheckCircleIcon className="h-5 w-5" aria-hidden="true" />,
    },
    error: {
      eyebrow: "Restore unavailable",
      title: "This restore link is not available.",
      body: "The link may have expired or already been used. Request a new restore email from the sign-in page.",
      status: "Link unavailable",
      accent: "bg-[#e60000] text-white",
      icon: <WarningCircleIcon className="h-5 w-5" aria-hidden="true" />,
    },
  }[restoreAccountStatus];

  return (
    <div className="min-h-screen bg-white font-sans text-black selection:bg-black selection:text-white">
      <SiteHeader theme="light" />

      <main className="flex min-h-screen flex-col pt-[72px]">
        <section className="grid flex-1 grid-cols-1 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col justify-center px-8 py-20 md:px-[8%]">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="max-w-xl"
            >
              <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.18em] text-black/45">
                {content.eyebrow}
              </p>
              <h1 className="mb-8 text-[54px] font-bold leading-[0.92] text-black md:text-[72px] lg:text-[92px]">
                {content.title}
              </h1>
              <p className="mb-10 max-w-md text-base font-medium leading-relaxed text-black/60">
                {content.body}
              </p>

              {restoreAccountStatus !== "loading" ? (
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/auth/login"
                    className="group inline-flex cursor-pointer items-center justify-center rounded-full bg-black px-8 py-4 text-xs font-semibold tracking-wide text-white transition-all hover:opacity-80"
                  >
                    Go to sign in
                    <ArrowUpRightIcon
                      className="h-3.5 w-0 -translate-x-2 opacity-0 transition-all duration-300 group-hover:ml-2 group-hover:w-3.5 group-hover:translate-x-0 group-hover:opacity-100"
                      weight="regular"
                      aria-hidden="true"
                    />
                  </Link>
                  <Link
                    href="/"
                    className="group inline-flex cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white px-8 py-4 text-xs font-semibold tracking-wide text-black transition-all hover:bg-gray-50"
                  >
                    Back home
                    <ArrowUpRightIcon
                      className="h-3.5 w-0 -translate-x-2 opacity-0 transition-all duration-300 group-hover:ml-2 group-hover:w-3.5 group-hover:translate-x-0 group-hover:opacity-100"
                      weight="regular"
                      aria-hidden="true"
                    />
                  </Link>
                </div>
              ) : (
                <div className="inline-flex items-center gap-3 text-xs font-semibold tracking-wide text-black/55">
                  <CircleNotchIcon
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                  Loading ....
                </div>
              )}
            </motion.div>
          </div>

          <div className="flex min-h-[420px] flex-col justify-end bg-[#111] p-6 text-white md:p-10 lg:min-h-full">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1, ease: "easeOut" }}
              className="border border-white/10 bg-black p-7 shadow-2xl md:p-9"
            >
              <div
                className={`mb-8 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] ${content.accent}`}
              >
                {content.icon}
                {content.status}
              </div>

              <div className="space-y-5 border-t border-white/10 pt-7">
                <div className="flex items-start justify-between gap-8">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/45">
                      Account
                    </p>
                    <p className="mt-2 text-sm font-semibold text-white">
                      Cotton Bro access
                    </p>
                  </div>
                  <span className="h-2.5 w-2.5 rounded-full bg-[#e60000]" />
                </div>

                <p className="max-w-sm text-sm font-medium leading-relaxed text-white/55">
                  Restore links are single-use and time limited. If this one no
                  longer works, sign in again to request a fresh recovery email.
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <SiteFooter theme="dark" disableLinks />
    </div>
  );
}

export default function RestoreAccountPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white font-sans text-black">
          <SiteHeader theme="light" />
          <main className="flex min-h-screen items-center justify-center px-6 pt-[72px]">
            <div className="inline-flex items-center gap-3 text-xs font-semibold tracking-wide text-black/55">
              <CircleNotchIcon
                className="h-4 w-4 animate-spin"
                aria-hidden="true"
              />
              Loading ....
            </div>
          </main>
        </div>
      }
    >
      <RestoreAccountView />
    </Suspense>
  );
}
