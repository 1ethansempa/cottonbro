"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@cottonbro/auth-react";
import { useRouter } from "next/navigation";
import { publicEnv } from "@/config/env";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [sessionValid, setSessionValid] = useState(false);

  // Use NEXT_PUBLIC_API_BASE_URL with /v1/auth suffix, fallback to /api/auth for local
  const authBaseUrl = useMemo(() => {
    const base = publicEnv.API_BASE_URL?.trim();
    return base && base.length > 0 ? `${base}/v1/auth` : "/api/auth";
  }, []);

  useEffect(() => {
    // Firebase auth state takes a moment to restore from persistence
    // Wait for loading to finish, then give it a tick to settle
    if (!loading) {
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  useEffect(() => {
    let cancelled = false;
    const checkSession = async () => {
      try {
        const response = await fetch(`${authBaseUrl}/session`, {
          method: "GET",
          credentials: "include",
        });
        if (!cancelled) {
          setSessionValid(response.ok);
          setSessionChecked(true);
        }
      } catch {
        if (!cancelled) {
          setSessionValid(false);
          setSessionChecked(true);
        }
      }
    };

    checkSession();
    return () => {
      cancelled = true;
    };
  }, [authBaseUrl]);

  useEffect(() => {
    // Only redirect after auth state is ready and we confirm no user
    if (isReady && sessionChecked && !user && !sessionValid) {
      const currentPath = window.location.pathname;
      router.push(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [isReady, sessionChecked, sessionValid, user, router]);

  // Show loading spinner until auth state is confirmed
  if (!sessionChecked || (!isReady && !sessionValid) || (!user && loading)) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Redirect is happening
  if (!user && !sessionValid) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
