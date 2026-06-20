import { useAuth } from '../hooks/useAuth';
import { useOtaUpdates } from '../hooks/useOtaUpdates';
import { usePushNotifications } from '../hooks/usePushNotifications';

/** Wires Phase 3 mobile integrations after auth is available. */
export function MobileBootstrap({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  useOtaUpdates();
  usePushNotifications(user?.id);

  return children;
}
