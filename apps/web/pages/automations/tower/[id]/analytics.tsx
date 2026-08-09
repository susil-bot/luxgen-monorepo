import { useMemo } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import { AppLayout } from '@luxgen/ui';
import { useAppShellConfig } from '../../../../lib/app-shell-config';
import { useLayoutUser, useAppTenantId } from '../../../../lib/app-layout-user';
import { PageHead } from '../../../../components/seo/PageHead';
import { PageEmptyState, PageLoadingState } from '../../../../components/common/PageStates';
import { PlanGate } from '../../../../components/billing/PlanGate';
import { GET_TENANT_BILLING } from '../../../../graphql/queries/billing';
import { normalizePlan } from '@luxgen/billing';
import { GET_AUTOMATION, GET_AUTOMATION_RUNS } from '../../../../graphql/queries/automations';

interface AutomationRun {
  id: string;
  status: string;
  durationMs?: number | null;
  triggeredAt: string;
}

/**
 * Per-workflow analytics (T-AUTO-08) — docs spec's `/automation/workflows/:id/analytics`.
 * Entirely computed client-side from `automationRuns(automationId)`, which already carries
 * status/durationMs/triggeredAt — no apps/api change needed for this task (contrary to its
 * touch list's assumption); tracked here rather than opening a redundant backend PR.
 */
export default function WorkflowAnalyticsPage() {
  const router = useRouter();
  const automationId = typeof router.query.id === 'string' ? router.query.id : '';
  const tenant = typeof router.query.tenant === 'string' ? router.query.tenant : 'demo';
  const layoutUser = useLayoutUser();
  const { sidebarSections, logo } = useAppShellConfig();
  const tenantId = useAppTenantId();

  const { data: billingData, loading: billingLoading } = useQuery(GET_TENANT_BILLING, {
    variables: { tenantId: tenant },
    errorPolicy: 'all',
  });
  const tenantPlan = normalizePlan(String(billingData?.tenantBilling?.plan ?? 'free').toLowerCase());

  const { data: automationData } = useQuery(GET_AUTOMATION, {
    variables: { id: automationId },
    skip: !automationId,
    errorPolicy: 'all',
  });

  const { data: runsData, loading: runsLoading } = useQuery(GET_AUTOMATION_RUNS, {
    variables: { tenantId: tenantId ?? '', automationId, limit: 200 },
    skip: !tenantId || !automationId,
    errorPolicy: 'all',
  });

  const runs: AutomationRun[] = runsData?.automationRuns ?? [];

  const metrics = useMemo(() => {
    if (runs.length === 0) return null;
    const succeeded = runs.filter((r) => r.status === 'success' || r.status === 'completed').length;
    const durations = runs.map((r) => r.durationMs).filter((d): d is number => typeof d === 'number');
    const avgDurationMs = durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : null;

    const byDay = new Map<string, number>();
    for (const r of runs) {
      const day = new Date(r.triggeredAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      byDay.set(day, (byDay.get(day) ?? 0) + 1);
    }
    const volume = Array.from(byDay.entries()).slice(-7);
    const maxVolume = Math.max(1, ...volume.map(([, count]) => count));

    return {
      total: runs.length,
      successRate: Math.round((succeeded / runs.length) * 100),
      avgDurationMs,
      volume,
      maxVolume,
    };
  }, [runs]);

  const name = automationData?.automation?.name ?? 'Workflow';

  return (
    <>
      <PageHead title={`${name} analytics`} robots="noindex" />
      <AppLayout responsive sidebarSections={sidebarSections} user={layoutUser ?? undefined} logo={logo}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="ios-large-title mb-1">{name} — analytics</h1>
          <p className="text-sm mb-6" style={{ color: 'var(--color-label-secondary)' }}>
            Success rate and run volume, computed from this workflow&apos;s run history.
          </p>

          {billingLoading ? (
            <PageLoadingState label="Loading…" />
          ) : (
            <PlanGate feature="automations" currentPlan={tenantPlan} tenant={tenant}>
              {runsLoading ? (
                <PageLoadingState label="Loading run history…" />
              ) : !metrics ? (
                <PageEmptyState
                  icon="📊"
                  title="No runs yet"
                  subtitle="Metrics will appear here once this workflow has run at least once."
                />
              ) : (
                <div className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="ios-card p-4">
                      <p className="text-xs" style={{ color: 'var(--color-label-secondary)' }}>
                        Total runs
                      </p>
                      <p className="text-2xl font-semibold mt-1">{metrics.total}</p>
                    </div>
                    <div className="ios-card p-4">
                      <p className="text-xs" style={{ color: 'var(--color-label-secondary)' }}>
                        Success rate
                      </p>
                      <p className="text-2xl font-semibold mt-1">{metrics.successRate}%</p>
                    </div>
                    <div className="ios-card p-4">
                      <p className="text-xs" style={{ color: 'var(--color-label-secondary)' }}>
                        Avg. duration
                      </p>
                      <p className="text-2xl font-semibold mt-1">
                        {metrics.avgDurationMs != null ? `${Math.round(metrics.avgDurationMs)}ms` : '—'}
                      </p>
                    </div>
                  </div>

                  <section>
                    <h2 className="font-semibold mb-3">Run volume (last {metrics.volume.length} active days)</h2>
                    <div className="flex items-end gap-3" style={{ height: 120 }} role="img" aria-label="Run volume by day">
                      {metrics.volume.map(([day, count]) => (
                        <div key={day} className="flex-1 flex flex-col items-center gap-1">
                          <div
                            style={{
                              width: '100%',
                              height: `${Math.max(4, (count / metrics.maxVolume) * 100)}px`,
                              backgroundColor: 'var(--color-blue)',
                              borderRadius: 'var(--radius-sm)',
                            }}
                            aria-hidden
                          />
                          <span className="text-xs" style={{ color: 'var(--color-label-tertiary)' }}>
                            {day}
                          </span>
                          <span className="text-xs font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              )}
            </PlanGate>
          )}
        </div>
      </AppLayout>
    </>
  );
}
