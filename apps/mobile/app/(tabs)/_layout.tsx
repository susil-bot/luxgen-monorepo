import { Tabs } from 'expo-router';
import { lightTheme } from '@luxgen/design-tokens';

import { PlanGateLoading, PlanUpgradeScreen } from '../../components/PlanUpgradeScreen';
import { useMobilePlanGate } from '../../hooks/useMobilePlanGate';

const theme = lightTheme;

export default function TabsLayout() {
  const { allowed, loading, planName, requiredPlan } = useMobilePlanGate();

  if (loading) return <PlanGateLoading />;
  if (!allowed) return <PlanUpgradeScreen planName={planName} requiredPlan={requiredPlan} />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.blue,
        tabBarInactiveTintColor: theme.colors.labelSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.bgSecondary,
          borderTopColor: theme.colors.separator,
        },
      }}
    >
      <Tabs.Screen name="dashboard" options={{ title: 'Home' }} />
      <Tabs.Screen name="courses" options={{ title: 'Courses' }} />
      <Tabs.Screen name="enrollments" options={{ title: 'Learning' }} />
      <Tabs.Screen name="profile" options={{ title: 'Account' }} />
    </Tabs>
  );
}
