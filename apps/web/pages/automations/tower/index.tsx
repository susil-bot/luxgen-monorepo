import Head from 'next/head';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { SnackbarProvider, useSnackbar } from '@luxgen/ui';

import { TowerShell } from '../../../components/automations/tower';
import styles from '../../../components/automations/tower/TowerFlow.module.css';
import {
  ARCHIVE_AUTOMATION,
  DUPLICATE_AUTOMATION,
  GET_AUTOMATIONS,
  PAUSE_AUTOMATION,
  PUBLISH_AUTOMATION,
} from '../../../graphql/queries/automations';
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
type LifecycleStatus = 'draft' | 'live' | 'paused' | 'archived';

interface Automation {
  id: string;
  name: string;
  status: LifecycleStatus;
  trigger: { type: TriggerType; label: string };
  actions: { type: ActionType; label: string }[];
  runCount: number;
  lastRunAt: string | null;
  createdAt: string;
}

const INITIAL_AUTOMATIONS: Automation[] = [];

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'live', label: 'Live' },
  { id: 'paused', label: 'Paused' },
  { id: 'draft', label: 'Draft' },
  { id: 'archived', label: 'Archived' },
] as const;

function statusBadge(status: LifecycleStatus) {
  if (status === 'live') return <span className={styles.badgeActive}>Live</span>;
  if (status === 'paused') return <span className={styles.badgePaused}>Paused</span>;
  if (status === 'archived') return <span className={styles.badgeArchived}>Archived</span>;
  return <span className={styles.badgeDraft}>Draft</span>;
}

function normalizeStatus(raw: string | null | undefined, enabled: boolean): LifecycleStatus {
  if (raw === 'live' || raw === 'paused' || raw === 'draft' || raw === 'archived') return raw;
  return enabled ? 'live' : 'draft';
}

function TowerListContent({ tenant }: TowerPageProps) {
  const router = useRouter();
  const { showSuccess, showError } = useSnackbar();
  const { queryTenantId, subdomain } = useTenantScope(tenant);

  const [automations, setAutomations] = useState<Automation[]>(INITIAL_AUTOMATIONS);
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]['id']>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const { data: gqlData, refetch } = useQuery(GET_AUTOMATIONS, {
    variables: { tenantId: queryTenantId },
    skip: !queryTenantId,
    errorPolicy: 'ignore',
    fetchPolicy: 'cache-and-network',
  });

  const [duplicateAutomation] = useMutation(DUPLICATE_AUTOMATION);
  const [publishAutomation] = useMutation(PUBLISH_AUTOMATION);
  const [pauseAutomation] = useMutation(PAUSE_AUTOMATION);
  const [archiveAutomation] = useMutation(ARCHIVE_AUTOMATION);

  const handleDuplicate = useCallback(
    async (id: string, name: string) => {
      setBusyId(id);
      try {
        const { data } = await duplicateAutomation({
          variables: { id, name: `${name} (copy)` },
        });
        const createdId = data?.duplicateAutomation?.id as string | undefined;
        if (!createdId) throw new Error('Duplicate failed');
        showSuccess('Tower duplicated');
        await refetch();
        void router.push(`/automations/tower/${createdId}`);
      } catch (err) {
        showError(err instanceof Error ? err.message : 'Could not duplicate tower');
      } finally {
        setBusyId(null);
      }
    },
    [duplicateAutomation, refetch, router, showSuccess, showError],
  );

  const runLifecycle = useCallback(
    async (id: string, action: 'publish' | 'pause' | 'archive') => {
      setBusyId(id);
      try {
        if (action === 'publish') {
          const { data } = await publishAutomation({ variables: { id } });
          if (!data?.publishAutomation) throw new Error('Publish failed');
          showSuccess('Tower published');
        } else if (action === 'pause') {
          const { data } = await pauseAutomation({ variables: { id } });
          if (!data?.pauseAutomation) throw new Error('Pause failed');
          showSuccess('Tower paused');
        } else {
          const { data } = await archiveAutomation({ variables: { id } });
          if (!data?.archiveAutomation) throw new Error('Archive failed');
          showSuccess('Tower archived');
        }
        await refetch();
      } catch (err) {
        showError(err instanceof Error ? err.message : `Could not ${action} tower`);
      } finally {
        setBusyId(null);
      }
    },
    [publishAutomation, pauseAutomation, archiveAutomation, refetch, showSuccess, showError],
  );

  useEffect(() => {
    if (!gqlData?.automations) return;
    setAutomations(
      gqlData.automations.map(
        (a: {
          id: string;
          name: string;
          enabled: boolean;
          status?: string;
          triggerType: string;
          triggerLabel: string;
          actions: { type: string; label: string }[];
          runCount: number;
          lastRunAt?: string;
          createdAt?: string;
        }): Automation => ({
          id: a.id,
          name: a.name,
          status: normalizeStatus(a.status, a.enabled),
          trigger: { type: triggerFromGql(a.triggerType), label: a.triggerLabel },
          actions: a.actions.map((x) => ({ type: actionFromGql(x.type), label: x.label })),
          runCount: a.runCount,
          lastRunAt: formatRelativeTime(a.lastRunAt),
          createdAt: formatRelativeTime(a.createdAt) ?? 'Recently',
        }),
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
                      <td style={{ color: 'var(--color-label-secondary)' }}>{auto.trigger.label}</td>
                      <td style={{ color: 'var(--color-label-secondary)' }}>{auto.actions.length + 1}</td>
                      <td style={{ color: 'var(--color-label-secondary)', whiteSpace: 'nowrap' }}>
                        {auto.lastRunAt ?? '—'}
                      </td>
                      <td style={{ color: 'var(--color-label-secondary)' }}>{auto.runCount.toLocaleString()}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                          {auto.status !== 'live' && auto.status !== 'archived' ? (
                            <button
                              type="button"
                              className={styles.secondaryBtn}
                              disabled={busyId === auto.id}
                              onClick={() => void runLifecycle(auto.id, 'publish')}
                            >
                              Publish
                            </button>
                          ) : null}
                          {auto.status === 'live' ? (
                            <button
                              type="button"
                              className={styles.secondaryBtn}
                              disabled={busyId === auto.id}
                              onClick={() => void runLifecycle(auto.id, 'pause')}
                            >
                              Pause
                            </button>
                          ) : null}
                          {auto.status !== 'archived' ? (
                            <button
                              type="button"
                              className={styles.secondaryBtn}
                              disabled={busyId === auto.id}
                              onClick={() => void runLifecycle(auto.id, 'archive')}
                            >
                              Archive
                            </button>
                          ) : null}
                          <button
                            type="button"
                            className={styles.secondaryBtn}
                            disabled={busyId === auto.id}
                            onClick={() => void handleDuplicate(auto.id, auto.name)}
                          >
                            {busyId === auto.id ? '…' : 'Duplicate'}
                          </button>
                          <button
                            type="button"
                            className={styles.secondaryBtn}
                            onClick={() => void router.push(`/automations/tower/${auto.id}`)}
                          >
                            Open
                          </button>
                        </div>
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
