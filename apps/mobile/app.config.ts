import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'LuxGen',
  slug: 'luxgen-mobile',
  version: '1.0.0',
  orientation: 'portrait',
  scheme: 'luxgen',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.luxgen.mobile',
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#007AFF',
    },
    package: 'com.luxgen.mobile',
  },
  plugins: ['expo-router', 'expo-secure-store'],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    eas: {
      projectId: 'luxgen-mobile-placeholder',
    },
  },
});
