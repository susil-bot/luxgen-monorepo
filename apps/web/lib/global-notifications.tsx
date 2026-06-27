import { useEffect, useState, type ReactNode } from 'react';
import { NotificationPanel } from '../components/notifications/NotificationBell';

export const TOGGLE_NOTIFICATIONS_EVENT = 'luxgen-toggle-notifications';

export function GlobalNotificationHost({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen((v) => !v);
    window.addEventListener(TOGGLE_NOTIFICATIONS_EVENT, handler);
    return () => window.removeEventListener(TOGGLE_NOTIFICATIONS_EVENT, handler);
  }, []);

  return (
    <>
      {children}
      {open && (
        <div className="fixed top-14 right-4 z-[150]">
          <NotificationPanel onClose={() => setOpen(false)} />
        </div>
      )}
    </>
  );
}

export function dispatchToggleNotifications(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(TOGGLE_NOTIFICATIONS_EVENT));
}
