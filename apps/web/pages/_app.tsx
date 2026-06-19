import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { ApolloProvider } from '@apollo/client';
import { client } from '../graphql/client';
import { GlobalProvider, NavigationProvider, AIStudioProvider, AIStudioPanelSlot } from '@luxgen/ui';
import { ThemeProvider } from '../lib/theme';
import { AuthGuard } from '../components/auth/AuthGuard';
import { SessionMonitor } from '../components/auth/SessionMonitor';
import { SessionSync } from '../components/auth/SessionSync';
import { AIStudioSidekickPanel } from '../components/agent/AIStudioSidekickPanel';
import '../styles/globals.css';

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
  return (
    <ApolloProvider client={client}>
      <ThemeProvider>
        <GlobalProvider initialTenant={pageProps.tenant || 'demo'}>
          <AIStudioProvider>
            <WebNavigationProvider>
              <SessionMonitor />
              <SessionSync />
              <AIStudioPanelSlot>
                <AIStudioSidekickPanel />
              </AIStudioPanelSlot>
              <AuthGuard>
                <Component {...pageProps} />
              </AuthGuard>
            </WebNavigationProvider>
          </AIStudioProvider>
        </GlobalProvider>
      </ThemeProvider>
    </ApolloProvider>
  );
}
