import { useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useMutation, useQuery } from '@apollo/client';
import {
  GET_NOTIFICATIONS,
  MARK_ALL_NOTIFICATIONS_READ,
  MARK_NOTIFICATION_READ,
} from '../../graphql/queries/notifications';

function formatWhen(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  if (diff < 60_000) return 'Just now';
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3600_000)}h ago`;
  return d.toLocaleDateString();
}

interface NotificationPanelProps {
  onClose: () => void;
}

/** Notification dropdown panel — wired to GET_NOTIFICATIONS (requires #209) */
export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const { data, refetch, startPolling, stopPolling } = useQuery(GET_NOTIFICATIONS, {
    variables: { limit: 15 },
    fetchPolicy: 'cache-and-network',
  });

  const [markRead] = useMutation(MARK_NOTIFICATION_READ);
  const [markAllRead] = useMutation(MARK_ALL_NOTIFICATIONS_READ);

  useEffect(() => {
    startPolling(30_000);
    return () => stopPolling();
  }, [startPolling, stopPolling]);

  const unread = data?.notifications?.unreadCount ?? 0;
  const items = data?.notifications?.items ?? [];

  const handleMarkAll = useCallback(async () => {
    await markAllRead();
    await refetch();
  }, [markAllRead, refetch]);

  return (
    <div className="w-80 max-h-96 overflow-hidden ios-card shadow-lg">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-separator)]">
        <span className="font-semibold text-primary">Notifications</span>
        <div className="flex gap-2">
          {unread > 0 && (
            <button type="button" className="text-xs text-secondary hover:text-primary" onClick={() => void handleMarkAll()}>
              Mark all read
            </button>
          )}
          <button type="button" className="text-xs text-secondary" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
      </div>
      <ul className="max-h-72 overflow-y-auto">
        {items.length === 0 && <li className="px-4 py-6 text-sm text-secondary text-center">No notifications</li>}
        {items.map((item) => (
          <li key={item.id} className={item.readAt ? 'opacity-70' : ''}>
            {item.href ? (
              <Link
                href={item.href}
                className="block px-4 py-3 hover:bg-[var(--color-fill-secondary)]"
                onClick={() => {
                  if (!item.readAt) void markRead({ variables: { id: item.id } });
                  onClose();
                }}
              >
                <p className="text-sm font-medium text-primary">{item.title}</p>
                {item.body && <p className="text-xs text-secondary mt-0.5">{item.body}</p>}
                <p className="text-xs text-tertiary mt-1">{formatWhen(item.createdAt)}</p>
              </Link>
            ) : (
              <div className="px-4 py-3">
                <p className="text-sm font-medium text-primary">{item.title}</p>
                {item.body && <p className="text-xs text-secondary mt-0.5">{item.body}</p>}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
