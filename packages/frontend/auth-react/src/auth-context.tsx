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

const ONE_MINUTE_MS = 60 * 1000;
const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;

export type AuthRole = "User" | "Admin" | string | undefined;

export interface Endpoints {
  startOtp: string;
  verifyOtp: string;
  login: string;
  logout: string;
}

export interface AuthContextConfig {
  //firebase auth client instance
  auth: FirebaseAuth | null;
  //backend API routes
  endpoints: Endpoints;
  //optional callback fired after a session is created
  onSession?: (args: { idToken: string; user: User }) => void;
  //optional callback fired after logout
  onLogout?: () => void;
  //optional flag for google sign-in behavior
  //If there's an already signed in firebase user, google sign-in
  //is treated as a continuation flow
  allowAutoLink?: boolean;
  //optional flag on whether firebase should keep user signed in.
  //if false, create backend cookie then sign of firebase client auth.
  //browser uses backend session instead of a persistent firebase client session.
  keepClientSignedIn?: boolean;
  //session lifetime in milliseconds
  sessionTtlMs?: number;
  //how often we refresh the firebase id token and re-sync
  //backend session cookie.
  sessionRefreshIntervalMs?: number;
  //optional CSRF token or getter for CSRF token.
  //Sent as the X-CSRF-Token header on every POST request.
  csrfToken?: string | (() => string);
}

//This is a shape of what useAuth() gives inside
//React components
export interface AuthContextValue {
  //current firebase user
  user: User | null;
  //firebase still figuring out auth state
  loading: boolean;
  //an auth action is in progress
  busy: boolean;
  //latest auth-related error message that the UI can show.
  error: string | null;
  //Claims are extra server-set values inside the user’s token,
  // like role, permissions, account status, etc.
  claims: IdTokenResult["claims"] | null;
  role: AuthRole;
  //keep auth/session fresh
  refreshIdToken: () => Promise<string | null>;
  //start email code login
  requestOtp: (email: string, captchaToken: string) => Promise<void>;
  //finish email code login
  confirmOtp: (email: string, code: string) => Promise<void>;
  //login with Google
  googleSignIn: () => Promise<void>;
  //end the session
  logout: () => Promise<void>;
}

//create react context object for auth
//A context lets you pass data through the component tree
// without manually passing props through every level.
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

