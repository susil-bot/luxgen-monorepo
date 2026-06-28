import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useRouter, useSegments } from 'expo-router';

import type { User } from '@luxgen/types';

import { GET_CURRENT_USER, LOGIN_MUTATION, REGISTER_MUTATION } from '../graphql/queries';
import { getApolloClient } from '../lib/apollo';
import { clearSession, getTenantId, getToken, saveSession } from '../lib/auth';
import {
  getActiveTenantSubdomain,
  isSessionTenantMismatch,
  resolveRequestTenant,
  setActiveTenantSubdomain,
} from '../lib/tenant-auth';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, tenantSubdomain?: string) => Promise<void>;
  register: (input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    tenantId: string;
    tenantSubdomain?: string;
  }) => Promise<void>;
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
  const [registerMutation, { loading: registerLoading }] = useMutation(REGISTER_MUTATION);

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
  const loading = bootstrapping || userLoading || loginLoading || registerLoading;

  useEffect(() => {
    if (!user) return;

    let mounted = true;
    (async () => {
      const activeTenant = await getActiveTenantSubdomain();
      if (!mounted) return;
      if (isSessionTenantMismatch(user.tenant?.subdomain, activeTenant)) {
        await clearSession();
        await getApolloClient().clearStore();
      }
    })();

    return () => {
      mounted = false;
    };
  }, [user]);

  useEffect(() => {
    if (loading) return;
    const inAuth = segments[0] === '(auth)';
    const inLearner = segments[0] === '(learner)';
    const guestArea = inAuth || inLearner;

    if (!user && !guestArea) {
      router.replace('/(learner)/onboarding');
      return;
    }

    if (user && (inAuth || (inLearner && isLearnerAuthScreen(segments as string[])))) {
      router.replace('/(tabs)/dashboard');
    }
  }, [user, loading, segments, router]);

  const login = useCallback(
    async (email: string, password: string, tenantSubdomain?: string) => {
      const tenant = await normalizeLoginTenant(tenantSubdomain);
      await setActiveTenantSubdomain(tenant);
      await getApolloClient().resetStore();

      const { data: loginData } = await loginMutation({
        variables: { input: { email, password } },
        context: {
          headers: { 'x-tenant': tenant },
        },
      });

      const payload = loginData?.login;
      if (!payload?.token || !payload.user?.tenant) {
        throw new Error('Login failed');
      }

      if (isSessionTenantMismatch(payload.user.tenant.subdomain, tenant)) {
        throw new Error(`This account belongs to ${payload.user.tenant.subdomain}, not ${tenant}.`);
      }

      await saveSession(payload.token, payload.user.tenant.id, payload.user.tenant.subdomain);
      await setActiveTenantSubdomain(payload.user.tenant.subdomain);
      await refetch();
      router.replace('/(tabs)/dashboard');
    },
    [loginMutation, refetch, router],
  );

  const register = useCallback(
    async (input: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      tenantId: string;
      tenantSubdomain?: string;
    }) => {
      const tenant = await normalizeLoginTenant(input.tenantSubdomain);
      await setActiveTenantSubdomain(tenant);
      await getApolloClient().resetStore();

      const { data: registerData } = await registerMutation({
        variables: {
          input: {
            email: input.email.trim(),
            password: input.password,
            firstName: input.firstName.trim(),
            lastName: input.lastName.trim(),
            role: 'STUDENT',
            tenantId: input.tenantId,
          },
        },
        context: {
          headers: { 'x-tenant': tenant },
        },
      });

      const payload = registerData?.register;
      if (!payload?.token || !payload.user?.tenant) {
        throw new Error('Registration failed');
      }

      await saveSession(payload.token, payload.user.tenant.id, payload.user.tenant.subdomain);
      await setActiveTenantSubdomain(payload.user.tenant.subdomain);
      await refetch();
      router.replace('/(tabs)/dashboard');
    },
    [registerMutation, refetch, router],
  );

  const logout = useCallback(async () => {
    await clearSession();
    await getApolloClient().clearStore();
    router.replace('/(learner)/onboarding');
  }, [router]);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
    }),
    [user, loading, login, register, logout],
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

const LEARNER_AUTH_SCREENS = new Set(['sign-in', 'sign-up', 'sign-up-form']);

function isLearnerAuthScreen(segments: string[]): boolean {
  const screen = segments[1];
  return screen != null && LEARNER_AUTH_SCREENS.has(screen);
}

async function normalizeLoginTenant(tenantSubdomain?: string): Promise<string> {
  if (tenantSubdomain?.trim()) {
    return tenantSubdomain.trim().toLowerCase();
  }
  return resolveRequestTenant();
}
