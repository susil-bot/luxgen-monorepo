import { ExpoConfig, ConfigContext } from 'expo/config';

const tenantSlug = process.env.EXPO_PUBLIC_TENANT_SLUG;
const appName = process.env.EXPO_PUBLIC_APP_NAME ?? 'LuxGen';
const bundleSuffix = tenantSlug ? `.${tenantSlug}` : '';
const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? process.env.EXPO_PUBLIC_GRAPHQL_URL;
const allowsCleartextApi = process.env.NODE_ENV !== 'production' && apiUrl?.startsWith('http://');

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: appName,
  slug: tenantSlug ? `luxgen-${tenantSlug}` : 'luxgen-mobile',
  version: '1.0.0',
  orientation: 'portrait',
  scheme: tenantSlug ? `luxgen-${tenantSlug}` : 'luxgen',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: `com.luxgen.mobile${bundleSuffix}`,
    ...(allowsCleartextApi
      ? {
          infoPlist: {
            NSAppTransportSecurity: {
              NSAllowsArbitraryLoads: true,
            },
          },
        }
      : {}),
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#007AFF',
    },
    package: `com.luxgen.mobile${bundleSuffix}`,
    ...(allowsCleartextApi ? ({ usesCleartextTraffic: true } as Record<string, unknown>) : {}),
  },
  plugins: ['expo-router', 'expo-secure-store', 'expo-notifications'],
  updates: {
    url: 'https://u.expo.dev/luxgen-mobile-placeholder',
    fallbackToCacheTimeout: 0,
  },
  runtimeVersion: {
    policy: 'appVersion',
  },
  experiments: {
    typedRoutes: true,
  },
  extra: {
    eas: {
      projectId: process.env.EAS_PROJECT_ID ?? 'luxgen-mobile-placeholder',
    },
    tenantSlug: tenantSlug ?? null,
  },
});
