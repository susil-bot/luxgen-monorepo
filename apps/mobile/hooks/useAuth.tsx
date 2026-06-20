import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useRouter, useSegments } from 'expo-router';

import type { User } from '@luxgen/types';

import { API } from '../constants/api';
import { GET_CURRENT_USER, LOGIN_MUTATION } from '../graphql/queries';
import { apolloClient } from '../lib/apollo';
import { clearSession, getTenantId, getToken, saveSession } from '../lib/auth';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, tenantSubdomain?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const [bootstrapping, setBootstrapping] = useState(true);

  const {
    data,
    loading: userLoading,
    refetch,
  } = useQuery(GET_CURRENT_USER, {
    skip: bootstrapping,
    fetchPolicy: 'network-only',
  });

  const [loginMutation, { loading: loginLoading }] = useMutation(LOGIN_MUTATION);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const token = await getToken();
      if (!mounted) return;
      if (!token) {
        setBootstrapping(false);
        return;
      }
      try {
        await refetch();
      } catch {
        await clearSession();
      } finally {
        if (mounted) setBootstrapping(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [refetch]);

  const user = (data?.currentUser as User | undefined) ?? null;
  const loading = bootstrapping || userLoading || loginLoading;

  useEffect(() => {
    if (loading) return;
    const inAuth = segments[0] === '(auth)';
    if (!user && !inAuth) {
      router.replace('/(auth)/login');
    } else if (user && inAuth) {
      router.replace('/(tabs)/dashboard');
    }
  }, [user, loading, segments, router]);

  const login = useCallback(
    async (email: string, password: string, tenantSubdomain = API.defaultTenant) => {
      await apolloClient.resetStore();

      const { data: loginData } = await loginMutation({
        variables: { input: { email, password } },
        context: {
          headers: { 'x-tenant': tenantSubdomain },
        },
      });

      const payload = loginData?.login;
      if (!payload?.token || !payload.user?.tenant) {
        throw new Error('Login failed');
      }

      await saveSession(payload.token, payload.user.tenant.id, payload.user.tenant.subdomain);
      await refetch();
      router.replace('/(tabs)/dashboard');
    },
    [loginMutation, refetch, router],
  );

  const logout = useCallback(async () => {
    await clearSession();
    await apolloClient.clearStore();
    router.replace('/(auth)/login');
  }, [router]);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
    }),
    [user, loading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export async function getStoredTenantId(): Promise<string | null> {
  return getTenantId();
}
