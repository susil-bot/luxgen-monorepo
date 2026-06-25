import { useQuery } from '@apollo/client';
import { GET_NOTIFICATIONS } from '../graphql/queries/notifications';
import { validateClientSession } from './session-guard';

/** Poll notification unread count for layout headers */
export function useNotificationCount(pollMs = 60_000): number {
  const sessionOk = typeof window !== 'undefined' && validateClientSession().ok;

  const { data } = useQuery(GET_NOTIFICATIONS, {
    variables: { limit: 1 },
    skip: !sessionOk,
    pollInterval: sessionOk ? pollMs : 0,
    fetchPolicy: 'cache-and-network',
  });

  return data?.notifications?.unreadCount ?? 0;
}
