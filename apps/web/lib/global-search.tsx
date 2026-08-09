import { useCallback, useDeferredValue, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/router';
import { GlobalSearchOverlay } from '@luxgen/ui';
import { useSearchPresenter } from '@luxgen/presenters/search';
import { useAppTenant, useAppTenantId } from './app-layout-user';
import { filterPaletteCommands, type PaletteCommand } from './command-palette-commands';
import { CommandPaletteOverlay } from '../components/search/CommandPaletteOverlay';

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
 * Mount once in `_app` — Cmd/Ctrl+K opens global search with live course/learner cards.
 */
export function GlobalSearchHost({ children }: { children: ReactNode }) {
  const router = useRouter();
  const tenant = useAppTenant();
  const tenantId = useAppTenantId();
  const [open, setOpen] = useState(false);
  const [initialQuery, setInitialQuery] = useState('');
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  const close = useCallback(() => {
    setOpen(false);
    setInitialQuery('');
    setQuery('');
  }, []);

  const openWith = useCallback((q?: string) => {
    const next = q?.trim() ?? '';
    setInitialQuery(next);
    setQuery(next);
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
      e.preventDefault();
      if (open) {
        close();
        return;
      }
      openWith(isEditableTarget(e.target) && e.target instanceof HTMLInputElement ? e.target.value : undefined);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, close, openWith]);

  // `>` prefix switches the overlay into command-palette mode (docs/TODO-search.md §3).
  // Kept separate from GlobalSearchOverlay (packages/ui) — this task (T-SRCH-03) is
  // scoped to apps/web only, and reuses none of the shared overlay's result list.
  const isCommandMode = query.trimStart().startsWith('>');
  const commandQuery = isCommandMode ? query.trimStart().slice(1) : '';
  const commands = useMemo(() => filterPaletteCommands(commandQuery), [commandQuery]);

  const runCommand = useCallback(
    (command: PaletteCommand) => {
      close();
      void router.push(command.href);
    },
    [close, router],
  );

  const { viewModel, loading, error } = useSearchPresenter({
    query: open && !isCommandMode ? deferredQuery : '',
    tenantId,
    tenant,
  });

  return (
    <>
      {children}
      {isCommandMode ? (
        <CommandPaletteOverlay
          open={open}
          query={commandQuery}
          commands={commands}
          onQueryChange={(next) => setQuery(`>${next}`)}
          onClose={close}
          onExecute={runCommand}
        />
      ) : (
        <GlobalSearchOverlay
          open={open}
          onClose={close}
          initialQuery={initialQuery}
          results={viewModel.results}
          loading={loading}
          error={error}
          onQueryChange={setQuery}
          onSelectResult={(item) => {
            close();
            void router.push(item.href);
          }}
        />
      )}
    </>
  );
}
