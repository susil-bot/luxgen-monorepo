import { useState } from 'react';
import Head from 'next/head';
import { useMutation, useQuery } from '@apollo/client';
import { AppLayout, SnackbarProvider, useSnackbar, Tab, TabItem, TodoItem, TodoList, TodoCard, TodoStatsChart } from '@luxgen/ui';
import { TodoBoard } from '../components/todo/TodoBoard';
import { useAppShellConfig } from '../lib/app-shell-config';
import { useLayoutUser } from '../lib/app-layout-user';
import { getTenantPageProps } from '../lib/tenant-page-props';
import { GET_TASKS, CREATE_TASK, TOGGLE_TASK, DELETE_TASK, REORDER_TASKS } from '../graphql/queries/todo';

interface Props {
  tenant: string;
}

/**
 * Todo List — Workspace domain, sibling to Project. Matches the reference screenshot's
 * five views (To Do / Done / Board / Chart / Gallery) plus a "+" add-view menu. Table is
 * wired to the existing generic Table component; the remaining add-view options
 * (Dashboard, Timeline, Feed, Map, Calendar, Form) are not built — showing a "Coming soon"
 * toast rather than fabricating functionality that doesn't exist yet.
 */
const ADD_VIEW_OPTIONS = ['Table', 'Board', 'Gallery', 'List', 'Chart', 'Dashboard', 'Timeline', 'Feed', 'Map', 'Calendar', 'Form'];
const AVAILABLE_VIEWS = new Set(['Table', 'Board', 'Gallery', 'List', 'Chart']);

function TodoContent({ tenant }: Props) {
  const { sidebarSections, logo } = useAppShellConfig();
  const layoutUser = useLayoutUser();
  const { showSuccess, showError, showInfo } = useSnackbar();
  const [showAddView, setShowAddView] = useState(false);

  const { data, loading, error, refetch } = useQuery(GET_TASKS, {
    variables: { tenantId: tenant },
    fetchPolicy: 'cache-and-network',
  });
  const tasks: TodoItem[] = data?.tasks ?? [];
  const todoTasks = tasks.filter((t) => t.status === 'TODO');
  const doneTasks = tasks.filter((t) => t.status === 'DONE');

  const [createTask] = useMutation(CREATE_TASK);
  const [toggleTask] = useMutation(TOGGLE_TASK);
  const [deleteTask] = useMutation(DELETE_TASK);
  const [reorderTasks] = useMutation(REORDER_TASKS);

  const handleCreate = async (title: string) => {
    try {
      await createTask({ variables: { input: { tenantId: tenant, title } } });
      await refetch();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to create task');
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await toggleTask({ variables: { id, tenantId: tenant } });
      await refetch();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to update task');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTask({ variables: { id, tenantId: tenant } });
      showSuccess('Task deleted');
      await refetch();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to delete task');
    }
  };

  const handleReorder = async (orderedIds: string[]) => {
    try {
      await reorderTasks({ variables: { tenantId: tenant, orderedIds } });
      await refetch();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to reorder tasks');
    }
  };

  const handleMove = async (id: string, status: 'TODO' | 'DONE') => {
    const task = tasks.find((t) => t.id === id);
    if (!task || task.status === status) return;
    await handleToggle(id);
  };

  const handleAddView = (view: string) => {
    setShowAddView(false);
    if (!AVAILABLE_VIEWS.has(view)) {
      showInfo(`${view} view is coming soon`);
    }
  };

  const tabItems: TabItem[] = [
    {
      id: 'todo',
      label: 'To Do',
      content: (
        <TodoList
          items={todoTasks}
          onToggle={handleToggle}
          onDelete={handleDelete}
          onCreate={handleCreate}
          reorderable
          onReorder={handleReorder}
        />
      ),
    },
    {
      id: 'done',
      label: 'Done',
      content: (
        <TodoList
          items={doneTasks}
          onToggle={handleToggle}
          onDelete={handleDelete}
          onCreate={handleCreate}
          emptyHint="Nothing finished yet"
        />
      ),
    },
    {
      id: 'board',
      label: 'Board',
      content: <TodoBoard items={tasks} onMove={handleMove} />,
    },
    {
      id: 'chart',
      label: 'Chart',
      content: (
        <div className="flex justify-center py-6">
          <TodoStatsChart doneCount={doneTasks.length} todoCount={todoTasks.length} />
        </div>
      ),
    },
    {
      id: 'gallery',
      label: 'Gallery',
      content: (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tasks.length === 0 && (
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              No tasks yet.
            </p>
          )}
          {tasks.map((item) => (
            <TodoCard key={item.id} item={item} onToggle={handleToggle} />
          ))}
        </div>
      ),
    },
  ];

  return (
    <>
      <Head>
        <title>Todo List — {tenant}</title>
      </Head>
      <AppLayout responsive sidebarSections={sidebarSections} user={layoutUser ?? undefined} logo={logo}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <header className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="ios-large-title">Todo List</h1>
              <p className="mt-1 text-secondary text-sm">Track your tasks across views.</p>
            </div>
            <div className="relative">
              <button type="button" className="ios-btn-secondary" onClick={() => setShowAddView((v) => !v)}>
                + Add view
              </button>
              {showAddView && (
                <div
                  className="ios-card absolute right-0 mt-2 z-10 py-1"
                  style={{ minWidth: '10rem' }}
                >
                  {ADD_VIEW_OPTIONS.map((view) => (
                    <button
                      key={view}
                      type="button"
                      onClick={() => handleAddView(view)}
                      className="w-full text-left px-3 py-1.5 text-sm"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {view}
                      {!AVAILABLE_VIEWS.has(view) && (
                        <span className="text-xs ml-1" style={{ color: 'var(--color-text-tertiary)' }}>
                          (soon)
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </header>

          {loading && !data && <p className="text-sm text-secondary">Loading…</p>}

          {error && (
            <p className="text-sm" style={{ color: 'var(--color-red)' }}>
              {error.message}
            </p>
          )}

          {!loading || data ? (
            <div className="ios-card p-5">
              <Tab items={tabItems} defaultActiveTab="todo" variant="underline" size="md" fullWidth={false} responsive />
            </div>
          ) : null}
        </div>
      </AppLayout>
    </>
  );
}

export default function TodoPage(props: Props) {
  return (
    <SnackbarProvider position="top-right" maxSnackbars={3}>
      <TodoContent {...props} />
    </SnackbarProvider>
  );
}

export const getServerSideProps = getTenantPageProps;
