export function Footer() {
  return (
    <footer style={{ background: 'var(--color-bg-tertiary)', borderTop: '1px solid var(--color-separator)' }}>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-primary mb-4">LuxGen</h3>
            <p className="text-secondary text-sm">Multi-tenant learning management for modern organizations.</p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-primary mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-secondary">
              <li>
                <a href="/dashboard" className="hover:opacity-80">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="/billing" className="hover:opacity-80">
                  Pricing
                </a>
              </li>
              <li>
                <a href="https://github.com/susil-bot/luxgen-monorepo" className="hover:opacity-80">
                  Documentation
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-primary mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-secondary">
              <li>
                <a href="/courses" className="hover:opacity-80">
                  Courses
                </a>
              </li>
              <li>
                <a href="/groups" className="hover:opacity-80">
                  Groups
                </a>
              </li>
              <li>
                <a href="/automations" className="hover:opacity-80">
                  Automations
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-primary mb-4">Account</h4>
            <ul className="space-y-2 text-sm text-secondary">
              <li>
                <a href="/login" className="hover:opacity-80">
                  Sign in
                </a>
              </li>
              <li>
                <a href="/register" className="hover:opacity-80">
                  Register
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div
          className="mt-8 pt-8 text-center text-sm text-secondary"
          style={{ borderTop: '1px solid var(--color-separator)' }}
        >
          <p>&copy; {new Date().getFullYear()} LuxGen. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
