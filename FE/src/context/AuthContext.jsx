import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as authRepository from "../data/authRepository";

const AUTH_STORAGE_KEY = "vaultspace_auth";
const AuthContext = createContext(null);

function readStoredAuth() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Application layer: single source of truth for the authenticated session,
// persisted in localStorage and validated against /api/Auth/me on load.
export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => readStoredAuth());
  const [initializing, setInitializing] = useState(true);

  const persist = useCallback((next) => {
    setAuth(next);
    if (next) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    const stored = readStoredAuth();
    if (!stored?.accessToken) {
      setInitializing(false);
      return;
    }
    authRepository
      .fetchCurrentUser(stored.accessToken)
      .then((res) => persist({ ...stored, user: res.data }))
      .catch(() => persist(null))
      .finally(() => setInitializing(false));
  }, [persist]);

  const applyAuthResponse = useCallback(
    (authResponse) => {
      persist({
        accessToken: authResponse.accessToken,
        tokenType: authResponse.tokenType,
        user: authResponse.user,
      });
    },
    [persist]
  );

  const login = useCallback(
    async ({ email, password }) => {
      const res = await authRepository.login({ email, password });
      applyAuthResponse(res.data);
      return res.data.user;
    },
    [applyAuthResponse]
  );

  const register = useCallback(
    (payload) => authRepository.register(payload),
    []
  );

  const verifyOtp = useCallback(
    async ({ email, otpCode }) => {
      const res = await authRepository.verifyOtp({ email, otpCode });
      applyAuthResponse(res.data);
      return res.data.user;
    },
    [applyAuthResponse]
  );

  const resendOtp = useCallback(({ email }) => authRepository.resendOtp({ email }), []);

  const logout = useCallback(() => {
    persist(null);
  }, [persist]);

  const value = useMemo(
    () => ({
      user: auth?.user ?? null,
      accessToken: auth?.accessToken ?? null,
      isAuthenticated: Boolean(auth?.accessToken),
      initializing,
      login,
      register,
      verifyOtp,
      resendOtp,
      logout,
    }),
    [auth, initializing, login, register, verifyOtp, resendOtp, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
