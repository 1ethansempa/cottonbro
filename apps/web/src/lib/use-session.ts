"use client";

import { useEffect, useState } from "react";

interface User {
  uid: string;
  email?: string | null;
  name?: string | null;
  picture?: string | null;
}

interface SessionResult {
  user: User | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

export function useSession(): SessionResult {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSession = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/session", {
        credentials: "include",
      });
      if (!res.ok) {
        setUser(null);
      } else {
        const data = await res.json();
        setUser(data.user ?? null);
      }
    } catch (err) {
      console.error("Failed to fetch session:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  return { user, loading, refresh: fetchSession };
}
