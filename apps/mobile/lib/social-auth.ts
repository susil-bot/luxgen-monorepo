import { Alert } from 'react-native';

export type SocialProvider = 'google' | 'apple' | 'facebook';

const LABELS: Record<SocialProvider, string> = {
  google: 'Google',
  apple: 'Apple',
  facebook: 'Facebook',
};

/** Matches web register page — social OAuth is not wired yet */
export function showSocialLoginUnavailable(provider: SocialProvider): void {
  Alert.alert(
    'Coming soon',
    `${LABELS[provider]} sign-in is not available yet. Use email and password, or sign up for a new account.`,
  );
}
