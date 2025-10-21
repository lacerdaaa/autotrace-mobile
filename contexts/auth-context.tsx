import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { getCurrentUser, login, register, type LoginPayload, type RegisterPayload } from '@/lib/api/auth';
import { setApiToken, setUnauthorizedHandler } from '@/lib/api/client';
import { User } from '@/lib/api/types';
import { getToken, removeToken, saveToken } from '@/lib/storage/auth-storage';

type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated';

type AuthContextValue = {
  user: User | null;
  token: string | null;
  status: AuthStatus;
  isLoading: boolean;
  signIn: (payload: LoginPayload) => Promise<void>;
  signUp: (payload: RegisterPayload) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [status, setStatus] = useState<AuthStatus>('checking');
  const [isLoading, setIsLoading] = useState(false);

  const applyToken = useCallback((value: string | null) => {
    setTokenState(value);
    setApiToken(value);
  }, []);

  const setAuthenticated = useCallback(
    async ({ token: newToken, user: newUser }: { token: string; user: User }) => {
      await saveToken(newToken);
      applyToken(newToken);
      setUser(newUser);
      setStatus('authenticated');
    },
    [applyToken],
  );

  const clearSession = useCallback(async () => {
    await removeToken();
    applyToken(null);
    setUser(null);
    setStatus('unauthenticated');
  }, [applyToken]);

  const withPendingState = useCallback(
    async (operation: () => Promise<void>) => {
      setIsLoading(true);
      try {
        await operation();
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const bootstrap = useCallback(async () => {
    try {
      const storedToken = await getToken();
      if (!storedToken) {
        setStatus('unauthenticated');
        return;
      }

      applyToken(storedToken);
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setStatus('authenticated');
    } catch {
      await clearSession();
    }
  }, [applyToken, clearSession]);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    const handleUnauthorized = async () => {
      await clearSession();
    };

    setUnauthorizedHandler(handleUnauthorized);
    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setStatus('authenticated');
    } catch (error) {
      await clearSession();
      throw error;
    }
  }, [clearSession]);

  const signIn = useCallback(
    async (payload: LoginPayload) =>
      withPendingState(async () => {
        try {
          const response = await login(payload);
          await setAuthenticated(response);
        } catch (error) {
          await clearSession();
          throw error;
        }
      }),
    [withPendingState, setAuthenticated, clearSession],
  );

  const signUp = useCallback(
    async (payload: RegisterPayload) =>
      withPendingState(async () => {
        try {
          const response = await register(payload);
          await setAuthenticated(response);
        } catch (error) {
          await clearSession();
          throw error;
        }
      }),
    [withPendingState, setAuthenticated, clearSession],
  );

  const signOut = useCallback(async () => {
    await clearSession();
  }, [clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      status,
      isLoading,
      signIn,
      signUp,
      signOut,
      refreshUser,
    }),
    [user, token, status, isLoading, signIn, signUp, signOut, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext deve ser utilizado dentro de um AuthProvider.');
  }
  return context;
};
