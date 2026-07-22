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
import { resolvePostAuthRoute, SKILL_CHECK_ROUTE } from '../lib/skill-check';
import { SPLASH_ROUTE } from '../lib/guest-flow';

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

/** Logged-out landing — splash starts Splash → Onboarding → Sign up. */
const GUEST_HOME = SPLASH_ROUTE;

/** Learner screens allowed while logged in before skill check is finished. */
const POST_AUTH_ONBOARDING = new Set(['questions', 'congratulations', 'home']);

/** Pre-auth marketing / guest screens (auth guard must not kick these). */
const PRE_AUTH_SCREENS = new Set([
  'splash',
  'onboarding',
  'sign-up',
  'sign-up-form',
  'sign-in',
  'forgot-password',
  'otp',
  'reset-password',
  'reset-success',
]);

function isRootIndex(segments: string[]): boolean {
  return segments.length === 0 || segments[0] === 'index';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const [bootstrapping, setBootstrapping] = useState(true);
  /** When set, overrides Apollo `currentUser` so logout is immediate even if cache clear races. */
  const [sessionUser, setSessionUser] = useState<User | null | undefined>(undefined);

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
        setSessionUser(null);
        // Drop any persisted Apollo currentUser so guests aren't treated as signed in
        try {
          getApolloClient().cache.evict({ fieldName: 'currentUser' });
          getApolloClient().cache.gc();
        } catch {
          // Apollo may not be ready yet during very early boot
        }
        setBootstrapping(false);
        return;
      }
      try {
        await refetch();
      } catch {
        await clearSession();
        setSessionUser(null);
      } finally {
        if (mounted) setBootstrapping(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [refetch]);

  const userFromQuery = (data?.currentUser as User | undefined) ?? null;
  // Prefer explicit session override; never treat cached currentUser as logged-in without bootstrap completing
  const user = sessionUser !== undefined ? sessionUser : userFromQuery;
  const loading = bootstrapping || (sessionUser === undefined && userLoading) || loginLoading || registerLoading;

  useEffect(() => {
    if (sessionUser === undefined && userFromQuery && !bootstrapping) {
      void getToken().then((token) => {
        if (token) setSessionUser(userFromQuery);
        else setSessionUser(null);
      });
    }
  }, [sessionUser, userFromQuery, bootstrapping]);

  useEffect(() => {
    if (!user) return;

    let mounted = true;
    (async () => {
      const activeTenant = await getActiveTenantSubdomain();
      if (!mounted) return;
      if (isSessionTenantMismatch(user.tenant?.subdomain, activeTenant)) {
        setSessionUser(null);
        await clearSession();
        try {
          await getApolloClient().clearStore();
        } catch {
          // ignore — queries may fail without a token
        }
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
    const learnerScreen = segments[1];
    const guestArea =
      isRootIndex(segments as string[]) ||
      inAuth ||
      (inLearner && typeof learnerScreen === 'string' && PRE_AUTH_SCREENS.has(learnerScreen));
    const inSkillCheck = inLearner && typeof learnerScreen === 'string' && POST_AUTH_ONBOARDING.has(learnerScreen);

    // Guests on tabs/courses → splash. Never steal control from Index while it redirects.
    if (!user && !guestArea) {
      router.replace(GUEST_HOME);
      return;
    }

    if (!user) return;

    // Logged-in users stay on skill-check screens
    if (inSkillCheck) return;

    // Root index: Index.tsx chooses dashboard vs skill-check intro
    if (isRootIndex(segments as string[])) return;

    // Logged-in on pre-auth screens (sign-up etc.) → continue post-auth flow
    if (inAuth || (inLearner && isLearnerAuthScreen(segments as string[]))) {
      void (async () => {
        const next = await resolvePostAuthRoute(user.id);
        router.replace(next);
      })();
    }

    // Logged-in user landed on splash/onboarding after a prior session — send to post-auth
    if (inLearner && (learnerScreen === 'splash' || learnerScreen === 'onboarding')) {
      void (async () => {
        const next = await resolvePostAuthRoute(user.id);
        router.replace(next);
      })();
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
      setSessionUser(payload.user as User);
      await refetch();
      // Always start the 10-question skill check after sign-in
      router.replace(SKILL_CHECK_ROUTE);
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
      setSessionUser(payload.user as User);
      await refetch();
      router.replace(SKILL_CHECK_ROUTE);
    },
    [registerMutation, refetch, router],
  );

  const logout = useCallback(async () => {
    // Clear local session first so UI/auth guard treat the user as logged out immediately
    setSessionUser(null);
    await clearSession();
    try {
      // clearStore refetches active queries; without a token currentUser often throws
      await getApolloClient().clearStore();
    } catch {
      // Expected after token removal — do not block navigation
    }
    router.replace(GUEST_HOME);
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
