import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Button, Screen } from '@luxgen/native-ui';
import { luxgenBrand } from '@luxgen/design-tokens';
import { getPlanDefinition } from '@luxgen/billing';
import type { PlanTier } from '@luxgen/billing';

import { useAuth } from '../hooks/useAuth';

interface PlanUpgradeScreenProps {
  planName: string;
  requiredPlan: PlanTier;
}

export function PlanUpgradeScreen({ planName, requiredPlan }: PlanUpgradeScreenProps) {
  const { user, logout } = useAuth();
  const required = getPlanDefinition(requiredPlan);

  return (
    <Screen title={luxgenBrand.productName} subtitle="Mobile learner app">
      <View style={styles.card}>
        <Text style={styles.title}>Mobile app not included</Text>
        <Text style={styles.body}>
          {user?.tenant.name ?? 'Your organization'} is on the {planName} plan. The learner mobile app requires{' '}
          {required.name} or higher.
        </Text>
        <Text style={styles.hint}>Ask your admin to upgrade billing, or sign in with a Pro tenant.</Text>
        <Button title="Sign out" variant="secondary" onPress={() => void logout()} style={styles.button} />
      </View>
    </Screen>
  );
}

export function PlanGateLoading() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color="#007AFF" />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  body: {
    fontSize: 15,
    color: 'rgba(60, 60, 67, 0.6)',
    lineHeight: 22,
  },
  hint: {
    fontSize: 13,
    color: 'rgba(60, 60, 67, 0.45)',
  },
  button: {
    marginTop: 8,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f2f2f7',
  },
});
