import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Auth as FirebaseAuth, User, IdTokenResult } from "firebase/auth";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCustomToken,
  onIdTokenChanged,
  onAuthStateChanged,
} from "firebase/auth";

const MIN_REFRESH_INTERVAL_MS = 60 * 1000;
const MAX_REFRESH_INTERVAL_MS = 12 * 60 * 60 * 1000;

/**
 * Central auth wiring: wraps Firebase, handles OTP + Google sign-in, exchanges ID
 * tokens for backend session cookies, and keeps claims fresh via periodic refresh.
 */

// Types

export type AuthRole = "User" | "Admin" | string | undefined;

export interface Endpoints {
  startOtp: string; // POST { email }
  verifyOtp: string; // POST { email, code } -> { customToken }
  login: string; // POST { idToken, ttlMs? }
  logout: string; // POST
}

export interface AuthContextConfig {
  auth: FirebaseAuth;
  endpoints: Endpoints;
  onSession?: (args: { idToken: string; user: User }) => void;
  onLogout?: () => void;
  allowAutoLink?: boolean;
  keepClientSignedIn?: boolean;
  /** Optional: override ttlMs sent on login (e.g., 7d for admin) */
  sessionTtlMs?: number;
  /** Optional: how often to refresh ID token + session cookie (ms) */
  sessionRefreshIntervalMs?: number;
}

export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  claims: IdTokenResult["claims"] | null;
  role: AuthRole;
  refreshIdToken: () => Promise<string | null>;
  requestOtp: (email: string, captchaToken: string) => Promise<void>;
  confirmOtp: (email: string, code: string) => Promise<void>;
  googleSignIn: () => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  busy: boolean;
}

// Context
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Provider
export const AuthProvider: React.FC<
  React.PropsWithChildren<AuthContextConfig>
