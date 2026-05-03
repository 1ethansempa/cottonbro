"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@cottonbro/auth-react";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { loading, logout, networkRequest, user } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      const currentPath = window.location.pathname;
      router.push(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    let cancelled = false;

    const verifyBackendSession = async () => {
      try {
        const response = await networkRequest("/api/auth/session");

        if (response.ok || cancelled) return;
      } catch {
        if (cancelled) return;
      }

      await logout();

      if (!cancelled) {
        const currentPath = window.location.pathname;
        router.push(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
      }
    };

    verifyBackendSession();

    return () => {
      cancelled = true;
    };
  }, [loading, logout, networkRequest, user, router]);

  // Show loading until Firebase auth state is ready
  if (loading) {
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
