"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@cottonplug/auth-react";

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
      <div className="min-h-screen bg-white text-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent" />
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // No user after auth ready = redirect happening
  if (!user) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent" />
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
