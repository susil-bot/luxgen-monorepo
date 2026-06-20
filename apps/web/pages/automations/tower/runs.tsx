import Head from 'next/head';
import { SnackbarProvider } from '@luxgen/ui';

import { TowerShell } from '../../../components/automations/tower/TowerShell';
import { TowerRunLogsTable } from '../../../components/automations/tower/TowerRunLogsTable';
import styles from '../../../components/automations/tower/TowerFlow.module.css';
import { useTowerRunLogs } from '../../../hooks/useTowerRunLogs';
import { getTenantPageProps } from '../../../lib/tenant-page-props';
import { useTenantScope } from '../../../lib/use-tenant-scope';

interface TowerRunsPageProps {
  tenant: string;
}

function TowerRunsContent({ tenant }: TowerRunsPageProps) {
  const { queryTenantId, subdomain } = useTenantScope(tenant);
  const { runs, loading } = useTowerRunLogs(queryTenantId, 100);

  return (
    <>
      <Head>
        <title>Recent Run Logs — Tower — {subdomain}</title>
      </Head>

      <TowerShell
        tenant={tenant}
        activeSubNav="runs"
        title="Recent Run Logs"
        lead="Execution history for all towers in this workspace."
      >
        <div className={styles.card}>
          {loading && runs.length === 0 ? (
            <div className={styles.emptyState}>Loading run logs…</div>
          ) : (
            <TowerRunLogsTable runs={runs} emptyMessage="Runs appear here after a tower executes." />
          )}
        </div>
      </TowerShell>
    </>
  );
}

export default function TowerRunsPage(props: TowerRunsPageProps) {
  return (
    <SnackbarProvider>
      <TowerRunsContent {...props} />
    </SnackbarProvider>
  );
}

export const getServerSideProps = getTenantPageProps;
