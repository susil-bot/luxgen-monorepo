import { StyleSheet, Text, View } from 'react-native';

import { Button, Card, Screen } from '@luxgen/native-ui';
import { luxgenBrand } from '@luxgen/design-tokens';

import { useAuth } from '../../hooks/useAuth';

export default function DashboardScreen() {
  const { user, logout } = useAuth();

  return (
    <Screen
      title={`Hello, ${user?.firstName ?? 'Learner'}`}
      subtitle={`${luxgenBrand.productName} · ${user?.tenant.name ?? ''}`}
    >
      <Card style={styles.card}>
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle}>Your account</Text>
          <Text style={styles.cardLine}>{user?.email}</Text>
          <Text style={styles.cardLine}>Role: {user?.role}</Text>
          <Text style={styles.cardLine}>Tenant: {user?.tenant.subdomain}</Text>
        </View>
      </Card>

      <Button title="Sign out" variant="secondary" onPress={() => void logout()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 8,
  },
  cardBody: {
    padding: 16,
    gap: 6,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  cardLine: {
    fontSize: 15,
    color: 'rgba(60, 60, 67, 0.6)',
  },
});
