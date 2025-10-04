// lib/useSession.ts
"use client";

import { useEffect, useState } from "react";

type User = {
  sub?: string;
  email?: string;
  name?: string;
  picture?: string;
} | null;

export function useSession() {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const res = await fetch("/api/auth/session", {
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok) {
          if (alive) setUser(null);
          return;
        }
        const data = await res.json();
        if (alive) setUser(data.user ?? null);
      } catch (e) {
        console.error("Session fetch failed:", e);
        if (alive) setUser(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return { user, loading };
}
