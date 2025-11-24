"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function AuthRedirect() {
  const pathname = usePathname();

  useEffect(() => {
    const redirectUrl = `/auth/login?redirect=${encodeURIComponent(pathname)}`;
    window.location.replace(redirectUrl);
  }, [pathname]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-6">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-200 border-t-black" />
        <p className="text-sm font-bold uppercase tracking-widest text-zinc-500 animate-pulse">
          Redirecting...
        </p>
      </div>
    </div>
  );
}
