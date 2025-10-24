import type { AppProps } from 'next/app';
import { ApolloProvider } from '@apollo/client';
import { client } from '../graphql/client';
import { GlobalProvider } from '@luxgen/ui';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ApolloProvider client={client}>
      <GlobalProvider>
        <Component {...pageProps} />
      </GlobalProvider>
    </ApolloProvider>
  );
}
