import Head from 'next/head';
import { useRouter } from 'next/router';
import { SnackbarProvider } from '@luxgen/ui';

import { TowerRunLogsTable, TowerShell } from '../../../components/automations/tower';
import styles from '../../../components/automations/tower/TowerFlow.module.css';
import { useTowerRunLogs } from '../../../hooks/useTowerRunLogs';
import { getTenantPageProps } from '../../../lib/tenant-page-props';
import { useTenantScope } from '../../../lib/use-tenant-scope';

interface TowerRunsPageProps {
  tenant: string;
}

function TowerRunsContent({ tenant }: TowerRunsPageProps) {
  const router = useRouter();
  const { queryTenantId, subdomain } = useTenantScope(tenant);
  const automationId =
    typeof router.query.automationId === 'string' ? router.query.automationId : null;
  const { runs, loading, error } = useTowerRunLogs(queryTenantId, 100, automationId);

  return (
    <>
      <Head>
        <title>Recent Run Logs — Tower — {subdomain}</title>
      </Head>

      <TowerShell
        tenant={tenant}
        activeSubNav="runs"
        title="Recent Run Logs"
        lead={
          automationId
            ? 'Execution history for this tower (tenant-scoped).'
            : 'Execution history for all towers in this workspace.'
        }
      >
        <div className={styles.card}>
          {error ? (
            <div className={styles.emptyState} style={{ color: 'var(--color-red)' }}>
              Could not load runs: {error}
            </div>
          ) : loading && runs.length === 0 ? (
            <div className={styles.emptyState}>Loading run logs…</div>
          ) : (
            <TowerRunLogsTable
              runs={runs}
              tenant={tenant}
              emptyMessage="Runs appear here after a tower executes. No demo data is shown."
            />
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
