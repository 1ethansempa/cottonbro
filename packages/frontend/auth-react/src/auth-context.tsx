import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Auth as FirebaseAuth, IdTokenResult, User } from "firebase/auth";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  onIdTokenChanged,
  signInWithCustomToken,
  signInWithPopup,
} from "firebase/auth";
import { toUserMessage, sanitizeBackendError } from "./auth-errors";

const DEFAULT_AUTH_BASE_URL = "/api/auth";
const SESSION_REFRESH_INTERVAL_MS = 5 * 60 * 1000;

export type AuthRole = "User" | "Admin" | string | undefined;

export interface AuthContextConfig {
  // Firebase client auth instance; pass null until the browser-only SDK is ready.
  auth: FirebaseAuth | null;
  // Called after the backend has accepted the Firebase ID token and set its cookie.
  onSession?: (args: { idToken: string; user: User }) => void;
  // Called after local cleanup has run, even if backend logout was best-effort.
  onLogout?: () => void;
}

export interface AuthContextValue {
  // Firebase client state; server authorization must not rely on this alone.
  user: User | null;
  // True until Firebase has reported the first client auth state.
  loading: boolean;
  // True while an explicit login/logout action is in flight.
  busy: boolean;
  // User-safe error text. Raw backend/Firebase errors are normalized first.
  error: string | null;
  // Claims are UI hints only; protected APIs must verify authorization server-side.
  claims: IdTokenResult["claims"] | null;
  role: AuthRole;
  // Refreshes the Firebase ID token and asks the backend to renew the cookie.
  refreshIdToken: () => Promise<string | null>;
  // Starts the email OTP flow. Captcha must be verified by the backend.
  requestOtp: (email: string, captchaToken: string) => Promise<void>;
  // Completes OTP login by exchanging the backend custom token with Firebase.
  confirmOtp: (email: string, code: string) => Promise<void>;
  // Starts Firebase Google sign-in and then creates the backend session.
  googleSignIn: () => Promise<void>;
  // Clears the backend session cookie when possible and signs out Firebase locally.
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<
  React.PropsWithChildren<AuthContextConfig>
> = ({ auth, onSession, onLogout, children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [claims, setClaims] = useState<IdTokenResult["claims"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Firebase callbacks may resolve after unmount; guard React state writes.
  const mounted = useRef(true);

  // Loading should flip once, after Firebase's first auth-state callback.
  const hasResolvedInitialAuth = useRef(false);

  const role = (claims?.role as AuthRole) ?? undefined;

  const authRoutes = useMemo(() => {
    return {
      startOtp: `${DEFAULT_AUTH_BASE_URL}/otp/start`,
      verifyOtp: `${DEFAULT_AUTH_BASE_URL}/otp/verify`,
      login: `${DEFAULT_AUTH_BASE_URL}/login`,
      logout: `${DEFAULT_AUTH_BASE_URL}/logout`,
    };
  }, []);

  // Auth endpoints set/read HttpOnly cookies, so every request includes credentials.
  const postJson = useCallback(
    async (url: string, body?: unknown) => {
      const headers: Record<string, string> = {
        "content-type": "application/json",
      };

      const res = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers,
        body: JSON.stringify(body ?? {}),
      });

      if (!res.ok) {
        const raw = await res.text().catch(() => "");
        throw new Error(
          sanitizeBackendError(raw) ||
            `Request failed with status ${res.status}`,
        );
      }

      const contentType = res.headers.get("content-type");

      if (contentType?.includes("application/json")) {
        return res.json();
      }

      return undefined;
    },
    [],
  );

  // Centralizes action state so auth buttons do not each invent spinner/error rules.
  const runAuthAction = useCallback(async <T,>(action: () => Promise<T>) => {
    setError(null);
    setBusy(true);

    try {
      return await action();
    } finally {
      if (mounted.current) {
        setBusy(false);
      }
    }
  }, []);

  // Trust handoff: Firebase proves identity; the backend decides whether to mint a session.
  const createBackendSession = useCallback(
    async (firebaseUser: User, shouldEmitSession = true) => {
      const idToken = await firebaseUser.getIdToken(true);

      await postJson(authRoutes.login, {
        idToken,
      });

      if (shouldEmitSession) {
        onSession?.({ idToken, user: firebaseUser });
      }

      return idToken;
    },
    [authRoutes.login, onSession, postJson],
  );

  const finishSignIn = useCallback(
    async (firebaseUser: User) => {
      try {
        await createBackendSession(firebaseUser, true);
      } catch (err) {
        await auth?.signOut().catch(() => {
          // Backend refused the session; clear any Firebase-only login state.
        });
        throw err;
      }
    },
    [auth, createBackendSession],
  );

  // Keep client UI state aligned with Firebase, including custom claims changes.
  useEffect(() => {
    mounted.current = true;

    if (!auth) {
      hasResolvedInitialAuth.current = true;
      setLoading(false);

      return () => {
        mounted.current = false;
      };
    }

    const finishInitialLoad = () => {
      if (!hasResolvedInitialAuth.current) {
        hasResolvedInitialAuth.current = true;
        setLoading(false);
      }
    };

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (!mounted.current) return;

      setUser(firebaseUser);
      finishInitialLoad();
    });

    const unsubscribeToken = onIdTokenChanged(auth, async (firebaseUser) => {
      if (!mounted.current) return;

      if (!firebaseUser) {
        setClaims(null);
        return;
      }

      try {
        const tokenInfo = await firebaseUser.getIdTokenResult();

        if (mounted.current) {
          setClaims(tokenInfo.claims);
        }
      } catch {
        if (mounted.current) {
          setClaims(null);
        }
      }
    });

    return () => {
      mounted.current = false;
      unsubscribeAuth();
      unsubscribeToken();
    };
  }, [auth]);

  const requestOtp = useCallback<AuthContextValue["requestOtp"]>(
    async (email, captchaToken) =>
      runAuthAction(async () => {
        const emailValue = email.trim();
        const captchaTokenValue = captchaToken.trim();

        if (!emailValue) throw new Error("email_required");
        if (!captchaTokenValue) throw new Error("captcha_required");

        await postJson(authRoutes.startOtp, {
          email: emailValue,
          captchaToken: captchaTokenValue,
        });
      }),
    [authRoutes.startOtp, postJson, runAuthAction],
  );

  const confirmOtp = useCallback<AuthContextValue["confirmOtp"]>(
    async (email, code) =>
      runAuthAction(async () => {
        if (!auth) throw new Error("auth_not_initialized");

        const emailValue = email.trim();
        const codeValue = code.trim();

        if (!emailValue || !codeValue) {
          throw new Error("invalid_otp_payload");
        }

        try {
          // The backend returns a short-lived Firebase custom token after OTP success.
          const data = (await postJson(authRoutes.verifyOtp, {
            email: emailValue,
            code: codeValue,
          })) as { customToken?: string } | undefined;

          if (!data?.customToken) {
            throw new Error("missing_custom_token");
          }

          const credential = await signInWithCustomToken(
            auth,
            data.customToken,
          );

          await finishSignIn(credential.user);
        } catch (err: unknown) {
          if (mounted.current) {
            setError(toUserMessage(err));
          }

          throw err;
        }
      }),
    [auth, authRoutes.verifyOtp, finishSignIn, postJson, runAuthAction],
  );

  const googleSignIn = useCallback<AuthContextValue["googleSignIn"]>(
    async () =>
      runAuthAction(async () => {
        if (!auth) throw new Error("auth_not_initialized");

        try {
          const provider = new GoogleAuthProvider();

          const result = await signInWithPopup(auth, provider);

          await finishSignIn(result.user);
        } catch (err: unknown) {
          if (mounted.current) {
            setError(toUserMessage(err));
          }

          throw err;
        }
      }),
    [auth, finishSignIn, runAuthAction],
  );

  // Best-effort renewal for sliding sessions; callers must still handle null/expiry.
  const refreshIdToken = useCallback<
    AuthContextValue["refreshIdToken"]
  >(async () => {
    const currentUser = auth?.currentUser;

    if (!currentUser) return null;

    try {
      const idToken = await createBackendSession(currentUser, false);
      const tokenInfo = await currentUser.getIdTokenResult();

      if (mounted.current) {
        setClaims(tokenInfo.claims);
      }

      return idToken;
    } catch {
      return null;
    }
  }, [auth, createBackendSession]);

  // Renew the backend cookie while Firebase says a user is signed in.
  useEffect(() => {
    if (!user) return undefined;

    const refreshTimer = window.setInterval(() => {
      refreshIdToken().catch(() => {
        // Protected calls remain the source of truth if background refresh fails.
      });
    }, SESSION_REFRESH_INTERVAL_MS);

    return () => {
      window.clearInterval(refreshTimer);
    };
  }, [refreshIdToken, user]);

  // Background tabs can miss timers; refresh promptly when the user returns.
  useEffect(() => {
    if (typeof document === "undefined") return undefined;

    const refreshWhenTabIsVisible = () => {
      if (!document.hidden) {
        refreshIdToken().catch(() => {
          // Non-fatal; the next protected request still has to handle auth failure.
        });
      }
    };

    document.addEventListener("visibilitychange", refreshWhenTabIsVisible);

    return () => {
      document.removeEventListener("visibilitychange", refreshWhenTabIsVisible);
    };
  }, [refreshIdToken]);

  // Logout must clean up the browser even if the network or backend is unavailable.
  const logout = useCallback<AuthContextValue["logout"]>(
    async () =>
      runAuthAction(async () => {
        await fetch(authRoutes.logout, {
          method: "POST",
          credentials: "include",
        }).catch(() => {
          // Local sign-out below is still required.
        });

        await auth?.signOut().catch(() => {
          // React state cleanup below is the final local fallback.
        });

        if (mounted.current) {
          setUser(null);
          setClaims(null);
          setError(null);
        }

        onLogout?.();
      }),
    [auth, authRoutes.logout, onLogout, runAuthAction],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      busy,
      error,
      claims,
      role,
      refreshIdToken,
      requestOtp,
      confirmOtp,
      googleSignIn,
      logout,
    }),
    [
      user,
      loading,
      busy,
      error,
      claims,
      role,
      refreshIdToken,
      requestOtp,
      confirmOtp,
      googleSignIn,
      logout,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within <AuthProvider>");
  }

  return context;
}

/**
 * Example wiring:
 *
 * <AuthProvider auth={clientAuth} />
 */
