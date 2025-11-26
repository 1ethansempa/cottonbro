"use client";

import React from "react";
import { AuthProvider } from "@cottonbro/auth-react";
import { clientAuth } from "@/lib/firebase-client";

export default function WebAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Wraps the shared AuthProvider with app-specific endpoints/env-driven TTL +
  // refresh cadence so the web app can tune session behavior without duplicating logic.
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_AUTH_BASE_URL?.trim() || "/api/auth";
  // Session TTL defaults to 14 days but can be overridden per environment for quicker expiry.
  const defaultSessionTtlMs = 14 * 24 * 60 * 60 * 1000;
  const configuredTtlMs = Number(
    process.env.NEXT_PUBLIC_SESSION_TTL_MS?.trim() || ""
  );
  const sessionTtlMs =
    Number.isFinite(configuredTtlMs) && configuredTtlMs > 0
      ? configuredTtlMs
      : defaultSessionTtlMs;
  // Auto-refresh the session well before TTL expiry; env var lets us tune the cadence.
  const configuredRefreshMs = Number(
    process.env.NEXT_PUBLIC_SESSION_REFRESH_INTERVAL_MS?.trim() || ""
  );

  //Refresh at most every 12 hours.Refresh at least every 1 hour.Ideally: refresh every 1/4 of the session lifetime.
  const fallbackRefreshMs = Math.min(
    12 * 60 * 60 * 1000,
    Math.max(60 * 60 * 1000, Math.floor(sessionTtlMs / 4))
  );
  const sessionRefreshIntervalMs =
    Number.isFinite(configuredRefreshMs) && configuredRefreshMs > 0
      ? configuredRefreshMs
      : fallbackRefreshMs;

  return (
    <AuthProvider
      auth={clientAuth}
      endpoints={{
        startOtp: `${apiBaseUrl}/otp/start`,
        verifyOtp: `${apiBaseUrl}/otp/verify`,
        login: `${apiBaseUrl}/login`,
        logout: `${apiBaseUrl}/logout`,
      }}
      sessionTtlMs={sessionTtlMs}
      sessionRefreshIntervalMs={sessionRefreshIntervalMs}
    >
      {children}
    </AuthProvider>
  );
}
