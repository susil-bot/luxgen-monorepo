import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as Linking from 'expo-linking';

import { fetchTenantConfig, fetchTenantCurrent, type TenantBrandingPayload } from '../lib/tenant-api';
import {
  getActiveTenantSubdomain,
  getBuildTimeTenantSlug,
  normalizeTenantSubdomain,
  setActiveTenantSubdomain,
} from '../lib/tenant-auth';
import { parseTenantFromUrl } from '../lib/tenant-link';
import { API } from '../constants/api';

interface TenantContextValue {
  subdomain: string;
  tenantId: string | null;
  tenantName: string | null;
  branding: TenantBrandingPayload | null;
  loading: boolean;
  setTenant: (subdomain: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const TenantContext = createContext<TenantContextValue | null>(null);

async function resolveInitialTenant(url: string | null): Promise<string> {
  if (url) {
    const fromLink = parseTenantFromUrl(url);
    if (fromLink) {
      await setActiveTenantSubdomain(fromLink);
      return normalizeTenantSubdomain(fromLink);
    }
  }

  const buildSlug = getBuildTimeTenantSlug();
  if (buildSlug) {
    await setActiveTenantSubdomain(buildSlug);
    return buildSlug;
  }

  return getActiveTenantSubdomain();
}

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [subdomain, setSubdomain] = useState(normalizeTenantSubdomain(API.defaultTenant));
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [tenantName, setTenantName] = useState<string | null>(null);
  const [branding, setBranding] = useState<TenantBrandingPayload | null>(null);
  const [loading, setLoading] = useState(true);

  const loadTenantData = useCallback(async (tenantSubdomain: string) => {
    const normalized = normalizeTenantSubdomain(tenantSubdomain);
    setSubdomain(normalized);
    setLoading(true);

    try {
      const [current, config] = await Promise.all([fetchTenantCurrent(), fetchTenantConfig()]);
      setTenantId(current.id);
      setTenantName(current.name);
      setBranding({
        ...config.branding,
        primaryColor: config.branding.primaryColor ?? current.branding.primaryColor,
        accentColor: config.branding.accentColor ?? current.branding.accentColor,
      });
    } catch {
      setTenantId(null);
      setTenantName(`${normalized.charAt(0).toUpperCase()}${normalized.slice(1)}`);
      setBranding(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const setTenant = useCallback(
    async (nextSubdomain: string) => {
      const normalized = normalizeTenantSubdomain(nextSubdomain);
      await setActiveTenantSubdomain(normalized);
      await loadTenantData(normalized);
    },
    [loadTenantData],
  );

  const refresh = useCallback(async () => {
    const active = await getActiveTenantSubdomain();
    await loadTenantData(active);
  }, [loadTenantData]);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async (url: string | null) => {
      const initial = await resolveInitialTenant(url);
      if (!mounted) return;
      await loadTenantData(initial);
    };

    void Linking.getInitialURL().then((url) => bootstrap(url));

    const subscription = Linking.addEventListener('url', ({ url }) => {
      const fromLink = parseTenantFromUrl(url);
      if (!fromLink) return;
      void setTenant(fromLink);
    });

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, [loadTenantData, setTenant]);

  const value = useMemo(
    () => ({
      subdomain,
      tenantId,
      tenantName,
      branding,
      loading,
      setTenant,
      refresh,
    }),
    [subdomain, tenantId, tenantName, branding, loading, setTenant, refresh],
  );

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant(): TenantContextValue {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error('useTenant must be used within TenantProvider');
  return ctx;
}
