"use client";
import { useEffect, useRef } from "react";

export default function AuthSessionKeeper() {
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    let stopped = false;

    const schedule = (expiresAtMs: number | null) => {
      if (!expiresAtMs) return;
      const now = Date.now();
      const ttl = Math.max(0, expiresAtMs - now);
      const delay = Math.min(
        Math.max(Math.floor(ttl * 0.85), 15_000),
        10 * 60_000
      );
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(
        doRefresh,
        delay
      ) as unknown as number;
    };

    const doRefresh = async () => {
      try {
        const r = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include",
        });
        if (!r.ok) {
          // retry a bit later
          setTimeout(check, 30_000);
          return;
        }
        await check();
      } catch {
        setTimeout(check, 30_000);
      }
    };

    const check = async () => {
      if (stopped) return;
      const res = await fetch("/api/auth/session", {
        credentials: "include",
        cache: "no-store",
      });

      if (res.status === 401) {
        console.info("[AuthKeeper] session ended");
        stopped = true;
        if (timerRef.current) window.clearTimeout(timerRef.current);
        return;
      }

      const data = await res.json();
      if (data?.needsRefresh) {
        await doRefresh();
        return;
      }

      schedule(typeof data?.expiresAt === "number" ? data.expiresAt : null);
    };

    check();

    return () => {
      stopped = true;
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  return null;
}
