import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_SEEN_KEY = 'learner_onboarding_seen';

export const SPLASH_ROUTE = '/(learner)/splash' as const;
export const ONBOARDING_ROUTE = '/(learner)/onboarding' as const;
export const SIGN_UP_ROUTE = '/(learner)/sign-up' as const;

export async function hasSeenLearnerOnboarding(): Promise<boolean> {
  const value = await AsyncStorage.getItem(ONBOARDING_SEEN_KEY);
  return value === '1';
}

export async function markLearnerOnboardingSeen(): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_SEEN_KEY, '1');
}

export async function clearLearnerOnboardingSeen(): Promise<void> {
  await AsyncStorage.removeItem(ONBOARDING_SEEN_KEY);
}

/**
 * Guest cold start always opens splash so the marketing flow is visible.
 * (Onboarding → Sign up follows from the splash screen.)
 */
export async function resolveGuestEntryRoute(): Promise<typeof SPLASH_ROUTE> {
  return SPLASH_ROUTE;
}
