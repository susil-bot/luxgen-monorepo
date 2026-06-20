import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import { SnackbarProvider } from '@luxgen/ui';

import { TowerShell } from '../../../components/automations/tower/TowerShell';
import styles from '../../../components/automations/tower/TowerFlow.module.css';
import { GET_AUTOMATIONS } from '../../../graphql/queries/automations';
import {
  triggerFromGql,
  actionFromGql,
  formatRelativeTime,
  type UiTriggerType,
  type UiActionType,
} from '../../../lib/automation-map';
import { getTenantPageProps } from '../../../lib/tenant-page-props';
import { useTenantScope } from '../../../lib/use-tenant-scope';

interface TowerPageProps {
  tenant: string;
}

type TriggerType = UiTriggerType;
type ActionType = UiActionType;

interface Automation {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'draft';
  trigger: { type: TriggerType; label: string };
  actions: { type: ActionType; label: string }[];
  runCount: number;
  lastRunAt: string | null;
  createdAt: string;
}

const INITIAL_AUTOMATIONS: Automation[] = [
  {
    id: 'a1',
    name: 'Welcome new learners',
    status: 'active',
    trigger: { type: 'user_enrolled', label: 'User Enrolled' },
    actions: [
      { type: 'send_email', label: 'Send Email' },
      { type: 'add_to_group', label: 'Add to Group' },
    ],
    runCount: 284,
    lastRunAt: '2 hours ago',
    createdAt: 'Jan 12, 2025',
  },
  {
    id: 'a2',
    name: 'Course completion certificate',
    status: 'active',
    trigger: { type: 'course_completed', label: 'Course Completed' },
    actions: [
      { type: 'issue_certificate', label: 'Issue Certificate' },
      { type: 'send_email', label: 'Send Email' },
    ],
    runCount: 97,
    lastRunAt: '1 day ago',
    createdAt: 'Feb 3, 2025',
  },
  {
    id: 'a3',
    name: 'Weekly progress report',
    status: 'paused',
    trigger: { type: 'schedule', label: 'Scheduled' },
    actions: [{ type: 'send_email', label: 'Send Email' }],
    runCount: 12,
    lastRunAt: '7 days ago',
    createdAt: 'Mar 20, 2025',
  },
  {
    id: 'a4',
    name: 'Tag power learners',
    status: 'draft',
    trigger: { type: 'certificate_issued', label: 'Certificate Issued' },
    actions: [{ type: 'tag_user', label: 'Tag User' }],
    runCount: 0,
    lastRunAt: null,
    createdAt: 'Apr 5, 2025',
  },
];

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'paused', label: 'Paused' },
  { id: 'draft', label: 'Draft' },
] as const;

function statusBadge(status: Automation['status']) {
  if (status === 'active') return <span className={styles.badgeActive}>Active</span>;
  if (status === 'paused') return <span className={styles.badgePaused}>Paused</span>;
  return <span className={styles.badgeDraft}>Draft</span>;
}

function TowerListContent({ tenant }: TowerPageProps) {
  const router = useRouter();
  const { queryTenantId, subdomain } = useTenantScope(tenant);

  const [automations, setAutomations] = useState<Automation[]>(INITIAL_AUTOMATIONS);
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]['id']>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: gqlData } = useQuery(GET_AUTOMATIONS, {
    variables: { tenantId: queryTenantId },
    skip: !queryTenantId,
    errorPolicy: 'ignore',
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    if (!gqlData?.automations) return;
    setAutomations(
      gqlData.automations.map(
        (a: {
          id: string;
          name: string;
          enabled: boolean;
          flowDefinition?: unknown;
          triggerType: string;
          triggerLabel: string;
          actions: { type: string; label: string }[];
          runCount: number;
          lastRunAt?: string;
          createdAt?: string;
        }): Automation => {
          const hasFlow = a.flowDefinition != null && typeof a.flowDefinition === 'object';
          const status: Automation['status'] = !hasFlow ? 'draft' : a.enabled ? 'active' : 'paused';
          return {
            id: a.id,
            name: a.name,
            status,
            trigger: { type: triggerFromGql(a.triggerType), label: a.triggerLabel },
            actions: a.actions.map((x) => ({ type: actionFromGql(x.type), label: x.label })),
            runCount: a.runCount,
            lastRunAt: formatRelativeTime(a.lastRunAt),
            createdAt: formatRelativeTime(a.createdAt) ?? 'Recently',
          };
        },
      ),
    );
  }, [gqlData]);

  const filtered = useMemo(() => {
    let list = [...automations];
    if (activeTab !== 'all') list = list.filter((a) => a.status === activeTab);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((a) => a.name.toLowerCase().includes(q) || a.trigger.label.toLowerCase().includes(q));
    }
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [automations, activeTab, searchQuery]);

  const tabsWithCounts = TABS.map((t) => ({
    ...t,
    count: t.id === 'all' ? automations.length : automations.filter((a) => a.status === t.id).length,
  }));

  return (
    <>
      <Head>
        <title>Tower — {subdomain.charAt(0).toUpperCase() + subdomain.slice(1)}</title>
      </Head>

      <TowerShell
        tenant={tenant}
        activeSubNav="workflows"
        title="Tower"
        lead="Build Shopify Flow–style automations with triggers, conditions, and actions."
        primaryAction={{ label: 'Create tower', onClick: () => void router.push('/automations/tower/new') }}
      >
        <div className={styles.card}>
          <div className={styles.tabs}>
            {tabsWithCounts.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          <div className={styles.toolbar}>
            <input
              type="search"
              className={styles.searchInput}
              placeholder="Search towers…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search towers"
            />
          </div>

          {filtered.length === 0 ? (
            <div className={styles.emptyState}>
              <div style={{ fontSize: 32 }}>⚡</div>
              <div className={styles.emptyTitle}>No towers found</div>
              <div>Create your first tower to automate learner and ops workflows.</div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    {['Name', 'Status', 'Trigger', 'Steps', 'Last run', 'Total runs', ''].map((col) => (
                      <th key={col}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((auto) => (
                    <tr key={auto.id}>
                      <td>
                        <button
                          type="button"
                          className={styles.rowLink}
                          onClick={() => void router.push(`/automations/tower/${auto.id}`)}
                        >
                          {auto.name}
                        </button>
                      </td>
                      <td>{statusBadge(auto.status)}</td>
                      <td style={{ color: '#616161' }}>{auto.trigger.label}</td>
                      <td style={{ color: '#616161' }}>{auto.actions.length + 1}</td>
                      <td style={{ color: '#616161', whiteSpace: 'nowrap' }}>{auto.lastRunAt ?? '—'}</td>
                      <td style={{ color: '#616161' }}>{auto.runCount.toLocaleString()}</td>
                      <td>
                        <button
                          type="button"
                          className={styles.secondaryBtn}
                          onClick={() => void router.push(`/automations/tower/${auto.id}`)}
                        >
                          Open
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </TowerShell>
    </>
  );
}

export default function TowerPage(props: TowerPageProps) {
  return (
    <SnackbarProvider>
      <TowerListContent {...props} />
    </SnackbarProvider>
  );
}

export const getServerSideProps = getTenantPageProps;
