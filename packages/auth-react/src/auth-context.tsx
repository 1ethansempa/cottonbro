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

/**
 * CottonBro Auth React Context (no JSX variant)
 * - Email OTP + Google sign-in
 * - Posts ID token to `/api/auth/login` to mint 14d session cookie
 * - Links Google to current user when already signed in via OTP
 * - Exposes role from custom claims
 */

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
  allowAutoLink?: boolean; // default true
  keepClientSignedIn?: boolean; // default true
  /** Optional: override ttlMs sent on login (e.g., 7d for admin) */
  sessionTtlMs?: number;
}

export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  claims: IdTokenResult["claims"] | null;
  role: AuthRole;
  refreshIdToken: () => Promise<string | null>;
  requestOtp: (email: string) => Promise<void>;
  confirmOtp: (email: string, code: string) => Promise<void>;
  googleSignIn: () => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  busy: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

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
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [claims, setClaims] = useState<IdTokenResult["claims"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  const role = (claims?.role as AuthRole) ?? undefined;

  useEffect(() => {
    mounted.current = true;
    const unsub1 = onAuthStateChanged(auth, (u) => setUser(u));
    const unsub2 = onIdTokenChanged(auth, async (u) => {
      if (!u) return setClaims(null);
      try {
        const res = await u.getIdTokenResult();
        if (mounted.current) setClaims(res.claims);
      } catch {}
    });
    setLoading(false);
    return () => {
      mounted.current = false;
      unsub1();
      unsub2();
    };
  }, [auth]);

  const postJson = useCallback(async (url: string, body: unknown) => {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body ?? {}),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      throw new Error(t || `Request failed: ${res.status}`);
    }
    return res.headers.get("content-type")?.includes("application/json")
      ? res.json()
      : undefined;
  }, []);

  const establishSession = useCallback(
    async (u: User) => {
      const idToken = await u.getIdToken(true);
      await postJson(endpoints.login, { idToken, ttlMs: sessionTtlMs });
      onSession?.({ idToken, user: u });
      if (!keepClientSignedIn) await auth.signOut();
    },
    [
      auth,
      endpoints.login,
      sessionTtlMs,
      keepClientSignedIn,
      onSession,
      postJson,
    ]
  );

  const requestOtp = useCallback<AuthContextValue["requestOtp"]>(
    async (email) => {
      setError(null);
      setBusy(true);
      try {
        const e = email.trim();
        if (!e) throw new Error("email_required");
        await postJson(endpoints.startOtp, { email: e });
      } finally {
        if (mounted.current) setBusy(false);
      }
    },
    [endpoints.startOtp, postJson]
  );

  const confirmOtp = useCallback<AuthContextValue["confirmOtp"]>(
    async (email, code) => {
      setError(null);
      setBusy(true);
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
        if (mounted.current) setError(err?.message ?? "otp_verify_failed");
        throw err;
      } finally {
        if (mounted.current) setBusy(false);
      }
    },
    [auth, endpoints.verifyOtp, establishSession, postJson]
  );

  const googleSignIn = useCallback<
    AuthContextValue["googleSignIn"]
  >(async () => {
    setError(null);
    setBusy(true);
    try {
      const provider = new GoogleAuthProvider();
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
    } finally {
      if (mounted.current) setBusy(false);
    }
  }, [allowAutoLink, auth, establishSession]);

  const refreshIdToken = useCallback<
    AuthContextValue["refreshIdToken"]
  >(async () => {
    try {
      if (!auth.currentUser) return null;
      const t = await auth.currentUser.getIdToken(true);
      const info = await auth.currentUser.getIdTokenResult();
      if (mounted.current) setClaims(info.claims);
      return t;
    } catch {
      return null;
    }
  }, [auth]);

  const logout = useCallback<AuthContextValue["logout"]>(async () => {
    setError(null);
    setBusy(true);
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
      if (mounted.current) setBusy(false);
    }
  }, [auth, endpoints.logout, onLogout]);

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

  // No JSX to keep the file .ts
  return React.createElement(AuthContext.Provider, { value }, children as any);
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

// Example wiring (per app):
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
