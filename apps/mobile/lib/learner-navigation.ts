import { useRouter } from 'expo-router';

/** Maps legacy AppNavigator screen names → Expo Router paths */
export const LEARNER_ROUTES = {
  Splash: '/(learner)/splash',
  Home: '/(learner)/home',
  Onboarding: '/(learner)/onboarding',
  SignUp: '/(learner)/sign-up',
  SignUpForm: '/(learner)/sign-up-form',
  SignIn: '/(learner)/sign-in',
  ForgotPassword: '/(learner)/forgot-password',
  OTP: '/(learner)/otp',
  ResetPassword: '/(learner)/reset-password',
  ResetSuccess: '/(learner)/reset-success',
  QuestionProgress: '/(learner)/questions',
  Congratulations: '/(learner)/congratulations',
} as const;

export type LearnerScreenName = keyof typeof LEARNER_ROUTES;

export type LearnerNavigation = {
  navigate: (name: LearnerScreenName | string, params?: Record<string, string>) => void;
  replace: (name: LearnerScreenName | string, params?: Record<string, string>) => void;
  goBack: () => void;
};

/** Adapter so src/screens (React Navigation API) work with Expo Router */
export function useLearnerNavigation(): LearnerNavigation {
  const router = useRouter();

  const goTo = (method: 'push' | 'replace', name: LearnerScreenName | string, params?: Record<string, string>) => {
    const path = LEARNER_ROUTES[name as LearnerScreenName];
    const href = path ?? (name as `/${string}`);
    if (method === 'replace') {
      router.replace({ pathname: href, params });
      return;
    }
    router.push({ pathname: href, params });
  };

  return {
    navigate: (name, params) => goTo('push', name, params),
    replace: (name, params) => goTo('replace', name, params),
    goBack: () => {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(learner)/sign-up');
      }
    },
  };
}
