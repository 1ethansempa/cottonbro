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
import { createNetworkRequest, type NetworkRequest } from "./network-request";
import { toUserMessage, sanitizeBackendError } from "./auth-errors";

declare const process:
  | {
      env?: {
        NEXT_PUBLIC_E2E_AUTH?: string;
      };
    }
  | undefined;

const DEFAULT_AUTH_BASE_URL = "/api/auth";
const BEARER_TOKEN_CACHE_TTL_MS = 20 * 60 * 1000;

export type AuthRole = "admin" | "user" | "partner" | undefined;

export type LegalAgreementInput = {
  privacyPolicyAccepted?: boolean;
  termsAccepted?: boolean;
};

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
  // Returns a Firebase ID token for endpoints that explicitly accept Bearer auth.
  // The token is cached in memory for up to 20 minutes.
  // This does not renew the backend session cookie.
  refreshIdToken: (forceRefresh?: boolean) => Promise<string | null>;
  // Network wrapper. Requests are protected by default unless protected=false.
  networkRequest: NetworkRequest;
  // Starts the email OTP flow. Captcha must be verified by the backend.
  requestOtp: (email: string, captchaToken: string) => Promise<void>;
  // Completes OTP login by exchanging the backend custom token with Firebase.
  confirmOtp: (
    email: string,
    code: string,
    agreements?: LegalAgreementInput,
  ) => Promise<void>;
  // Starts Firebase Google sign-in and then creates the backend session.
  googleSignIn: (agreements?: LegalAgreementInput) => Promise<void>;
  // Clears the backend session cookie when possible and signs out Firebase locally.
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const E2E_AUTH_STORAGE_KEY = "__cottonplug_e2e_auth_role";

export const AuthProvider: React.FC<
  React.PropsWithChildren<AuthContextConfig>
> = ({ auth, onSession, onLogout, children }) => {
  if (isE2EAuthEnabled()) {
    return (
      <E2EAuthProvider onLogout={onLogout}>
        {children}
      </E2EAuthProvider>
    );
  }

  return (
    <FirebaseAuthProvider
      auth={auth}
      onSession={onSession}
      onLogout={onLogout}
    >
      {children}
    </FirebaseAuthProvider>
  );
};

