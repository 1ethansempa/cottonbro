"use client";

import React from "react";
import type { Auth } from "firebase/auth";
import { AuthProvider } from "@cottonbro/auth-react";
import { getClientAuth } from "@/lib/firebase-client";

export default function WebAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [clientAuth] = React.useState<Auth | null>(() => {
    if (typeof window === "undefined") return null;
    return getClientAuth();
  });

  return <AuthProvider auth={clientAuth}>{children}</AuthProvider>;
}
