import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { ApolloProvider } from '@apollo/client';
import { client } from '../graphql/client';
import { GlobalProvider, NavigationProvider, AIStudioProvider, AIStudioPanelSlot, ErrorBoundary } from '@luxgen/ui';
import { ThemeProvider } from '../lib/theme';
import { TenantThemeBridge } from '../components/theme/TenantThemeBridge';
import { RouteProgressBar } from '../components/layout/RouteProgressBar';
import { AuthGuard } from '../components/auth/AuthGuard';
import { SessionMonitor } from '../components/auth/SessionMonitor';
import { SessionSync } from '../components/auth/SessionSync';
import { SuperAdminTenantSwitchProvider } from '../components/layout/SuperAdminTenantSwitchProvider';
import { GlobalNotificationHost } from '../lib/global-notifications';
import { AIStudioSidekickPanel } from '../components/agent/AIStudioSidekickPanel';
import { DefaultPageHead } from '../components/seo/PageHead';
import { LayoutUserProvider, type LayoutUser } from '../lib/app-layout-user';
import { inter } from '../lib/fonts';
import '../styles/globals.css';
import '../../../packages/ui/src/Sidebar/sidebar.css';
import '../../../packages/ui/src/Arrow/arrow.css';
import '../../../packages/ui/src/ProductCard/product-card.css';
import '../../../packages/ui/src/Kicker/kicker.css';

function WebNavigationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  return (
    <NavigationProvider
      pathname={router.pathname}
      onNavigate={(href) => {
        if (href !== router.pathname) {
          void router.push(href);
        }
      }}
    >
      {children}
    </NavigationProvider>
  );
}

export default function App({ Component, pageProps }: AppProps) {
  const layoutUser = (pageProps as { layoutUser?: LayoutUser | null }).layoutUser ?? null;

  return (
    <div className={inter.className}>
    <ApolloProvider client={client}>
      <ThemeProvider>
        <GlobalProvider initialTenant={pageProps.tenant || 'demo'}>
          <TenantThemeBridge />
          <RouteProgressBar />
          <DefaultPageHead />
          <AIStudioProvider>
            <WebNavigationProvider>
              <LayoutUserProvider initialUser={layoutUser}>
                <SuperAdminTenantSwitchProvider>
                  <GlobalNotificationHost>
                  <SessionMonitor />
                  <SessionSync />
                  <AIStudioPanelSlot>
                    <AIStudioSidekickPanel />
                  </AIStudioPanelSlot>
                  <a
                    href="#main-content"
                    className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[9999] focus:px-3 focus:py-2"
                  >
                    Skip to main content
                  </a>
                  <AuthGuard>
                    <ErrorBoundary>
                      <Component {...pageProps} />
                    </ErrorBoundary>
                  </AuthGuard>
                  </GlobalNotificationHost>
                </SuperAdminTenantSwitchProvider>
              </LayoutUserProvider>
            </WebNavigationProvider>
          </AIStudioProvider>
        </GlobalProvider>
      </ThemeProvider>
    </ApolloProvider>
    </div>
  );
}
