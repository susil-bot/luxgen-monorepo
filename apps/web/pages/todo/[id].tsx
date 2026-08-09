import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from '@apollo/client';
import {
  AppLayout,
  SnackbarProvider,
  useSnackbar,
  TodoItem,
  TodoList,
  TodoCard,
  TodoStatsChart,
  TodoTimeline,
  TodoCalendarView,
  TodoDashboard,
  TodoTaskForm,
  TodoPageHeader,
  TodoViewTabs,
  TodoViewOption,
  TodoToolbarAction,
  Table,
  Column,
  TodoToDoIcon,
  TodoDoneIcon,
  TodoBoardIcon,
  TodoChartIcon,
  TodoGalleryIcon,
  TodoTableIcon,
  TodoListViewIcon,
  TodoDashboardIcon,
  TodoTimelineIcon,
  TodoFeedIcon,
  TodoMapIcon,
  TodoCalendarIcon,
  TodoFormIcon,
} from '@luxgen/ui';
import { TodoBoard } from '../../components/todo/TodoBoard';
import { useAppShellConfig } from '../../lib/app-shell-config';
import { useAppLayoutHeader } from '../../lib/app-layout-header';
import { useLayoutUser } from '../../lib/app-layout-user';
import { getTenantPageProps } from '../../lib/tenant-page-props';
import {
  GET_TODO_LIST,
  GET_TASKS,
  CREATE_TASK,
  TOGGLE_TASK,
  DELETE_TASK,
  REORDER_TASKS,
  UPDATE_TASK,
} from '../../graphql/queries/todo';

interface Props {
  tenant: string;
}

/**
 * One named Todo List's page (e.g. "Work", "Personal") — the child of the Todo List hub
 * (apps/web/pages/todo.tsx). Everything here is scoped to this list's todoListId; the chrome
 * (tab bar, add-view menu, toolbar) is unchanged from before multi-list support, just now
 * filtered per list instead of showing every task a tenant has ever created.
 */
const DEFAULT_VIEWS = ['todo', 'done', 'board', 'chart', 'gallery'];
const ADD_VIEW_ORDER = ['table', 'board', 'gallery', 'list', 'chart', 'dashboard', 'timeline', 'feed', 'map', 'calendar', 'form'];

const VIEW_META: Record<string, { label: string; icon: React.ReactNode; available: boolean }> = {
  todo: { label: 'To Do', icon: <TodoToDoIcon />, available: true },
  done: { label: 'Done', icon: <TodoDoneIcon />, available: true },
  board: { label: 'Board', icon: <TodoBoardIcon />, available: true },
  chart: { label: 'Chart', icon: <TodoChartIcon />, available: true },
  gallery: { label: 'Gallery', icon: <TodoGalleryIcon />, available: true },
  table: { label: 'Table', icon: <TodoTableIcon />, available: true },
  list: { label: 'List', icon: <TodoListViewIcon />, available: true },
  dashboard: { label: 'Dashboard', icon: <TodoDashboardIcon />, available: true },
  timeline: { label: 'Timeline', icon: <TodoTimelineIcon />, available: true },
  feed: { label: 'Feed', icon: <TodoFeedIcon />, available: false },
  map: { label: 'Map', icon: <TodoMapIcon />, available: false },
  calendar: { label: 'Calendar', icon: <TodoCalendarIcon />, available: true },
  form: { label: 'Form', icon: <TodoFormIcon />, available: true },
};

