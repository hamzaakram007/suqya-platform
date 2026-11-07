'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AuthSession,
  getStoredAuth,
  logout as clearAuth,
  setStoredAuth,
} from '@/lib/api';

interface AuthContextValue {
  session: AuthSession | null;
  isLoading: boolean;
  logout: () => void;
  setSession: (session: AuthSession | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSessionState] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setSessionState(getStoredAuth());
    setIsLoading(false);
  }, []);

  const setSession = useCallback((next: AuthSession | null) => {
    setStoredAuth(next);
    setSessionState(next);
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setSessionState(null);
    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{ session, isLoading, logout, setSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function useRequireAuth(allowedRoles?: string[]) {
  const { session, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!session) {
      router.replace('/login');
      return;
    }
    if (allowedRoles && !allowedRoles.includes(session.user.role)) {
      router.replace('/login');
    }
  }, [session, isLoading, allowedRoles, router]);

  return { session, isLoading };
}