//AuthProvider is the component that actually owns auth state
// and then shares it with the rest of the app through React Context.
// accepts all fields from AuthContextConfig plus children
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
  csrfToken,
  children,
}) => {
  //auth state
  const [user, setUser] = useState<User | null>(null);
  const [claims, setClaims] = useState<IdTokenResult["claims"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  //avoids setting React state after the component unmounts
  const mounted = useRef(true);

  //has firebase told us the initial auth state yet
  //useRef is used so it doesn't re-render component
  const hasResolvedInitialAuth = useRef(false);

  //derive roles from firebase custom claims
  const role = (claims?.role as AuthRole) ?? undefined;

  //resolve the CSRF token value (supports static string or getter)
  const resolveCsrfToken = useCallback((): string | undefined => {
    if (!csrfToken) return undefined;
    return typeof csrfToken === "function" ? csrfToken() : csrfToken;
  }, [csrfToken]);

  // POST helper for auth endpoints.
  // `credentials: "include"` ensures cookies are sent and stored (needed for sessions).
  // Includes X-CSRF-Token header when a csrfToken is configured.
  const postJson = useCallback(
    async (url: string, body?: unknown) => {
      const headers: Record<string, string> = {
        "content-type": "application/json",
      };

      const csrf = resolveCsrfToken();
      if (csrf) {
        headers["x-csrf-token"] = csrf;
      }

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
    [resolveCsrfToken],
  );

  /**
   * Used by login/logout actions so the UI can show a spinner
   * and clear the previous error before starting a new attempt.
   */
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

  /**
   * Firebase proves who the user is.
   * The backend then uses that Firebase ID token to create its own session cookie.
   */
  // Firebase user -> Firebase ID token -> backend login endpoint -> backend session cookie
  const createBackendSession = useCallback(
    async (firebaseUser: User, shouldEmitSession = true) => {
      const idToken = await firebaseUser.getIdToken(true);

      await postJson(endpoints.login, {
        idToken,
        ttlMs: sessionTtlMs,
      });

      if (shouldEmitSession) {
        onSession?.({ idToken, user: firebaseUser });
      }

      return idToken;
    },
    [endpoints.login, onSession, postJson, sessionTtlMs],
  );

  //If keepClientSignedIn is false, it signs out of Firebase client auth
  // and leaves only the backend cookie session.
  const finishSignIn = useCallback(
    async (firebaseUser: User) => {
      await createBackendSession(firebaseUser, true);

      if (!keepClientSignedIn) {
        await auth?.signOut();
      }
    },
    [auth, createBackendSession, keepClientSignedIn],
  );

  /**
   * Sync Firebase auth state into React.
   * - `onAuthStateChanged`: tracks the current user
   * - `onIdTokenChanged`: keeps claims (e.g. roles) up to date
   */
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

    //this updates user
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (!mounted.current) return;

      setUser(firebaseUser);
      finishInitialLoad();
    });

    //this updates claims
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

  //request OTP
  const requestOtp = useCallback<AuthContextValue["requestOtp"]>(
    async (email, captchaToken) =>
      runAuthAction(async () => {
        const cleanEmail = email.trim();
        const cleanCaptchaToken = captchaToken.trim();

        if (!cleanEmail) throw new Error("email_required");
        if (!cleanCaptchaToken) throw new Error("captcha_required");

        await postJson(endpoints.startOtp, {
          email: cleanEmail,
          captchaToken: cleanCaptchaToken,
        });
      }),
    [endpoints.startOtp, postJson, runAuthAction],
  );

  //confirm OTP
  const confirmOtp = useCallback<AuthContextValue["confirmOtp"]>(
    async (email, code) =>
      runAuthAction(async () => {
        if (!auth) throw new Error("auth_not_initialized");

        const cleanEmail = email.trim();
        const cleanCode = code.trim();

        if (!cleanEmail || !cleanCode) {
          throw new Error("invalid_otp_payload");
        }

        try {
          // return firebase custom token
          const data = (await postJson(endpoints.verifyOtp, {
            email: cleanEmail,
            code: cleanCode,
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
    [auth, endpoints.verifyOtp, finishSignIn, postJson, runAuthAction],
  );

  const googleSignIn = useCallback<AuthContextValue["googleSignIn"]>(
    async () =>
      runAuthAction(async () => {
        if (!auth) throw new Error("auth_not_initialized");

        try {
          const provider = new GoogleAuthProvider();

          /**
           * `allowAutoLink` is kept here as a business-rule switch.
           * Firebase still owns the actual provider behavior.
           */
          if (!allowAutoLink && auth.currentUser) {
            throw new Error("auto_link_disabled");
          }

          const result = await signInWithPopup(auth, provider);

          await finishSignIn(result.user);
        } catch (err: unknown) {
          if (mounted.current) {
            setError(toUserMessage(err));
          }

          throw err;
        }
      }),
    [allowAutoLink, auth, finishSignIn, runAuthAction],
  );

  /**
   * Get current firebase user
   * Create fresh backend session using a fresh firebase token
   * then reload claims
   */
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

  /**
   * Pick a safe refresh interval.
   * Defaults to half the session TTL, then clamps it between 1 minute and 12 hours.
   */
  const sessionRefreshMs = useMemo(() => {
    const preferredInterval =
      sessionRefreshIntervalMs ??
      (sessionTtlMs ? Math.floor(sessionTtlMs / 2) : undefined);

    if (!preferredInterval || preferredInterval <= 0) {
      return undefined;
    }

    return Math.max(
      ONE_MINUTE_MS,
      Math.min(preferredInterval, TWELVE_HOURS_MS),
    );
  }, [sessionRefreshIntervalMs, sessionTtlMs]);

  /**
   * Keep the backend session and Firebase claims fresh while the user is signed in.
   */
  useEffect(() => {
    if (!user || !sessionRefreshMs) return undefined;

    const refreshTimer = window.setInterval(() => {
      refreshIdToken().catch(() => {
        // Refresh is best-effort; the next timer tick or user action can recover.
      });
    }, sessionRefreshMs);

    return () => {
      window.clearInterval(refreshTimer);
    };
  }, [refreshIdToken, sessionRefreshMs, user]);

  /**
   * Refresh as soon as the tab becomes active again.
   * This avoids waiting for the next interval after the app has been in the background.
   */
  useEffect(() => {
    if (typeof document === "undefined") return undefined;

    const refreshWhenTabIsVisible = () => {
      if (!document.hidden) {
        refreshIdToken().catch(() => {
          // Same as the interval refresh: useful, but not fatal.
        });
      }
    };

    document.addEventListener("visibilitychange", refreshWhenTabIsVisible);

    return () => {
      document.removeEventListener("visibilitychange", refreshWhenTabIsVisible);
    };
  }, [refreshIdToken]);

  /**
   * Call backend logout endpoint
   * sign out of firebase
   * clear local user/claims
   */
  const logout = useCallback<AuthContextValue["logout"]>(
    async () =>
      runAuthAction(async () => {
        const idToken = await auth?.currentUser?.getIdToken().catch(() => "");

        const headers: Record<string, string> = {};
        if (idToken) {
          headers["authorization"] = `Bearer ${idToken}`;
        }
        const csrf = resolveCsrfToken();
        if (csrf) {
          headers["x-csrf-token"] = csrf;
        }

        await fetch(endpoints.logout, {
          method: "POST",
          credentials: "include",
          headers,
        }).catch(() => {
          // We still sign out locally even if the backend logout fails.
        });

        await auth?.signOut().catch(() => {
          // Local cleanup below still runs.
        });

        if (mounted.current) {
          setUser(null);
          setClaims(null);
          setError(null);
        }

        onLogout?.();
      }),
    [auth, endpoints.logout, onLogout, resolveCsrfToken, runAuthAction],
  );

  //builds the context value - state & actions into one object
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

  //This is where everything becomes available to child components.
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * useAuth means: “give this component access to the auth context.”
 */
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
 * const base = process.env.NEXT_PUBLIC_AUTH_BASE_URL ?? "/api/auth";
 *
 * <AuthProvider
 *   auth={clientAuth}
 *   endpoints={{
 *     startOtp: `${base}/otp/start`,
 *     verifyOtp: `${base}/otp/verify`,
 *     login: `${base}/login`,
 *     logout: `${base}/logout`,
 *   }}
 * />
 */