function TodoListPageContent({ tenant }: Props) {
  const router = useRouter();
  const { id } = router.query;
  const todoListId = typeof id === 'string' ? id : '';

  const { sidebarSections, logo } = useAppShellConfig();
  const headerProps = useAppLayoutHeader();
  const layoutUser = useLayoutUser();
  const { showSuccess, showError, showInfo } = useSnackbar();
  const [addedViews, setAddedViews] = useState<string[]>(DEFAULT_VIEWS);
  const [activeView, setActiveView] = useState('todo');

  const { data: listData, loading: listLoading, error: listError } = useQuery(GET_TODO_LIST, {
    variables: { id: todoListId, tenantId: tenant },
    skip: !todoListId,
  });
  const listName: string | undefined = listData?.todoList?.name;

  const { data, loading, error, refetch } = useQuery(GET_TASKS, {
    variables: { tenantId: tenant, todoListId },
    skip: !todoListId,
    fetchPolicy: 'cache-and-network',
  });
  const tasks: TodoItem[] = data?.tasks ?? [];
  const todoTasks = tasks.filter((t) => t.status === 'TODO');
  const doneTasks = tasks.filter((t) => t.status === 'DONE');

  const [createTask] = useMutation(CREATE_TASK);
  const [toggleTask] = useMutation(TOGGLE_TASK);
  const [deleteTask] = useMutation(DELETE_TASK);
  const [reorderTasks] = useMutation(REORDER_TASKS);
  const [updateTask] = useMutation(UPDATE_TASK);

  const handleCreate = async (title: string) => {
    try {
      await createTask({ variables: { input: { tenantId: tenant, todoListId, title } } });
      await refetch();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to create task');
    }
  };

  const handleCreateFull = async (input: { title: string; notes?: string; dueDate?: string }) => {
    try {
      await createTask({ variables: { input: { tenantId: tenant, todoListId, ...input } } });
      showSuccess('Task created');
      await refetch();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to create task');
    }
  };

  const handleToggle = async (taskId: string) => {
    try {
      await toggleTask({ variables: { id: taskId, tenantId: tenant } });
      await refetch();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to update task');
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      await deleteTask({ variables: { id: taskId, tenantId: tenant } });
      showSuccess('Task deleted');
      await refetch();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to delete task');
    }
  };

  const handleReorder = async (orderedIds: string[]) => {
    try {
      await reorderTasks({ variables: { tenantId: tenant, todoListId, orderedIds } });
      await refetch();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to reorder tasks');
    }
  };

  const handleMove = async (taskId: string, status: 'TODO' | 'DONE') => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === status) return;
    await handleToggle(taskId);
  };

  const handleReschedule = async (taskId: string, dueDate: string | null) => {
    try {
      await updateTask({ variables: { id: taskId, tenantId: tenant, input: { dueDate } } });
      await refetch();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to reschedule task');
    }
  };

  const handleAddView = (viewId: string) => {
    const meta = VIEW_META[viewId];
    if (!meta || !meta.available) {
      showInfo(`${meta?.label ?? 'That'} view is coming soon`);
      return;
    }
    setAddedViews((prev) => (prev.includes(viewId) ? prev : [...prev, viewId]));
    setActiveView(viewId);
  };

  const handleToolbarAction = (action: TodoToolbarAction) => {
    const labels: Record<TodoToolbarAction, string> = {
      filter: 'Filtering',
      sort: 'Sorting',
      automate: 'Automations',
      ai: 'Ask AI',
      search: 'Search',
      settings: 'View settings',
    };
    showInfo(`${labels[action]} is coming soon`);
  };

  const handleNew = () => {
    if (addedViews.includes('form')) {
      setActiveView('form');
    } else {
      handleAddView('form');
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

  const renderViewContent = (viewId: string) => {
    switch (viewId) {
      case 'todo':
        return (
          <TodoList
            items={todoTasks}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onCreate={handleCreate}
            reorderable
            onReorder={handleReorder}
          />
        );
      case 'done':
        return (
          <TodoList
            items={doneTasks}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onCreate={handleCreate}
            emptyHint="Check the box to mark items as done"
          />
        );
      case 'board':
        return <TodoBoard items={tasks} onMove={handleMove} />;
      case 'chart':
        return (
          <div className="flex justify-center py-6">
            <TodoStatsChart doneCount={doneTasks.length} todoCount={todoTasks.length} />
          </div>
        );
      case 'gallery':
        return (
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
        );
      case 'table':
        return <Table<TodoItem & Record<string, unknown>> data={tasks} columns={tableColumns} emptyMessage="No tasks yet." />;
      case 'list':
        return (
          <TodoList
            items={tasks}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onCreate={handleCreate}
            reorderable
            onReorder={handleReorder}
            emptyHint="No tasks yet."
          />
        );
      case 'timeline':
        return <TodoTimeline items={tasks} onToggle={handleToggle} />;
      case 'calendar':
        return <TodoCalendarView items={tasks} onToggle={handleToggle} />;
      case 'dashboard':
        return <TodoDashboard items={tasks} />;
      case 'form':
        return <TodoTaskForm onCreate={handleCreateFull} />;
      default:
        return null;
    }
  };

  const tabs = addedViews.map((viewId) => ({ id: viewId, label: VIEW_META[viewId].label, icon: VIEW_META[viewId].icon }));
  const addViewOptions: TodoViewOption[] = ADD_VIEW_ORDER.map((viewId) => ({
    id: viewId,
    label: VIEW_META[viewId].label,
    icon: VIEW_META[viewId].icon,
    available: VIEW_META[viewId].available,
  }));

  return (
    <>
      <Head>
        <title>{listName ? `${listName} — Todo List` : 'Todo List'} — {tenant}</title>
      </Head>
      <AppLayout responsive sidebarSections={sidebarSections} user={layoutUser ?? undefined} logo={logo} {...headerProps}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <TodoPageHeader
            breadcrumb={[{ label: 'Todo List', onClick: () => router.push('/todo') }, listName ?? '…']}
            title={listName ?? '…'}
            subtitle="Stay organized with tasks, your way."
            onShare={() => showInfo('Sharing is coming soon')}
            onCopyLink={() => showInfo('Link copied (coming soon)')}
            onToggleFavorite={() => showInfo('Favorites are coming soon')}
            onMore={() => showInfo('More options are coming soon')}
          />

          {listError && (
            <p className="text-sm" style={{ color: 'var(--color-red)' }}>
              {listError.message}
            </p>
          )}
          {!listLoading && !listData?.todoList && !listError && (
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              This list doesn&apos;t exist, or was deleted.
            </p>
          )}

          {loading && !data && <p className="text-sm text-secondary">Loading…</p>}

          {error && (
            <p className="text-sm" style={{ color: 'var(--color-red)' }}>
              {error.message}
            </p>
          )}

          {(!listLoading && listData?.todoList) && (!loading || data) ? (
            <div className="ios-card p-5">
              <TodoViewTabs
                tabs={tabs}
                activeTab={activeView}
                onTabChange={setActiveView}
                addViewOptions={addViewOptions}
                onAddView={handleAddView}
                onNewDataSource={() => showInfo('New data source is coming soon')}
                onToolbarAction={handleToolbarAction}
                onNew={handleNew}
              />
              {renderViewContent(activeView)}
            </div>
          ) : null}
        </div>
      </AppLayout>
    </>
  );
}

export default function TodoListDetailPage(props: Props) {
  return (
    <SnackbarProvider position="top-right" maxSnackbars={3}>
      <TodoListPageContent {...props} />
    </SnackbarProvider>
  );
}

export const getServerSideProps = getTenantPageProps;
