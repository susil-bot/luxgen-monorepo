import { useRouter } from 'next/router';
import { performLogout } from '../../lib/user-actions';

interface HeaderProps {
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

export function Header({ user }: HeaderProps) {
  const router = useRouter();

  const handleLogout = () => {
    performLogout({ router });
  };

  return (
    <header style={{ background: 'var(--color-bg-secondary)', borderBottom: '1px solid var(--color-separator)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <h1 className="text-xl font-semibold text-primary">LuxGen</h1>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-secondary">
                  {user.firstName} {user.lastName}
                </span>
                <button type="button" className="ios-btn-secondary text-sm" onClick={handleLogout}>
                  Sign out
                </button>
              </>
            ) : (
              <>
                <button type="button" className="ios-btn-secondary text-sm" onClick={() => router.push('/login')}>
                  Sign in
                </button>
                <button type="button" className="ios-btn-primary text-sm" onClick={() => router.push('/register')}>
                  Create account
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
