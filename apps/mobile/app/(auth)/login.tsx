import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Linking from 'expo-linking';

import { Button, Screen } from '@luxgen/native-ui';
import { luxgenBrand } from '@luxgen/design-tokens';

import { API } from '../../constants/api';
import { useAuth } from '../../hooks/useAuth';
import { parseTenantFromUrl } from '../../lib/tenant-link';

export default function LoginScreen() {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('alex.thompson@demo.com');
  const [password, setPassword] = useState('password123');
  const [tenant, setTenant] = useState(API.defaultTenant);

  useEffect(() => {
    const applyUrl = (url: string | null) => {
      if (!url) return;
      const fromLink = parseTenantFromUrl(url);
      if (fromLink) setTenant(fromLink);
    };

    void Linking.getInitialURL().then(applyUrl);
    const subscription = Linking.addEventListener('url', ({ url }) => applyUrl(url));
    return () => subscription.remove();
  }, []);

  const onSubmit = async () => {
    try {
      await login(email.trim(), password, tenant.trim() || API.defaultTenant);
    } catch (error) {
      Alert.alert('Sign in failed', error instanceof Error ? error.message : 'Invalid email or password');
    }
  };

  return (
    <Screen title={luxgenBrand.productName} subtitle={luxgenBrand.tagline}>
      <View style={styles.form}>
        <Text style={styles.label}>Tenant</Text>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="demo"
          style={styles.input}
          value={tenant}
          onChangeText={setTenant}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          placeholder="you@example.com"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          secureTextEntry
          placeholder="••••••••"
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />

        <Button title="Sign in" loading={loading} onPress={onSubmit} />

        <Text style={styles.hint}>Deep link: luxgen://login?tenant=demo — QR can encode this URL for your tenant.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(60, 60, 67, 0.6)',
    marginTop: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 4,
  },
  hint: {
    fontSize: 12,
    color: 'rgba(60, 60, 67, 0.45)',
    marginTop: 12,
    lineHeight: 18,
  },
});
