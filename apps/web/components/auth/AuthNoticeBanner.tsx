import type { AuthNoticeContent } from '../../lib/auth-notices';

interface AuthNoticeBannerProps {
  notice: AuthNoticeContent;
  onDismiss?: () => void;
}

/**
 * iOS-style inline notice for login/register auth states.
 * Uses design tokens from globals.css — no Tailwind colour utilities.
 */
export function AuthNoticeBanner({ notice, onDismiss }: AuthNoticeBannerProps) {
  return (
    <div className={`auth-notice auth-notice--${notice.variant}`} role="status" aria-live="polite">
      <span className="auth-notice__icon" aria-hidden="true">
        {notice.icon}
      </span>
      <div className="auth-notice__body">
        <p className="auth-notice__title">{notice.title}</p>
        <p className="auth-notice__message">{notice.message}</p>
      </div>
      {onDismiss && (
        <button type="button" className="ios-btn-plain auth-notice__dismiss" onClick={onDismiss} aria-label="Dismiss">
          Done
        </button>
      )}
    </div>
  );
}

interface AuthLoadingScreenProps {
  label?: string;
}

/** Full-screen iOS loading state for AuthGuard redirects */
export function AuthLoadingScreen({ label = 'Loading…' }: AuthLoadingScreenProps) {
  return (
    <div
      className="auth-loading-screen"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        background: 'var(--color-bg-primary, #f2f2f7)',
      }}
    >
      <div
        className="ios-spinner ios-spinner-lg"
        aria-hidden="true"
        style={{
          width: 32,
          height: 32,
          border: '3px solid rgba(120,120,128,0.2)',
          borderTopColor: 'var(--color-blue, #007aff)',
          borderRadius: '50%',
        }}
      />
      <p
        className="auth-loading-screen__label"
        style={{ fontSize: 15, color: 'var(--color-label-secondary, rgba(60,60,67,0.6))', margin: 0 }}
      >
        {label}
      </p>
    </div>
  );
}
