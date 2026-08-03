import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import { SnackbarProvider } from '@luxgen/ui';

import { TowerShell } from '../../../../components/automations/tower';
import styles from '../../../../components/automations/tower/TowerFlow.module.css';
import { GET_AUTOMATION_RUN } from '../../../../graphql/queries/automations';
import { formatRunTimestamp } from '../../../../lib/automation-map';
import { getTenantPageProps } from '../../../../lib/tenant-page-props';
import { useTenantScope } from '../../../../lib/use-tenant-scope';

interface Props {
  tenant: string;
}

function statusLabel(status: string) {
  if (status === 'success') return 'Success';
  if (status === 'error') return 'Failed';
  if (status === 'running') return 'Running';
  return status;
}

function RunDetailContent({ tenant }: Props) {
  const router = useRouter();
  const runId = typeof router.query.id === 'string' ? router.query.id : '';
  const { subdomain } = useTenantScope(tenant);

  const { data, loading, error } = useQuery(GET_AUTOMATION_RUN, {
    variables: { id: runId },
    skip: !runId,
    fetchPolicy: 'cache-and-network',
  });

  const run = data?.automationRun;

  return (
    <>
      <Head>
        <title>
          {run ? `Run · ${run.automationName}` : 'Run detail'} — Tower — {subdomain}
        </title>
      </Head>

      <TowerShell
        tenant={tenant}
        activeSubNav="runs"
        title={run?.automationName ?? 'Run detail'}
        lead="Status and timestamps for this automation run."
      >
        <div className={styles.card} style={{ padding: 24 }}>
          <p className="mb-4">
            <Link
              href={`/automations/tower/runs?tenant=${encodeURIComponent(tenant)}`}
              className="ios-btn-plain text-sm"
              style={{ color: 'var(--color-blue)' }}
            >
              ← All runs
            </Link>
          </p>

          {loading && !run ? (
            <p style={{ color: 'var(--color-label-secondary)' }}>Loading run…</p>
          ) : error ? (
            <p style={{ color: 'var(--color-red)' }}>{error.message}</p>
          ) : !run ? (
            <p style={{ color: 'var(--color-label-secondary)' }}>Run not found in this tenant.</p>
          ) : (
            <dl className="grid gap-4 m-0" style={{ gridTemplateColumns: '160px 1fr' }}>
              <dt style={{ color: 'var(--color-label-tertiary)' }}>Status</dt>
              <dd className="m-0 font-semibold" style={{ color: 'var(--color-label-primary)' }}>
                {statusLabel(run.status)}
              </dd>

              <dt style={{ color: 'var(--color-label-tertiary)' }}>Started</dt>
              <dd className="m-0" style={{ color: 'var(--color-label-primary)' }}>
                {formatRunTimestamp(run.startedAt ?? run.triggeredAt)}
              </dd>

              <dt style={{ color: 'var(--color-label-tertiary)' }}>Completed</dt>
              <dd className="m-0" style={{ color: 'var(--color-label-primary)' }}>
                {run.completedAt ? formatRunTimestamp(run.completedAt) : '—'}
              </dd>

              <dt style={{ color: 'var(--color-label-tertiary)' }}>Duration</dt>
              <dd className="m-0" style={{ color: 'var(--color-label-primary)' }}>
                {run.durationMs}ms
              </dd>

              <dt style={{ color: 'var(--color-label-tertiary)' }}>Trigger</dt>
              <dd className="m-0" style={{ color: 'var(--color-label-primary)' }}>
                {run.triggerType}
              </dd>

              <dt style={{ color: 'var(--color-label-tertiary)' }}>Automation</dt>
              <dd className="m-0">
                <Link
                  href={`/automations/tower/${run.automationId}?tenant=${encodeURIComponent(tenant)}`}
                  style={{ color: 'var(--color-blue)' }}
                >
                  {run.automationName}
                </Link>
              </dd>

              {run.error ? (
                <>
                  <dt style={{ color: 'var(--color-label-tertiary)' }}>Error</dt>
                  <dd className="m-0" style={{ color: 'var(--color-red)' }}>
                    {run.error}
                  </dd>
                </>
              ) : null}
            </dl>
          )}
        </div>
      </TowerShell>
    </>
  );
}

export default function TowerRunDetailPage(props: Props) {
  return (
    <SnackbarProvider>
      <RunDetailContent {...props} />
    </SnackbarProvider>
  );
}

export const getServerSideProps = getTenantPageProps;
