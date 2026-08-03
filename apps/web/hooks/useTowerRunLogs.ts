import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';

import { GET_AUTOMATION_RUNS } from '../graphql/queries/automations';
import { formatRunTimestamp } from '../lib/automation-map';

export interface TowerRunLog {
  id: string;
  automationId: string;
  automationName: string;
  triggerType?: string;
  triggeredAt: string;
  startedAt: string;
  completedAt: string | null;
  status: 'success' | 'error' | 'running';
  durationMs: number;
  error?: string;
}

type RunGql = {
  id: string;
  automationId: string;
  automationName: string;
  triggerType?: string;
  triggeredAt: string;
  startedAt?: string;
  completedAt?: string | null;
  status: 'success' | 'error' | 'running';
  durationMs: number;
  error?: string;
};

function mapRun(r: RunGql): TowerRunLog {
  const started = r.startedAt ?? r.triggeredAt;
  return {
    id: r.id,
    automationId: r.automationId,
    automationName: r.automationName,
    triggerType: r.triggerType,
    triggeredAt: formatRunTimestamp(r.triggeredAt),
    startedAt: formatRunTimestamp(started),
    completedAt: r.completedAt ? formatRunTimestamp(r.completedAt) : null,
    status: r.status,
    durationMs: r.durationMs,
    error: r.error,
  };
}

/** Live tenant-scoped run logs — never invents demo rows. */
export function useTowerRunLogs(
  tenantId: string | undefined,
  limit = 50,
  automationId?: string | null,
) {
  const [runs, setRuns] = useState<TowerRunLog[]>([]);

  const { data, loading, error } = useQuery(GET_AUTOMATION_RUNS, {
    variables: {
      tenantId: tenantId ?? '',
      limit,
      automationId: automationId || undefined,
    },
    skip: !tenantId,
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    if (!tenantId) {
      setRuns([]);
      return;
    }
    const rows = data?.automationRuns;
    if (rows == null) return;
    setRuns(rows.map(mapRun));
  }, [data, tenantId]);

  return {
    runs,
    loading: Boolean(tenantId) && loading && runs.length === 0,
    error: error?.message ?? null,
  };
}
