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
}

export function TowerRunLogsTable({ runs, emptyMessage = 'No run logs yet.' }: TowerRunLogsTableProps) {
  if (runs.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div style={{ fontSize: 28 }}>📋</div>
        <div className={styles.emptyTitle}>No runs recorded</div>
        <div>{emptyMessage}</div>
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className={styles.table}>
        <thead>
          <tr>
            {['Tower name', 'Status', 'Triggered at', 'Duration', 'Error'].map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {runs.map((run) => (
            <tr key={run.id}>
              <td style={{ fontWeight: 600 }}>{run.automationName}</td>
              <td>{statusBadge(run.status)}</td>
              <td style={{ color: '#616161', whiteSpace: 'nowrap' }}>{run.triggeredAt}</td>
              <td style={{ color: '#616161' }}>{run.durationMs}ms</td>
              <td
                style={{
                  color: '#bf0711',
                  maxWidth: 280,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title={run.error}
              >
                {run.error ?? '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
