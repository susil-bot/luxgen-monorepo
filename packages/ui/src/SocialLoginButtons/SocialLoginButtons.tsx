import type { SocialProvider } from './types';

const PROVIDER_LABELS: Record<SocialProvider, string> = {
  google: 'Google',
  linkedin: 'LinkedIn',
  github: 'GitHub',
};

const PROVIDER_ICONS: Record<SocialProvider, string> = {
  google: 'G',
  linkedin: 'in',
  github: '⌘',
};

export interface SocialLoginButtonsProps {
  providers: SocialProvider[];
  disabled?: boolean;
  heading?: string;
  onSocialLogin?: (provider: SocialProvider) => void | Promise<void>;
}

/** Shared social OAuth buttons for LoginForm and RegisterForm (UI-187). */
export function SocialLoginButtons({
  providers,
  disabled = false,
  heading = 'Or continue with',
  onSocialLogin,
}: SocialLoginButtonsProps) {
  if (!providers.length || !onSocialLogin) return null;

  return (
    <div className="mt-8">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">{heading}</span>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-3">
        {providers.map((provider) => (
          <button
            key={provider}
            type="button"
            disabled={disabled}
            onClick={() => void onSocialLogin(provider)}
            className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <span className="mr-2" aria-hidden>
              {PROVIDER_ICONS[provider]}
            </span>
            {PROVIDER_LABELS[provider]}
          </button>
        ))}
      </div>
    </div>
  );
}

export type { SocialProvider };
