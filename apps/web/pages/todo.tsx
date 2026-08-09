import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from '@apollo/client';
import { AppLayout, SnackbarProvider, useSnackbar, TodoPageHeader, TodoToDoIcon } from '@luxgen/ui';
import { useAppShellConfig } from '../lib/app-shell-config';
import { useLayoutUser } from '../lib/app-layout-user';
import { getTenantPageProps } from '../lib/tenant-page-props';
import { GET_TODO_LISTS, CREATE_TODO_LIST } from '../graphql/queries/todo';

interface Props {
  tenant: string;
}

interface TodoListSummary {
  id: string;
  name: string;
  taskCount: number;
  updatedAt: string;
}

/**
 * Todo List hub — the "n number of todo [lists] with different names" directory. Shows every
 * named list as a card; opening one loads apps/web/pages/todo/[id].tsx scoped to that list's
 * tasks. Mirrors the reference UI's "To Do List / Todo List" breadcrumb pattern: this page is
 * the parent ("Todo List"), each list page is the child, breadcrumbed as [this list's name].
 */
function TodoHubContent({ tenant }: Props) {
  const router = useRouter();
  const { sidebarSections, logo } = useAppShellConfig();
  const layoutUser = useLayoutUser();
  const { showError } = useSnackbar();
  const [draftName, setDraftName] = useState('');
  const [creating, setCreating] = useState(false);

  const { data, loading, error, refetch } = useQuery(GET_TODO_LISTS, {
    variables: { tenantId: tenant },
    fetchPolicy: 'cache-and-network',
  });
  const lists: TodoListSummary[] = data?.todoLists ?? [];

  const [createTodoList] = useMutation(CREATE_TODO_LIST);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = draftName.trim();
    if (!name || creating) return;
    setCreating(true);
    try {
      const { data: created } = await createTodoList({ variables: { input: { tenantId: tenant, name } } });
      setDraftName('');
      await refetch();
      const newId = created?.createTodoList?.id;
      if (newId) router.push(`/todo/${newId}`);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to create list');
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <Head>
        <title>Todo List — {tenant}</title>
      </Head>
      <AppLayout responsive sidebarSections={sidebarSections} user={layoutUser ?? undefined} logo={logo}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <TodoPageHeader breadcrumb={['Todo List']} title="Todo List" subtitle="Pick a list to open, or start a new one." />

          <form onSubmit={handleCreate} className="ios-card p-4 mb-6" style={{ display: 'flex', gap: '0.625rem' }}>
            <input
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              placeholder="New list name (e.g. Work, Personal, Launch checklist)"
              aria-label="New list name"
              style={{
                flex: 1,
                border: '1px solid var(--color-border, #e5e7eb)',
                borderRadius: 'var(--radius-md, 10px)',
                padding: '0.5rem 0.75rem',
                background: 'transparent',
                color: 'var(--color-text-primary, #111827)',
              }}
            />
            <button type="submit" className="ios-btn-primary" disabled={!draftName.trim() || creating}>
              {creating ? 'Creating…' : 'New list'}
            </button>
          </form>

          {loading && !data && <p className="text-sm text-secondary">Loading…</p>}

          {error && (
            <p className="text-sm" style={{ color: 'var(--color-red)' }}>
              {error.message}
            </p>
          )}

          {!loading || data ? (
            lists.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                No lists yet — create your first one above.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {lists.map((list) => (
                  <button
                    key={list.id}
                    type="button"
                    onClick={() => router.push(`/todo/${list.id}`)}
                    className="ios-card p-4 text-left"
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <TodoToDoIcon size={18} />
                      <span className="font-semibold" style={{ color: 'var(--color-text-primary, #111827)' }}>
                        {list.name}
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--color-text-secondary, #6b7280)' }}>
                      {list.taskCount} {list.taskCount === 1 ? 'task' : 'tasks'}
                    </p>
                  </button>
                ))}
              </div>
            )
          ) : null}
        </div>
      </AppLayout>
    </>
  );
}

export default function TodoHubPage(props: Props) {
  return (
    <SnackbarProvider position="top-right" maxSnackbars={3}>
      <TodoHubContent {...props} />
    </SnackbarProvider>
  );
}

export const getServerSideProps = getTenantPageProps;
