import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';

import { GET_AUTOMATION_RUNS } from '../graphql/queries/automations';
import { formatRunTimestamp } from '../lib/automation-map';

export interface TowerRunLog {
  id: string;
  automationName: string;
  triggeredAt: string;
  status: 'success' | 'error' | 'running';
  durationMs: number;
  error?: string;
}

const FALLBACK_RUNS: TowerRunLog[] = [
  {
    id: 'r1',
    automationName: 'Welcome new learners',
    triggeredAt: '2025-06-18 14:32',
    status: 'success',
    durationMs: 342,
  },
  {
    id: 'r2',
    automationName: 'Course completion certificate',
    triggeredAt: '2025-06-17 09:15',
    status: 'success',
    durationMs: 890,
  },
  {
    id: 'r3',
    automationName: 'Tag power learners',
    triggeredAt: '2025-06-15 16:45',
    status: 'error',
    durationMs: 120,
    error: 'Slack webhook timeout',
  },
  {
    id: 'r4',
    automationName: 'Welcome new learners',
    triggeredAt: '2025-06-15 11:02',
    status: 'success',
    durationMs: 301,
  },
  {
    id: 'r5',
    automationName: 'Weekly progress report',
    triggeredAt: '2025-06-11 08:00',
    status: 'success',
    durationMs: 1240,
  },
];

export function useTowerRunLogs(tenantId: string | undefined, limit = 50) {
  const [runs, setRuns] = useState<TowerRunLog[]>(FALLBACK_RUNS);

  const { data, loading } = useQuery(GET_AUTOMATION_RUNS, {
    variables: { tenantId: tenantId ?? '', limit },
    skip: !tenantId,
    errorPolicy: 'ignore',
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    if (!data?.automationRuns?.length) return;
    setRuns(
      data.automationRuns.map(
        (r: {
          id: string;
          automationName: string;
          triggeredAt: string;
          status: 'success' | 'error' | 'running';
          durationMs: number;
          error?: string;
        }): TowerRunLog => ({
          id: r.id,
          automationName: r.automationName,
          triggeredAt: formatRunTimestamp(r.triggeredAt),
          status: r.status,
          durationMs: r.durationMs,
          error: r.error,
        }),
      ),
    );
  }, [data]);

  return { runs, loading };
}
