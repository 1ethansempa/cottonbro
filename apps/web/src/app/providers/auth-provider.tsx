"use client";

import React from "react";
import { AuthProvider } from "@cottonbro/auth-react";
import { clientAuth } from "@/lib/firebase-client";

export default function WebAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_AUTH_BASE_URL?.trim() || "/api/auth";

  return (
    <AuthProvider
      auth={clientAuth}
      endpoints={{
        startOtp: `${apiBaseUrl}/otp/start`,
        verifyOtp: `${apiBaseUrl}/otp/verify`,
        login: `${apiBaseUrl}/login`,
        logout: `${apiBaseUrl}/logout`,
      }}
      sessionTtlMs={14 * 24 * 60 * 60 * 1000} //14 days
    >
      {children}
    </AuthProvider>
  );
}
