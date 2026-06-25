import { useCallback, useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { AppLayout, getDefaultLogo, getDefaultSidebarSections, SnackbarProvider } from '@luxgen/ui';
import { createHandleUserAction } from '../../lib/user-actions';
import { useLayoutUser, useAppTenantId } from '../../lib/app-layout-user';
import { useAppLayoutHeader } from '../../lib/app-layout-header';
import { getAuthToken } from '../../lib/auth';
import { getTenantPageProps } from '../../lib/tenant-page-props';
import { PageLoadingState } from '../../components/common/PageStates';

interface AgentTaskRow {
  sessionId: string;
  tenantId: string;
  userId: string;
  status: string;
  mode: string;
  prompt?: string;
  metadata?: { updatedAt?: string; createdAt?: string; model?: string };
}

interface Props {
  tenant: string;
}

const STATUS_OPTIONS = [
  '',
  'created',
  'running',
  'staged',
  'validating',
  'pending_review',
  'committed',
  'merged',
  'failed',
  'cancelled',
];

function AgentTasksContent({ tenant }: Props) {
  const router = useRouter();
  const layoutUser = useLayoutUser();
  const headerProps = useAppLayoutHeader();
  const tenantId = useAppTenantId() ?? tenant;
  const handleUserAction = createHandleUserAction(router);

  const [tasks, setTasks] = useState<AgentTaskRow[]>([]);
  const [total, setTotal] = useState(0);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(
    async (cursor?: string, append = false) => {
      setLoading(true);
      setError(null);
      try {
        const token = getAuthToken();
        const params = new URLSearchParams({ tenantId, limit: '20' });
        if (statusFilter) params.set('status', statusFilter);
        if (cursor) params.set('cursor', cursor);

        const res = await fetch(`/api/agent/tasks/list?${params}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load tasks');

        const rows = (data.tasks ?? []) as AgentTaskRow[];
        setTasks((prev) => (append ? [...prev, ...rows] : rows));
        setTotal(data.total ?? 0);
        setNextCursor(data.nextCursor ?? null);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load tasks');
      } finally {
        setLoading(false);
      }
    },
    [tenantId, statusFilter],
  );

  useEffect(() => {
    void fetchTasks();
  }, [fetchTasks]);

  return (
    <>
      <Head>
        <title>Agent tasks — LuxGen</title>
      </Head>
      <AppLayout
        responsive
        user={layoutUser}
        logo={getDefaultLogo()}
        sidebarSections={getDefaultSidebarSections()}
        onUserAction={handleUserAction}
        showSearch
        {...headerProps}
      >
        <div className="p-6 max-w-6xl mx-auto">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-primary">Agent tasks</h1>
              <p className="text-sm text-secondary mt-1">
                Tenant oversight for headless and interactive agent sessions ({total} total)
              </p>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm text-secondary" htmlFor="status-filter">
                Status
              </label>
              <select
                id="status-filter"
                className="input-field text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s || 'all'} value={s}>
                    {s || 'All statuses'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="ios-card p-4 mb-4 text-sm" style={{ color: 'var(--color-red)' }}>
              {error}
            </div>
          )}

          {loading && tasks.length === 0 ? (
            <PageLoadingState label="Loading agent tasks…" />
          ) : tasks.length === 0 ? (
            <div className="ios-card p-8 text-center text-secondary">No agent tasks found for this tenant.</div>
          ) : (
            <div className="ios-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-tertiary" style={{ borderColor: 'var(--color-separator)' }}>
                    <th className="p-3 font-medium">Session</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium">Mode</th>
                    <th className="p-3 font-medium">User</th>
                    <th className="p-3 font-medium">Updated</th>
                    <th className="p-3 font-medium">Prompt</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr key={task.sessionId} className="border-b" style={{ borderColor: 'var(--color-separator)' }}>
                      <td className="p-3 font-mono text-xs truncate max-w-[140px]" title={task.sessionId}>
                        {task.sessionId}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-secondary">{task.status}</span>
                      </td>
                      <td className="p-3 text-secondary">{task.mode}</td>
                      <td className="p-3 text-secondary truncate max-w-[100px]" title={task.userId}>
                        {task.userId}
                      </td>
                      <td className="p-3 text-secondary whitespace-nowrap">
                        {task.metadata?.updatedAt ? new Date(task.metadata.updatedAt).toLocaleString() : '—'}
                      </td>
                      <td className="p-3 text-secondary truncate max-w-[200px]" title={task.prompt}>
                        {task.prompt || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {nextCursor && (
            <div className="mt-4 text-center">
              <button
                type="button"
                className="btn-secondary text-sm"
                disabled={loading}
                onClick={() => void fetchTasks(nextCursor, true)}
              >
                {loading ? 'Loading…' : 'Load more'}
              </button>
            </div>
          )}
        </div>
      </AppLayout>
    </>
  );
}

export default function AgentTasksPage(props: Props) {
  return (
    <SnackbarProvider>
      <AgentTasksContent {...props} />
    </SnackbarProvider>
  );
}

export const getServerSideProps = getTenantPageProps;
