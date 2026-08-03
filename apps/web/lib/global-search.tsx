import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { GlobalSearchOverlay } from '@luxgen/ui';

export const OPEN_GLOBAL_SEARCH_EVENT = 'luxgen-open-global-search';

export type OpenGlobalSearchDetail = { query?: string };

export function dispatchOpenGlobalSearch(query?: string): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<OpenGlobalSearchDetail>(OPEN_GLOBAL_SEARCH_EVENT, {
      detail: { query: query?.trim() || undefined },
    }),
  );
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (target.isContentEditable) return true;
  return Boolean(target.closest('[contenteditable="true"]'));
}

/**
 * Mount once in `_app` — Cmd/Ctrl+K opens the global search overlay shell.
 * Does not fabricate users; guest NavBar/session rules stay with layout headers.
 */
export function GlobalSearchHost({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [initialQuery, setInitialQuery] = useState('');

  const close = useCallback(() => {
    setOpen(false);
    setInitialQuery('');
  }, []);

  const openWith = useCallback((query?: string) => {
    setInitialQuery(query?.trim() ?? '');
    setOpen(true);
  }, []);

  useEffect(() => {
    const onOpen = (e: Event) => {
      const detail = (e as CustomEvent<OpenGlobalSearchDetail>).detail;
      openWith(detail?.query);
    };
    window.addEventListener(OPEN_GLOBAL_SEARCH_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_GLOBAL_SEARCH_EVENT, onOpen);
  }, [openWith]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== 'k') return;
      // Always intercept so the browser find UI does not steal focus
      e.preventDefault();
      if (open) {
        close();
        return;
      }
      // Allow Cmd+K even from inputs (common command-palette UX)
      openWith(isEditableTarget(e.target) && e.target instanceof HTMLInputElement ? e.target.value : undefined);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, close, openWith]);

  return (
    <>
      {children}
      <GlobalSearchOverlay open={open} onClose={close} initialQuery={initialQuery} />
    </>
  );
}
