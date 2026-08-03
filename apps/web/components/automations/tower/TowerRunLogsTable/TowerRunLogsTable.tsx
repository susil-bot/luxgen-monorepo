import Link from 'next/link';
import styles from './styles';
import type { TowerRunLog } from '../../../../hooks/useTowerRunLogs';

function statusBadge(status: TowerRunLog['status']) {
  if (status === 'success') return <span className={styles.badgeSuccess}>Success</span>;
  if (status === 'error') return <span className={styles.badgeError}>Failed</span>;
  return <span className={styles.badgeRunning}>Running</span>;
}

interface TowerRunLogsTableProps {
  runs: TowerRunLog[];
  emptyMessage?: string;
  /** Optional tenant query string for detail links */
  tenant?: string;
}

export function TowerRunLogsTable({
  runs,
  emptyMessage = 'No run logs yet.',
  tenant,
}: TowerRunLogsTableProps) {
  if (runs.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div style={{ fontSize: 28 }}>📋</div>
        <div className={styles.emptyTitle}>No runs recorded</div>
        <div>{emptyMessage}</div>
      </div>
    );
  }

  const tenantQs = tenant ? `?tenant=${encodeURIComponent(tenant)}` : '';

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className={styles.table}>
        <thead>
          <tr>
            {['Tower name', 'Status', 'Started', 'Completed', 'Duration', ''].map((col) => (
              <th key={col || 'actions'}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {runs.map((run) => (
            <tr key={run.id}>
              <td style={{ fontWeight: 600 }}>{run.automationName}</td>
              <td>{statusBadge(run.status)}</td>
              <td style={{ color: 'var(--color-label-secondary)', whiteSpace: 'nowrap' }}>{run.startedAt}</td>
              <td style={{ color: 'var(--color-label-secondary)', whiteSpace: 'nowrap' }}>
                {run.completedAt ?? '—'}
              </td>
              <td style={{ color: 'var(--color-label-secondary)' }}>{run.durationMs}ms</td>
              <td>
                <Link
                  href={`/automations/tower/runs/${run.id}${tenantQs}`}
                  className="ios-btn-plain text-sm"
                  style={{ color: 'var(--color-blue)' }}
                >
                  Details
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
