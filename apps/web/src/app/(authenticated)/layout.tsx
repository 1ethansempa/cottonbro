"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { getClientAuth } from "@/lib/firebase-client";
import { useRouter } from "next/navigation";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const clientAuth = getClientAuth();
    if (!clientAuth) {
      setAuthReady(true);
      return;
    }

    // Listen directly to Firebase auth state changes
    // This fires once auth state is restored from IndexedDB
    const unsubscribe = onAuthStateChanged(clientAuth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!authReady) return;

    if (!user) {
      const currentPath = window.location.pathname;
      router.push(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    let cancelled = false;

    const verifyBackendSession = async () => {
      const clientAuth = getClientAuth();

      try {
        const response = await fetch("/api/auth/session", {
          credentials: "include",
        });

        if (response.ok || cancelled) return;
      } catch {
        if (cancelled) return;
      }

      await clientAuth?.signOut().catch(() => {
        // The backend session is gone; clear Firebase-only state as best effort.
      });

      if (!cancelled) {
        const currentPath = window.location.pathname;
        router.push(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
      }
    };

    verifyBackendSession();

    return () => {
      cancelled = true;
    };
  }, [authReady, user, router]);

  // Show loading until Firebase auth state is ready
  if (!authReady) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // No user after auth ready = redirect happening
  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
