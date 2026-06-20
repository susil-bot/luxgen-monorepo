import { StyleSheet, Text, View } from 'react-native';

import { Button, Card, Screen } from '@luxgen/native-ui';
import { luxgenBrand } from '@luxgen/design-tokens';

import { buildTenantLoginLink } from '../../lib/tenant-link';
import { useAuth } from '../../hooks/useAuth';
import { useMobilePlanGate } from '../../hooks/useMobilePlanGate';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { planName, requiredPlan, allowed } = useMobilePlanGate();

  const tenantLink = user?.tenant.subdomain ? buildTenantLoginLink(user.tenant.subdomain) : null;

  return (
    <Screen title="Account" subtitle={luxgenBrand.productName}>
      <Card>
        <View style={styles.cardBody}>
          <Text style={styles.name}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={styles.line}>{user?.email}</Text>
          <Text style={styles.line}>Role: {user?.role}</Text>
          <Text style={styles.line}>Tenant: {user?.tenant.name}</Text>
          <Text style={styles.line}>Subdomain: {user?.tenant.subdomain}</Text>
        </View>
      </Card>

      <Card>
        <View style={styles.cardBody}>
          <Text style={styles.sectionTitle}>Plan</Text>
          <Text style={styles.line}>
            {planName} · Mobile app {allowed ? 'enabled' : `requires ${requiredPlan}+`}
          </Text>
        </View>
      </Card>

      {tenantLink ? (
        <Card>
          <View style={styles.cardBody}>
            <Text style={styles.sectionTitle}>Tenant link</Text>
            <Text style={styles.mono} selectable>
              {tenantLink}
            </Text>
            <Text style={styles.hint}>Share this deep link so learners open the app with the correct tenant.</Text>
          </View>
        </Card>
      ) : null}

      <Button title="Sign out" variant="secondary" onPress={() => void logout()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  cardBody: {
    padding: 16,
    gap: 6,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
  },
  line: {
    fontSize: 15,
    color: 'rgba(60, 60, 67, 0.6)',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: 'rgba(60, 60, 67, 0.45)',
    marginBottom: 4,
  },
  mono: {
    fontSize: 13,
    fontFamily: 'Menlo',
    color: '#007AFF',
  },
  hint: {
    fontSize: 13,
    color: 'rgba(60, 60, 67, 0.45)',
    marginTop: 4,
  },
});
