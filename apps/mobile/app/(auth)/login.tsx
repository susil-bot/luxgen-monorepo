import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button, Screen } from '@luxgen/native-ui';
import { luxgenBrand } from '@luxgen/design-tokens';

import { useAuth } from '../../hooks/useAuth';
import { useTenant } from '../../hooks/useTenant';

export default function LoginScreen() {
  const { login, loading } = useAuth();
  const { subdomain, tenantName, setTenant } = useTenant();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tenantInput, setTenantInput] = useState(subdomain);

  useEffect(() => {
    setTenantInput(subdomain);
  }, [subdomain]);

  const onSubmit = async () => {
    try {
      const tenant = tenantInput.trim() || subdomain;
      await setTenant(tenant);
      await login(email.trim(), password, tenant);
    } catch (error) {
      Alert.alert('Sign in failed', error instanceof Error ? error.message : 'Invalid email or password');
    }
  };

  return (
    <Screen title={luxgenBrand.productName} subtitle={tenantName ?? luxgenBrand.tagline}>
      <View style={styles.form}>
        <Text style={styles.label}>Tenant</Text>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="demo"
          style={styles.input}
          value={tenantInput}
          onChangeText={setTenantInput}
          onBlur={() => {
            if (tenantInput.trim()) void setTenant(tenantInput.trim());
          }}
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
