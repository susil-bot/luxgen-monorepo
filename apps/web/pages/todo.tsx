import { useState } from 'react';
import Head from 'next/head';
import { useMutation, useQuery } from '@apollo/client';
import {
  AppLayout,
  SnackbarProvider,
  useSnackbar,
  Tab,
  TabItem,
  TodoItem,
  TodoList,
  TodoCard,
  TodoStatsChart,
  Table,
  Column,
} from '@luxgen/ui';
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
 * views (To Do / Done / Board / Chart / Gallery) plus Table and List, reachable both as
 * always-on tabs and via the "+" add-view menu (which just switches to the matching tab
 * for anything already built). The remaining add-view options (Dashboard, Timeline, Feed,
 * Map, Calendar, Form) are not built — showing a "Coming soon" toast rather than
 * fabricating functionality that doesn't exist yet.
 */
const ADD_VIEW_OPTIONS = ['Table', 'Board', 'Gallery', 'List', 'Chart', 'Dashboard', 'Timeline', 'Feed', 'Map', 'Calendar', 'Form'];
// Maps an add-view menu option to the tab id it should jump to. Anything not listed here
// falls through to the "coming soon" toast in handleAddView.
const VIEW_TO_TAB_ID: Record<string, string> = {
  Table: 'table',
  Board: 'board',
  Gallery: 'gallery',
  List: 'list',
  Chart: 'chart',
};

function TodoContent({ tenant }: Props) {
  const { sidebarSections, logo } = useAppShellConfig();
  const layoutUser = useLayoutUser();
  const { showSuccess, showError, showInfo } = useSnackbar();
  const [showAddView, setShowAddView] = useState(false);
  const [activeView, setActiveView] = useState('todo');

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
    const tabId = VIEW_TO_TAB_ID[view];
    if (tabId) {
      setActiveView(tabId);
    } else {
      showInfo(`${view} view is coming soon`);
    }
  };

  const tableColumns: Column<TodoItem & Record<string, unknown>>[] = [
    {
      key: 'title',
      title: 'Task',
      render: (_value, item) => (
        <span style={{ textDecoration: item.status === 'DONE' ? 'line-through' : 'none' }}>{item.title}</span>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (_value, item) => (
        <span
          className="text-xs"
          style={{
            padding: '0.125rem 0.5rem',
            borderRadius: '9999px',
            background: item.status === 'DONE' ? 'var(--color-green-fill, #16a34a22)' : 'var(--color-fill-tertiary)',
            color: item.status === 'DONE' ? 'var(--color-green, #16a34a)' : 'var(--color-text-secondary)',
          }}
        >
          {item.status === 'DONE' ? 'Done' : 'To do'}
        </span>
      ),
    },
    {
      key: 'dueDate',
      title: 'Due',
      render: (_value, item) => (item.dueDate ? new Date(item.dueDate).toLocaleDateString() : '—'),
    },
    {
      key: 'id',
      title: '',
      render: (_value, item) => (
        <div className="flex gap-3 justify-end">
          <button type="button" className="text-xs" style={{ color: 'var(--color-accent)' }} onClick={() => handleToggle(item.id)}>
            {item.status === 'DONE' ? 'Reopen' : 'Complete'}
          </button>
          <button
            type="button"
            className="text-xs"
            style={{ color: 'var(--color-text-tertiary)' }}
            onClick={() => handleDelete(item.id)}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

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
    {
      id: 'table',
      label: 'Table',
      content: (
        <Table<TodoItem & Record<string, unknown>>
          data={tasks as (TodoItem & Record<string, unknown>)[]}
          columns={tableColumns}
          emptyMessage="No tasks yet."
        />
      ),
    },
    {
      id: 'list',
      label: 'List',
      content: (
        <TodoList
          items={tasks}
          onToggle={handleToggle}
          onDelete={handleDelete}
          onCreate={handleCreate}
          reorderable
          onReorder={handleReorder}
          emptyHint="No tasks yet."
        />
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
                      {!VIEW_TO_TAB_ID[view] && (
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
              <Tab
                items={tabItems}
                activeTab={activeView}
                onTabChange={setActiveView}
                variant="underline"
                size="md"
                fullWidth={false}
                responsive
              />
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
