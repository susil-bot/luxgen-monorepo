import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { ApolloProvider, type ApolloClient, type NormalizedCacheObject } from '@apollo/client';

import { initApolloClient } from '../lib/apollo';

export function ApolloPersistProvider({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<ApolloClient<NormalizedCacheObject> | null>(null);

  useEffect(() => {
    let mounted = true;
    initApolloClient().then((apollo) => {
      if (mounted) setClient(apollo);
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!client) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
