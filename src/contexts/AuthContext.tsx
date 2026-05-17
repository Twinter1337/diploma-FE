import { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import type { AuthResponse, User } from '../types';
import { refreshTokens } from '../services/authService';
import { registerTokenStore } from '../services/httpUtils';

const REFRESH_TOKEN_KEY = 'rt';

interface AuthState {
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isRestoring: boolean;
  getAccessToken: () => string | null;
  setAuth: (data: AuthResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuthState] = useState<AuthState | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);
  const authRef = useRef<AuthState | null>(null);
  const restoreAttempted = useRef(false);

  // Keep a ref in sync so the token store always reads the latest value
  // without re-registering on every render.
  authRef.current = auth;

  useEffect(() => {
    registerTokenStore({
      getAccessToken: () => authRef.current?.accessToken ?? null,
      getRefreshToken: () =>
        authRef.current?.refreshToken ?? sessionStorage.getItem(REFRESH_TOKEN_KEY),
      onRefreshed: (data) => {
        setAuthState({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken });
        sessionStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
      },
      onRefreshFailed: () => {
        setAuthState(null);
        sessionStorage.removeItem(REFRESH_TOKEN_KEY);
      },
    });
  }, []);

  useEffect(() => {
    // Guard against React StrictMode double-invoke: only attempt restore once.
    if (restoreAttempted.current) return;
    restoreAttempted.current = true;

    const stored = sessionStorage.getItem(REFRESH_TOKEN_KEY);
    if (!stored) {
      setIsRestoring(false);
      return;
    }
    refreshTokens(stored)
      .then(data => {
        setAuthState({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken });
        sessionStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
      })
      .catch((err) => {
        console.warn('[AuthContext] Token restore failed:', err);
        sessionStorage.removeItem(REFRESH_TOKEN_KEY);
      })
      .finally(() => setIsRestoring(false));
  }, []);

  const setAuth = (data: AuthResponse) => {
    setAuthState({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken });
    sessionStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
  };

  const logout = () => {
    setAuthState(null);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  };

  const getAccessToken = () => auth?.accessToken ?? null;

  const value: AuthContextValue = {
    user: auth?.user ?? null,
    isAuthenticated: auth !== null,
    isRestoring,
    getAccessToken,
    setAuth,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used inside <AuthProvider>');
  return ctx;
}
