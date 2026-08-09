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
  TaskDetailDrawer,
  isTodoOpen,
  isTodoDone,
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
  GET_TASK_ACTIVITY,
  GET_TASK_REMINDERS,
  GET_TASK_TEMPLATES,
  GET_TASK_FIELD_VALUES,
  GET_TASK_RECURRENCE,
  CREATE_TASK,
  TOGGLE_TASK,
  DELETE_TASK,
  REORDER_TASKS,
  UPDATE_TASK,
  CREATE_TASK_REMINDER,
  SNOOZE_TASK_REMINDER,
  DELETE_TASK_REMINDER,
  CREATE_TASK_TEMPLATE,
  APPLY_TASK_TEMPLATE,
  UPSERT_TASK_FIELD_VALUE,
  UPSERT_TASK_RECURRENCE,
  DISABLE_TASK_RECURRENCE,
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
const ADD_VIEW_ORDER = [
  'table',
  'board',
  'gallery',
  'list',
  'chart',
  'dashboard',
  'timeline',
  'feed',
  'map',
  'calendar',
  'form',
];

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
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [savingDetail, setSavingDetail] = useState(false);
  const [reminderBusy, setReminderBusy] = useState(false);

  const {
    data: listData,
    loading: listLoading,
    error: listError,
  } = useQuery(GET_TODO_LIST, {
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
  const todoTasks = tasks.filter((t) => isTodoOpen(t));
  const doneTasks = tasks.filter((t) => isTodoDone(t));
  const selectedTask = tasks.find((t) => t.id === selectedTaskId) ?? null;

  const { data: activityData, refetch: refetchActivity } = useQuery(GET_TASK_ACTIVITY, {
    variables: { taskId: selectedTaskId, tenantId: tenant, limit: 40 },
    skip: !selectedTaskId,
    fetchPolicy: 'network-only',
  });

  const { data: remindersData, refetch: refetchReminders } = useQuery(GET_TASK_REMINDERS, {
    variables: { taskId: selectedTaskId, tenantId: tenant },
    skip: !selectedTaskId,
    fetchPolicy: 'network-only',
  });

  const { data: templatesData, refetch: refetchTemplates } = useQuery(GET_TASK_TEMPLATES, {
    variables: { tenantId: tenant },
    fetchPolicy: 'cache-and-network',
  });

  const { data: fieldValuesData, refetch: refetchFieldValues } = useQuery(GET_TASK_FIELD_VALUES, {
    variables: { taskId: selectedTaskId, tenantId: tenant },
    skip: !selectedTaskId,
    fetchPolicy: 'network-only',
  });

  const { data: recurrenceData, refetch: refetchRecurrence } = useQuery(GET_TASK_RECURRENCE, {
    variables: { taskId: selectedTaskId, tenantId: tenant },
    skip: !selectedTaskId,
    fetchPolicy: 'network-only',
  });

  const [createTask] = useMutation(CREATE_TASK);
  const [toggleTask] = useMutation(TOGGLE_TASK);
  const [deleteTask] = useMutation(DELETE_TASK);
  const [reorderTasks] = useMutation(REORDER_TASKS);
  const [updateTask] = useMutation(UPDATE_TASK);
  const [createTaskReminder] = useMutation(CREATE_TASK_REMINDER);
  const [snoozeTaskReminder] = useMutation(SNOOZE_TASK_REMINDER);
  const [deleteTaskReminder] = useMutation(DELETE_TASK_REMINDER);
  const [createTaskTemplate] = useMutation(CREATE_TASK_TEMPLATE);
  const [applyTaskTemplate] = useMutation(APPLY_TASK_TEMPLATE);
  const [upsertTaskFieldValue] = useMutation(UPSERT_TASK_FIELD_VALUE);
  const [upsertTaskRecurrence] = useMutation(UPSERT_TASK_RECURRENCE);
  const [disableTaskRecurrence] = useMutation(DISABLE_TASK_RECURRENCE);
  const [fieldsBusy, setFieldsBusy] = useState(false);
  const [recurrenceBusy, setRecurrenceBusy] = useState(false);

  const handleCreate = async (title: string) => {
    try {
      await createTask({ variables: { input: { tenantId: tenant, todoListId, title } } });
      await refetch();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to create task');
    }
  };

  const handleCreateFull = async (input: {
    title: string;
    notes?: string;
    dueDate?: string;
    startDate?: string;
    priority?: string;
    assigneeId?: string;
    teamId?: string;
  }) => {
    try {
      await createTask({
        variables: {
          input: {
            tenantId: tenant,
            todoListId,
            title: input.title,
            notes: input.notes,
            dueDate: input.dueDate,
            startDate: input.startDate,
            priority: input.priority,
            assigneeId: input.assigneeId,
            teamId: input.teamId,
          },
        },
      });
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

  const handleMove = async (taskId: string, status: 'OPEN' | 'COMPLETED') => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    if (status === 'COMPLETED' && isTodoDone(task)) return;
    if (status === 'OPEN' && isTodoOpen(task)) return;
    try {
      await updateTask({ variables: { id: taskId, tenantId: tenant, input: { status } } });
      await refetch();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to move task');
    }
  };

  const handleSaveDetail = async (input: {
    title: string;
    notes?: string | null;
    status: string;
    priority: string;
    teamId?: string | null;
    assigneeId?: string | null;
    startDate?: string | null;
    dueDate?: string | null;
  }) => {
    if (!selectedTaskId) return;
    setSavingDetail(true);
    try {
      await updateTask({
        variables: {
          id: selectedTaskId,
          tenantId: tenant,
          input: {
            title: input.title,
            notes: input.notes,
            status: input.status,
            priority: input.priority,
            teamId: input.teamId,
            assigneeId: input.assigneeId,
            startDate: input.startDate,
            dueDate: input.dueDate,
          },
        },
      });
      showSuccess('Task saved');
      await refetch();
      await refetchActivity();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to save task');
    } finally {
      setSavingDetail(false);
    }
  };

  const handleCreateReminder = async (input: { offsetPreset: string; fireAt?: string | null }) => {
    if (!selectedTaskId) return;
    setReminderBusy(true);
    try {
      await createTaskReminder({
        variables: {
          taskId: selectedTaskId,
          tenantId: tenant,
          input: {
            offsetPreset: input.offsetPreset,
            fireAt: input.fireAt ?? null,
            channelPrefs: ['in_app'],
          },
        },
      });
      showSuccess('Reminder scheduled');
      await refetchReminders();
      await refetchActivity();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to add reminder');
    } finally {
      setReminderBusy(false);
    }
  };

  const handleSnoozeReminder = async (id: string, untilIso: string) => {
    setReminderBusy(true);
    try {
      await snoozeTaskReminder({
        variables: { id, tenantId: tenant, until: untilIso },
      });
      showSuccess('Reminder snoozed');
      await refetchReminders();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to snooze reminder');
    } finally {
      setReminderBusy(false);
    }
  };

  const handleCancelReminder = async (id: string) => {
    setReminderBusy(true);
    try {
      await deleteTaskReminder({ variables: { id, tenantId: tenant } });
      showSuccess('Reminder cancelled');
      await refetchReminders();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to cancel reminder');
    } finally {
      setReminderBusy(false);
    }
  };

  const templates = templatesData?.taskTemplates ?? [];
  const activeTemplate = templates.find((t: { id: string }) => t.id === selectedTask?.templateId);
  const fieldDefinitions = activeTemplate?.fields ?? [];
  const fieldValues = fieldValuesData?.taskFieldValues ?? [];
  const missingRequired = fieldDefinitions
    .filter((f: { required: boolean; id: string; name: string; type: string }) => f.required)
    .filter((f: { id: string; type: string; name: string }) => {
      const raw = fieldValues.find((v: { fieldDefinitionId: string }) => v.fieldDefinitionId === f.id)?.value;
      if (f.type === 'checkbox') return raw !== true;
      if (raw === null || raw === undefined) return true;
      if (typeof raw === 'string') return raw.trim().length === 0;
      if (Array.isArray(raw)) return raw.length === 0;
      return false;
    })
    .map((f: { name: string }) => f.name);

  const handleApplyTemplate = async (templateId: string) => {
    if (!selectedTaskId) return;
    setFieldsBusy(true);
    try {
      await applyTaskTemplate({
        variables: { taskId: selectedTaskId, tenantId: tenant, templateId },
      });
      showSuccess('Template applied');
      await refetch();
      await refetchFieldValues();
      await refetchActivity();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to apply template');
    } finally {
      setFieldsBusy(false);
    }
  };

  const handleCreateQuickTemplate = async (name: string, fieldName: string) => {
    if (!selectedTaskId) return;
    setFieldsBusy(true);
    try {
      const created = await createTaskTemplate({
        variables: {
          input: {
            tenantId: tenant,
            name,
            fields: [{ name: fieldName, type: 'text', required: true }],
          },
        },
      });
      const templateId = created.data?.createTaskTemplate?.id as string | undefined;
      await refetchTemplates();
      if (templateId) {
        await applyTaskTemplate({
          variables: { taskId: selectedTaskId, tenantId: tenant, templateId },
        });
        await refetch();
        await refetchFieldValues();
      }
      showSuccess('Template created');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to create template');
    } finally {
      setFieldsBusy(false);
    }
  };

  const handleChangeFieldValue = async (fieldId: string, value: unknown) => {
    if (!selectedTaskId) return;
    setFieldsBusy(true);
    try {
      await upsertTaskFieldValue({
        variables: { taskId: selectedTaskId, tenantId: tenant, fieldId, value },
      });
      await refetchFieldValues();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to save field');
    } finally {
      setFieldsBusy(false);
    }
  };

  const handleSaveRecurrence = async (input: {
    frequency: string;
    interval: number;
    incompleteBehavior: string;
    nextFireAt?: string | null;
    enabled: boolean;
  }) => {
    if (!selectedTaskId) return;
    setRecurrenceBusy(true);
    try {
      await upsertTaskRecurrence({
        variables: {
          taskId: selectedTaskId,
          tenantId: tenant,
          input: {
            frequency: input.frequency,
            interval: input.interval,
            incompleteBehavior: input.incompleteBehavior,
            nextFireAt: input.nextFireAt ?? null,
            enabled: input.enabled,
          },
        },
      });
      showSuccess('Recurrence saved');
      await refetchRecurrence();
      await refetch();
      await refetchActivity();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to save recurrence');
    } finally {
      setRecurrenceBusy(false);
    }
  };

  const handleDisableRecurrence = async () => {
    if (!selectedTaskId) return;
    setRecurrenceBusy(true);
    try {
      await disableTaskRecurrence({
        variables: { taskId: selectedTaskId, tenantId: tenant },
      });
      showSuccess('Recurrence disabled');
      await refetchRecurrence();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to disable recurrence');
    } finally {
      setRecurrenceBusy(false);
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
        <button type="button" className="ios-btn-plain text-sm text-left" onClick={() => setSelectedTaskId(item.id)}>
          <span style={{ textDecoration: isTodoDone(item) ? 'line-through' : 'none' }}>{item.title}</span>
        </button>
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
            background: isTodoDone(item) ? 'var(--color-fill-tertiary)' : 'var(--color-fill-tertiary)',
            color: 'var(--color-text-secondary)',
          }}
        >
          {item.status.replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      key: 'priority',
      title: 'Priority',
      render: (_value, item) => item.priority ?? 'MEDIUM',
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
          <button
            type="button"
            className="text-xs"
            style={{ color: 'var(--color-accent)' }}
            onClick={() => handleToggle(item.id)}
          >
            {isTodoDone(item) ? 'Reopen' : 'Complete'}
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
            onOpen={setSelectedTaskId}
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
            onOpen={setSelectedTaskId}
            onCreate={handleCreate}
            emptyHint="Check the box to mark items as done"
          />
        );
      case 'board':
        return <TodoBoard items={tasks} onMove={handleMove} onOpen={setSelectedTaskId} />;
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
              <div key={item.id} onClick={() => setSelectedTaskId(item.id)} className="cursor-pointer">
                <TodoCard item={item} onToggle={handleToggle} />
              </div>
            ))}
          </div>
        );
      case 'table':
        return (
          <Table<TodoItem & Record<string, unknown>> data={tasks} columns={tableColumns} emptyMessage="No tasks yet." />
        );
      case 'list':
        return (
          <TodoList
            items={tasks}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onOpen={setSelectedTaskId}
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

  const tabs = addedViews.map((viewId) => ({
    id: viewId,
    label: VIEW_META[viewId].label,
    icon: VIEW_META[viewId].icon,
  }));
  const addViewOptions: TodoViewOption[] = ADD_VIEW_ORDER.map((viewId) => ({
    id: viewId,
    label: VIEW_META[viewId].label,
    icon: VIEW_META[viewId].icon,
    available: VIEW_META[viewId].available,
  }));

  return (
    <>
      <Head>
        <title>
          {listName ? `${listName} — Todo List` : 'Todo List'} — {tenant}
        </title>
      </Head>
      <AppLayout
        responsive
        sidebarSections={sidebarSections}
        user={layoutUser ?? undefined}
        logo={logo}
        {...headerProps}
      >
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

          {!listLoading && listData?.todoList && (!loading || data) ? (
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

      <TaskDetailDrawer
        open={Boolean(selectedTask)}
        task={selectedTask}
        activity={activityData?.taskActivity ?? []}
        reminders={remindersData?.taskReminders ?? []}
        templates={templates}
        fieldDefinitions={fieldDefinitions}
        fieldValues={fieldValues}
        missingRequired={missingRequired}
        saving={savingDetail}
        reminderBusy={reminderBusy}
        fieldsBusy={fieldsBusy}
        recurrence={recurrenceData?.taskRecurrence ?? null}
        recurrenceBusy={recurrenceBusy}
        onClose={() => setSelectedTaskId(null)}
        onSave={(input) => void handleSaveDetail(input)}
        onCreateReminder={(input) => void handleCreateReminder(input)}
        onSnoozeReminder={(id, until) => void handleSnoozeReminder(id, until)}
        onCancelReminder={(id) => void handleCancelReminder(id)}
        onApplyTemplate={(id) => void handleApplyTemplate(id)}
        onCreateQuickTemplate={(name, field) => void handleCreateQuickTemplate(name, field)}
        onChangeFieldValue={(fieldId, value) => void handleChangeFieldValue(fieldId, value)}
        onSaveRecurrence={(input) => void handleSaveRecurrence(input)}
        onDisableRecurrence={() => void handleDisableRecurrence()}
      />
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