> = ({
  auth,
  endpoints,
  onSession,
  onLogout,
  allowAutoLink = true,
  keepClientSignedIn = true,
  sessionTtlMs,
  sessionRefreshIntervalMs,
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [claims, setClaims] = useState<IdTokenResult["claims"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  // Derived role from custom claims
  const role = (claims?.role as AuthRole) ?? undefined;

  // Lifecycle: track mount + sync auth state/claims
  useEffect(() => {
    mounted.current = true;

    const unsubAuth = onAuthStateChanged(auth, (u) => setUser(u));
    const unsubToken = onIdTokenChanged(auth, async (u) => {
      if (!u) {
        setClaims(null);
        return;
      }
      try {
        const res = await u.getIdTokenResult();
        if (mounted.current) setClaims(res.claims);
      } catch {
        // ignore
      }
    });

    setLoading(false);

    return () => {
      mounted.current = false;
      unsubAuth();
      unsubToken();
    };
  }, [auth]);

  // Helpers

  // POST JSON with cookies + surfaced errors.
  const postJson = useCallback(async (url: string, body: unknown) => {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body ?? {}),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || `Request failed: ${res.status}`);
    }

    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return res.json();
    }

    return undefined;
  }, []);

  // Wrap async actions with busy/error bookkeeping.
  const runWithBusy = useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T> => {
      setError(null);
      setBusy(true);
      try {
        return await fn();
      } finally {
        if (mounted.current) setBusy(false);
      }
    },
    []
  );

  // Mint/refresh the backend session cookie from a Firebase ID token.
  const syncSessionCookie = useCallback(
    async (u: User, emitSessionEvent = true) => {
      const idToken = await u.getIdToken(true);
      await postJson(endpoints.login, { idToken, ttlMs: sessionTtlMs });
      if (emitSessionEvent) onSession?.({ idToken, user: u });
      return idToken;
    },
    [endpoints.login, onSession, postJson, sessionTtlMs]
  );

  // Exchange Firebase ID token for our session cookie, optionally sign out client.
  const establishSession = useCallback(
    async (u: User) => {
      await syncSessionCookie(u, true);
      if (!keepClientSignedIn) {
        await auth.signOut();
      }
    },
    [syncSessionCookie, keepClientSignedIn, auth]
  );

  // Public actions

  // Kick off OTP flow.
  const requestOtp = useCallback<AuthContextValue["requestOtp"]>(
    async (email, captchaToken) =>
      runWithBusy(async () => {
        const e = email.trim();
        const token = captchaToken?.trim();
        if (!e) throw new Error("email_required");
        if (!token) throw new Error("captcha_required");
        await postJson(endpoints.startOtp, { email: e, captchaToken: token });
      }),
    [endpoints.startOtp, postJson, runWithBusy]
  );

  // Verify OTP -> sign in -> mint cookie.
  const confirmOtp = useCallback<AuthContextValue["confirmOtp"]>(
    async (email, code) =>
      runWithBusy(async () => {
        try {
          const e = email.trim();
          const c = code.trim();
          if (!e || !c) throw new Error("invalid_otp_payload");

          const data = (await postJson(endpoints.verifyOtp, {
            email: e,
            code: c,
          })) as { customToken: string } | undefined;

          if (!data?.customToken) throw new Error("missing_custom_token");

          const cred = await signInWithCustomToken(auth, data.customToken);
          await establishSession(cred.user);
        } catch (err: any) {
          if (mounted.current) {
            setError(err?.message ?? "otp_verify_failed");
          }
          throw err;
        }
      }),
    [auth, endpoints.verifyOtp, establishSession, postJson, runWithBusy]
  );

  // Google OAuth; links existing OTP account when allowed.
  const googleSignIn = useCallback<AuthContextValue["googleSignIn"]>(
    async () =>
      runWithBusy(async () => {
        try {
          const provider = new GoogleAuthProvider();

          // When auto-linking and already signed in, treat popup as "link".
          if (allowAutoLink && auth.currentUser) {
            const result = await signInWithPopup(auth, provider);
            await establishSession(result.user);
            return;
          }

          const result = await signInWithPopup(auth, provider);
          await establishSession(result.user);
        } catch (e: any) {
          if (e?.code === "auth/account-exists-with-different-credential") {
            setError(
              "Account exists with a different sign-in method. Sign in with email, then add Google."
            );
          } else {
            setError(e?.message ?? "google_signin_failed");
          }
          throw e;
        }
      }),
    [allowAutoLink, auth, establishSession, runWithBusy]
  );

  // Refresh Firebase token + claims + cookie.
  const refreshIdToken = useCallback<
    AuthContextValue["refreshIdToken"]
  >(async () => {
    try {
      if (!auth.currentUser) return null;
      const token = await syncSessionCookie(auth.currentUser, false);
      const info = await auth.currentUser.getIdTokenResult();
      if (mounted.current) setClaims(info.claims);
      return token;
    } catch {
      return null;
    }
  }, [auth, syncSessionCookie]);

  // Periodic refresh to keep cookie + claims warm.
  useEffect(() => {
    const baseInterval =
      typeof sessionRefreshIntervalMs === "number"
        ? sessionRefreshIntervalMs
        : sessionTtlMs
          ? Math.floor(sessionTtlMs / 2)
          : undefined;
    const intervalMs =
      baseInterval && baseInterval > 0
        ? Math.max(
            MIN_REFRESH_INTERVAL_MS,
            Math.min(baseInterval, MAX_REFRESH_INTERVAL_MS)
          )
        : undefined;
    if (!user || !intervalMs) return undefined;

    const id = setInterval(() => {
      refreshIdToken().catch(() => {});
    }, intervalMs);
    return () => clearInterval(id);
  }, [refreshIdToken, sessionRefreshIntervalMs, sessionTtlMs, user]);

  // Also refresh on tab focus.
  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    const handler = () => {
      if (!document.hidden) {
        refreshIdToken().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", handler);
    return () => {
      document.removeEventListener("visibilitychange", handler);
    };
  }, [refreshIdToken]);

  // Logout hits API cookie + Firebase client.
  const logout = useCallback<AuthContextValue["logout"]>(
    async () =>
      runWithBusy(async () => {
        try {
          await fetch(endpoints.logout, {
            method: "POST",
            credentials: "include",
          }).catch(() => {});
          await auth.signOut().catch(() => {});
          setClaims(null);
          setUser(null);
          onLogout?.();
        } finally {
          // `runWithBusy` handles busy flag; keep behavior the same.
        }
      }),
    [auth, endpoints.logout, onLogout, runWithBusy]
  );

  // Memoized context payload

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      claims,
      role,
      refreshIdToken,
      requestOtp,
      confirmOtp,
      googleSignIn,
      logout,
      error,
      busy,
    }),
    [
      user,
      loading,
      claims,
      role,
      refreshIdToken,
      requestOtp,
      confirmOtp,
      googleSignIn,
      logout,
      error,
      busy,
    ]
  );

  // No JSX so the file stays .ts
  return React.createElement(AuthContext.Provider, { value }, children as any);
};

// Hook

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

// Example wiring:
// const base = process.env.NEXT_PUBLIC_AUTH_BASE_URL ?? "/api/auth";
// <AuthProvider
//   auth={clientAuth}
//   endpoints={{
//     startOtp: `${base}/otp/start`,
//     verifyOtp: `${base}/otp/verify`,
//     login: `${base}/login`,
//     logout: `${base}/logout`,
//   }}
// />
