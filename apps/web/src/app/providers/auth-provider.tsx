"use client";

import React from "react";
import type { Auth } from "firebase/auth";
import { IconContext } from "@phosphor-icons/react";
import { AuthProvider, useAuth } from "@cottonbro/auth-react";
import { getClientAuth } from "@/lib/firebase-client";

function AuthBootGate({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-white text-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4" lang="en">
          <div
            aria-label="Loading"
            className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent"
          />
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function WebAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [clientAuth] = React.useState<Auth | null>(() => {
    if (typeof window === "undefined") return null;
    return getClientAuth();
  });

  return (
    <IconContext.Provider value={{ weight: "duotone" }}>
      <AuthProvider auth={clientAuth}>
        <AuthBootGate>{children}</AuthBootGate>
      </AuthProvider>
    </IconContext.Provider>
  );
}