function FirebaseAuthProvider({
  auth,
  onSession,
  onLogout,
  children,
}: React.PropsWithChildren<AuthContextConfig>) {
  const [user, setUser] = useState<User | null>(null);
  const [claims, setClaims] = useState<IdTokenResult["claims"] | null>(null);
  const [sessionRole, setSessionRole] = useState<AuthRole>(undefined);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Firebase callbacks may resolve after unmount; guard React state writes.
  const mounted = useRef(true);
  const bearerTokenCache = useRef<{
    token: string;
    uid: string;
    cachedAt: number;
  } | null>(null);

  // Loading should flip once, after Firebase's first auth-state callback.
  const hasResolvedInitialAuth = useRef(false);

  const readRole = useCallback((value: unknown): AuthRole => {
    if (typeof value !== "string") return undefined;
    const roleValue = value.toLowerCase();
    if (
      roleValue === "admin" ||
      roleValue === "user" ||
      roleValue === "partner"
    ) {
      return roleValue;
    }
    return undefined;
  }, []);

  const role = sessionRole ?? readRole(claims?.role);

  const authRoutes = useMemo(() => {
    return {
      startOtp: `${DEFAULT_AUTH_BASE_URL}/otp/start`,
      verifyOtp: `${DEFAULT_AUTH_BASE_URL}/otp/verify`,
      login: `${DEFAULT_AUTH_BASE_URL}/login`,
      logout: `${DEFAULT_AUTH_BASE_URL}/logout`,
      session: `${DEFAULT_AUTH_BASE_URL}/session`,
    };
  }, []);

  const refreshBackendSessionRole = useCallback(async () => {
    const res = await fetch(authRoutes.session, {
      credentials: "include",
    });

    if (!res.ok) {
      setSessionRole(undefined);
      return undefined;
    }

    const data = (await res.json()) as {
      claims?: { role?: unknown };
    };
    const nextRole = readRole(data.claims?.role);
    setSessionRole(nextRole);
    return nextRole;
  }, [authRoutes.session, readRole]);

  // Auth endpoints set/read HttpOnly cookies, so every request includes credentials.
  const postJson = useCallback(async (url: string, body?: unknown) => {
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
        sanitizeBackendError(raw) || `Request failed with status ${res.status}`,
      );
    }

    const contentType = res.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      return res.json();
    }

    return undefined;
  }, []);

  // Centralizes action state so auth buttons do not each invent spinner/error rules.
  const runAuthAction = useCallback(async <T,>(action: () => Promise<T>) => {
    setError(null);
    setBusy(true);

    try {
      return await action();
    } catch (err: unknown) {
      if (mounted.current) {
        setError(toUserMessage(err));
      }

      throw err;
    } finally {
      if (mounted.current) {
        setBusy(false);
      }
    }
  }, []);

  // Trust handoff: Firebase proves identity; the backend decides whether to mint a session.
  const createBackendSession = useCallback(
    async (
      firebaseUser: User,
      shouldEmitSession = true,
      agreements?: LegalAgreementInput,
    ) => {
      const idToken = await firebaseUser.getIdToken(true);

      await postJson(authRoutes.login, {
        idToken,
        privacyPolicyAccepted: agreements?.privacyPolicyAccepted,
        termsAccepted: agreements?.termsAccepted,
      });
      await refreshBackendSessionRole();

      if (shouldEmitSession) {
        onSession?.({ idToken, user: firebaseUser });
      }

      return idToken;
    },
    [authRoutes.login, onSession, postJson, refreshBackendSessionRole],
  );

  const finishSignIn = useCallback(
    async (firebaseUser: User, agreements?: LegalAgreementInput) => {
      try {
        await createBackendSession(firebaseUser, true, agreements);
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
    let cancelled = false;

    mounted.current = true;
    hasResolvedInitialAuth.current = false;
    setLoading(true);

    if (!auth) {
      bearerTokenCache.current = null;
      setUser(null);
      setClaims(null);
      setSessionRole(undefined);
      hasResolvedInitialAuth.current = true;
      setLoading(false);

      return () => {
        cancelled = true;
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
      if (!mounted.current || cancelled) return;

      setUser(firebaseUser);
      finishInitialLoad();
    });

    const unsubscribeToken = onIdTokenChanged(auth, async (firebaseUser) => {
      if (!mounted.current || cancelled) return;

      if (!firebaseUser) {
        bearerTokenCache.current = null;
        setClaims(null);
        setSessionRole(undefined);
        return;
      }

      try {
        const tokenInfo = await firebaseUser.getIdTokenResult();

        if (mounted.current && !cancelled) {
          setClaims(tokenInfo.claims);
        }
      } catch {
        if (mounted.current && !cancelled) {
          setClaims(null);
        }
      }
    });

    return () => {
      cancelled = true;
      mounted.current = false;
      unsubscribeAuth();
      unsubscribeToken();
    };
  }, [auth]);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    refreshBackendSessionRole().catch(() => {
      if (!cancelled && mounted.current) {
        setSessionRole(undefined);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [refreshBackendSessionRole, user]);

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
    async (email, code, agreements) =>
      runAuthAction(async () => {
        if (!auth) throw new Error("auth_not_initialized");

        const emailValue = email.trim();
        const codeValue = code.trim();

        if (!emailValue || !codeValue) {
          throw new Error("invalid_otp_payload");
        }

        // The backend returns a short-lived Firebase custom token after OTP success.
        const data = (await postJson(authRoutes.verifyOtp, {
          email: emailValue,
          code: codeValue,
        })) as { customToken?: string } | undefined;

        if (!data?.customToken) {
          throw new Error("missing_custom_token");
        }

        const credential = await signInWithCustomToken(auth, data.customToken);

        await finishSignIn(credential.user, agreements);
      }),
    [auth, authRoutes.verifyOtp, finishSignIn, postJson, runAuthAction],
  );

  const googleSignIn = useCallback<AuthContextValue["googleSignIn"]>(
    async (agreements) =>
      runAuthAction(async () => {
        if (!auth) throw new Error("auth_not_initialized");

        const provider = new GoogleAuthProvider();

        provider.setCustomParameters({
          prompt: "select_account",
        });

        const result = await signInWithPopup(auth, provider);

        await finishSignIn(result.user, agreements);
      }),
    [auth, finishSignIn, runAuthAction],
  );

  // Some API calls need Firebase bearer auth directly. Keep the token in memory
  // only, and refresh it once it is older than the backend's 20-minute policy.
  const refreshIdToken = useCallback<AuthContextValue["refreshIdToken"]>(
    async (forceRefresh = false) => {
      const currentUser = auth?.currentUser;

      if (!currentUser) return null;

      try {
        const cached = bearerTokenCache.current;
        if (
          !forceRefresh &&
          cached?.uid === currentUser.uid &&
          Date.now() - cached.cachedAt < BEARER_TOKEN_CACHE_TTL_MS
        ) {
          return cached.token;
        }

        const idToken = await currentUser.getIdToken(true);
        bearerTokenCache.current = {
          token: idToken,
          uid: currentUser.uid,
          cachedAt: Date.now(),
        };

        const tokenInfo = await currentUser.getIdTokenResult();

        if (mounted.current) {
          setClaims(tokenInfo.claims);
        }

        return idToken;
      } catch {
        return null;
      }
    },
    [auth],
  );

  const networkRequest = useMemo(
    () => createNetworkRequest(refreshIdToken),
    [refreshIdToken],
  );

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

        bearerTokenCache.current = null;

        if (mounted.current) {
          setUser(null);
          setClaims(null);
          setSessionRole(undefined);
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
      networkRequest,
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
      networkRequest,
      requestOtp,
      confirmOtp,
      googleSignIn,
      logout,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within <AuthProvider>");
  }

  return context;
}

function E2EAuthProvider({
  children,
  onLogout,
}: React.PropsWithChildren<{
  onLogout?: AuthContextConfig["onLogout"];
}>) {
  const [role, setRole] = useState<AuthRole>(() => readE2ERole());

  useEffect(() => {
    setRole(readE2ERole());
  }, []);

  const user = useMemo(() => {
    if (!role) return null;

    return {
      uid: "e2e-user",
      email: "e2e@cottonplug.test",
      emailVerified: true,
      getIdToken: async () => "e2e-token",
      getIdTokenResult: async () => ({
        claims: { role },
      }),
    } as unknown as User;
  }, [role]);

  const networkRequest = useMemo<NetworkRequest>(
    () => async (input, init) => {
      const { protected: _protected, token: _token, ...requestInit } =
        init ?? {};

      return fetch(input, {
        ...requestInit,
        credentials: requestInit.credentials ?? "include",
      });
    },
    [],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading: false,
      busy: false,
      error: null,
      claims: role ? { role } : null,
      role,
      refreshIdToken: async () => (role ? "e2e-token" : null),
      networkRequest,
      requestOtp: async () => {},
      confirmOtp: async () => {},
      googleSignIn: async () => {},
      logout: async () => {
        window.localStorage.removeItem(E2E_AUTH_STORAGE_KEY);
        setRole(undefined);
        onLogout?.();
      },
    }),
    [networkRequest, onLogout, role, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function readE2ERole(): AuthRole {
  if (typeof window === "undefined") return undefined;

  const value = window.localStorage.getItem(E2E_AUTH_STORAGE_KEY);
  if (value === "admin" || value === "user" || value === "partner") {
    return value;
  }

  return undefined;
}

function isE2EAuthEnabled() {
  return (
    typeof process !== "undefined" &&
    process.env?.NEXT_PUBLIC_E2E_AUTH === "1"
  );
}

/**
 * Example wiring:
 *
 * <AuthProvider auth={clientAuth} />
 */
