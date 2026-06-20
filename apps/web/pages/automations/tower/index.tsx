import { useState, useMemo, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import { AppLayout, getDefaultSidebarSections, getDefaultLogo, SnackbarProvider, DataListPage } from '@luxgen/ui';
import type { DataListTab, FilterChipData, SortOption, SortDirection } from '@luxgen/ui';
import { GET_AUTOMATIONS, GET_AUTOMATION_RUNS } from '../../../graphql/queries/automations';
import { getTenantPageProps } from '../../../lib/tenant-page-props';
import { useAppLayoutHeader } from '../../../lib/app-layout-header';
import { useLayoutUser } from '../../../lib/app-layout-user';
import { useTenantScope } from '../../../lib/use-tenant-scope';
import { createHandleUserAction } from '../../../lib/user-actions';
import {
  triggerFromGql,
  actionFromGql,
  formatRelativeTime,
  formatRunTimestamp,
  type UiTriggerType,
  type UiActionType,
} from '../../../lib/automation-map';

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

interface AutomationRun {
  id: string;
  automationName: string;
  triggeredAt: string;
  status: 'success' | 'error' | 'running';
  durationMs: number;
  error?: string;
}

const TRIGGERS: { type: TriggerType; label: string; emoji: string; desc: string }[] = [
  { type: 'course_completed', label: 'Course Completed', emoji: '🎓', desc: 'When a learner finishes a course' },
  { type: 'user_enrolled', label: 'User Enrolled', emoji: '✅', desc: 'When a user joins a course' },
  { type: 'group_joined', label: 'Group Joined', emoji: '👥', desc: 'When a user joins a group' },
  { type: 'certificate_issued', label: 'Certificate Issued', emoji: '🏆', desc: 'When a certificate is generated' },
  { type: 'schedule', label: 'Scheduled', emoji: '🕐', desc: 'Fires on a cron schedule' },
  { type: 'webhook', label: 'Webhook', emoji: '🔗', desc: 'Triggered by external HTTP POST' },
  { type: 'code_change_staged', label: 'Code Change Staged', emoji: '📝', desc: 'When Agent Studio stages files' },
  {
    type: 'code_change_committed',
    label: 'Code Change Committed',
    emoji: '✔️',
    desc: 'When an agent commit lands on branch',
  },
  { type: 'code_change_merged', label: 'Code Change Merged', emoji: '🔀', desc: 'When agent branch merges to main' },
  { type: 'code_change_failed', label: 'Code Change Failed', emoji: '⚠️', desc: 'When validation or agent run fails' },
];

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
      { type: 'notify_slack', label: 'Notify Slack' },
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
    status: 'active',
    trigger: { type: 'certificate_issued', label: 'Certificate Issued' },
    actions: [
      { type: 'tag_user', label: 'Tag User' },
      { type: 'enroll_in_course', label: 'Enroll in Course' },
    ],
    runCount: 41,
    lastRunAt: '3 days ago',
    createdAt: 'Apr 5, 2025',
  },
  {
    id: 'a5',
    name: 'Onboarding drip (draft)',
    status: 'draft',
    trigger: { type: 'user_enrolled', label: 'User Enrolled' },
    actions: [{ type: 'send_email', label: 'Send Email' }],
    runCount: 0,
    lastRunAt: null,
    createdAt: 'Jun 10, 2025',
  },
];

const RUN_HISTORY: AutomationRun[] = [
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

const SORT_OPTIONS: SortOption[] = [
  { id: 'name', label: 'Name' },
  { id: 'lastRun', label: 'Last run' },
  { id: 'runCount', label: 'Run count' },
  { id: 'created', label: 'Created' },
];

const TABS: DataListTab[] = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'paused', label: 'Paused' },
  { id: 'draft', label: 'Draft' },
];

// ── Add-filter popover ──────────────────────────────────────────────────────

interface AddFilterPopoverProps {
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  onAdd: (filter: FilterChipData) => void;
  existingFilterIds: string[];
}

function AddFilterPopover({ anchorRef, onClose, onAdd, existingFilterIds }: AddFilterPopoverProps) {
  const [step, setStep] = useState<'pick' | 'status' | 'trigger' | 'tags'>('pick');
  const [tagInput, setTagInput] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        popoverRef.current &&
        !popoverRef.current.contains(target) &&
        anchorRef.current &&
        !anchorRef.current.contains(target)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose, anchorRef]);

  const filterOptions = [
    { id: 'status', label: 'Status' },
    { id: 'trigger', label: 'Trigger type' },
    { id: 'tags', label: 'Tags' },
    { id: 'timeRange', label: 'Time range' },
  ].filter((o) => !existingFilterIds.includes(o.id));

  const rect = anchorRef.current?.getBoundingClientRect();
  const popoverStyle: React.CSSProperties = rect
    ? { position: 'fixed', top: rect.bottom + 6, left: rect.left, zIndex: 1100 }
    : { position: 'fixed', top: 200, left: 200, zIndex: 1100 };

  const menuItemStyle: React.CSSProperties = {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    padding: '9px 12px',
    fontSize: 14,
    color: 'var(--color-label-primary)',
    background: 'none',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
  };

  return (
    <div ref={popoverRef} style={popoverStyle}>
      <div
        style={{
          background: 'var(--color-bg-primary)',
          border: '1px solid var(--color-separator)',
          borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          minWidth: 220,
          overflow: 'hidden',
        }}
      >
        {step === 'pick' && (
          <div style={{ padding: 8 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--color-label-secondary)',
                padding: '6px 8px 4px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Add filter
            </div>
            {filterOptions.length === 0 ? (
              <div style={{ padding: '10px 12px', fontSize: 13, color: 'var(--color-label-secondary)' }}>
                All filters applied
              </div>
            ) : (
              filterOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setStep(opt.id as 'status' | 'trigger' | 'tags')}
                  style={menuItemStyle}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-fill-quaternary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                >
                  {opt.label}
                </button>
              ))
            )}
          </div>
        )}

        {step === 'status' && (
          <div style={{ padding: 8 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--color-label-secondary)',
                padding: '6px 8px 4px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Status
            </div>
            {(['active', 'paused', 'draft'] as const).map((s) => (
              <button
                key={s}
                onClick={() => {
                  onAdd({ id: 'status', label: 'Status', value: s });
                  onClose();
                }}
                style={{ ...menuItemStyle, textTransform: 'capitalize' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-fill-quaternary)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {step === 'trigger' && (
          <div style={{ padding: 8, maxHeight: 260, overflowY: 'auto' }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--color-label-secondary)',
                padding: '6px 8px 4px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Trigger type
            </div>
            {TRIGGERS.map((t) => (
              <button
                key={t.type}
                onClick={() => {
                  onAdd({ id: 'trigger', label: 'Trigger', value: t.label });
                  onClose();
                }}
                style={menuItemStyle}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-fill-quaternary)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
              >
                {t.emoji} {t.label}
              </button>
            ))}
          </div>
        )}

        {step === 'tags' && (
          <div style={{ padding: 12 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--color-label-secondary)',
                marginBottom: 8,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Tag
            </div>
            <input
              autoFocus
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Enter tag..."
              onKeyDown={(e) => {
                if (e.key === 'Enter' && tagInput.trim()) {
                  onAdd({ id: 'tags', label: 'Tag', value: tagInput.trim() });
                  onClose();
                }
              }}
              style={{
                width: '100%',
                height: 36,
                padding: '0 10px',
                borderRadius: 8,
                border: '1px solid var(--color-separator)',
                background: 'var(--color-bg-secondary)',
                color: 'var(--color-label-primary)',
                fontSize: 14,
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
            <div style={{ fontSize: 11, color: 'var(--color-label-tertiary)', marginTop: 6 }}>Press Enter to add</div>
          </div>
        )}

        {step !== 'pick' && (
          <div style={{ padding: '6px 8px 8px', borderTop: '1px solid var(--color-separator)' }}>
            <button
              onClick={() => setStep('pick')}
              style={{
                fontSize: 13,
                color: 'var(--color-blue)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px 6px',
                borderRadius: 6,
              }}
            >
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────────────────────

function TowerListContent({ tenant }: TowerPageProps) {
  const router = useRouter();
  const handleUserAction = createHandleUserAction(router);
  const layoutUser = useLayoutUser();
  const { queryTenantId, subdomain } = useTenantScope(tenant);
  const headerProps = useAppLayoutHeader();

  const [automations, setAutomations] = useState<Automation[]>(INITIAL_AUTOMATIONS);
  const [runHistory, setRunHistory] = useState<AutomationRun[]>(RUN_HISTORY);
  const [useGraphql, setUseGraphql] = useState(false);

  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<FilterChipData[]>([]);
  const [selectedSort, setSelectedSort] = useState('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [showFilterPopover, setShowFilterPopover] = useState(false);
  const addFilterBtnRef = useRef<HTMLButtonElement>(null);

  const { data: gqlData } = useQuery(GET_AUTOMATIONS, {
    variables: { tenantId: queryTenantId },
    skip: !queryTenantId,
    errorPolicy: 'ignore',
    fetchPolicy: 'cache-and-network',
  });

  const { data: runsData } = useQuery(GET_AUTOMATION_RUNS, {
    variables: { tenantId: queryTenantId, limit: 10 },
    skip: !queryTenantId,
    errorPolicy: 'ignore',
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    if (!gqlData?.automations?.length) return;
    setUseGraphql(true);
    setAutomations(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      gqlData.automations.map(
        (a: any): Automation => ({
          id: a.id,
          name: a.name,
          status: a.enabled ? 'active' : 'paused',
          trigger: { type: triggerFromGql(a.triggerType), label: a.triggerLabel },
          actions: a.actions.map((x: { type: string; label: string }) => ({
            type: actionFromGql(x.type),
            label: x.label,
          })),
          runCount: a.runCount,
          lastRunAt: formatRelativeTime(a.lastRunAt),
          createdAt: formatRelativeTime(a.createdAt) ?? 'Recently',
        }),
      ),
    );
  }, [gqlData]);

  useEffect(() => {
    if (!runsData?.automationRuns?.length) return;
    setRunHistory(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      runsData.automationRuns.map(
        (r: any): AutomationRun => ({
          id: r.id,
          automationName: r.automationName,
          triggeredAt: formatRunTimestamp(r.triggeredAt),
          status: r.status,
          durationMs: r.durationMs,
          error: r.error,
        }),
      ),
    );
  }, [runsData]);

  // Suppress unused variable warning for useGraphql
  void useGraphql;

  const tabsWithCounts: DataListTab[] = TABS.map((t) => ({
    ...t,
    count: t.id === 'all' ? automations.length : automations.filter((a) => a.status === t.id).length,
  }));

  const filtered = useMemo(() => {
    let list = [...automations];
    if (activeTab !== 'all') list = list.filter((a) => a.status === activeTab);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((a) => a.name.toLowerCase().includes(q) || a.trigger.label.toLowerCase().includes(q));
    }
    for (const chip of activeFilters) {
      if (chip.id === 'status') list = list.filter((a) => a.status === chip.value);
      if (chip.id === 'trigger') list = list.filter((a) => a.trigger.label === chip.value);
    }
    list.sort((a, b) => {
      let cmp = 0;
      if (selectedSort === 'name') cmp = a.name.localeCompare(b.name);
      else if (selectedSort === 'runCount') cmp = a.runCount - b.runCount;
      else if (selectedSort === 'lastRun') cmp = (a.lastRunAt ?? '').localeCompare(b.lastRunAt ?? '');
      else if (selectedSort === 'created') cmp = a.createdAt.localeCompare(b.createdAt);
      return sortDirection === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [automations, activeTab, searchQuery, activeFilters, selectedSort, sortDirection]);

  const handleAddFilter = (filter: FilterChipData) => {
    setActiveFilters((prev) => prev.filter((f) => f.id !== filter.id).concat(filter));
  };

  const towerIcon = (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );

  return (
    <AppLayout
      sidebarSections={getDefaultSidebarSections()}
      user={layoutUser ?? undefined}
      logo={getDefaultLogo()}
      onUserAction={handleUserAction}
      {...headerProps}
    >
      <Head>
        <title>Tower — {subdomain.charAt(0).toUpperCase() + subdomain.slice(1)}</title>
      </Head>

      {/* Canvas controls row */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, padding: '0 0 12px' }}>
        <button
          className="ios-btn-secondary"
          style={{ padding: '6px 12px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 5 }}
          title="Edit in canvas"
          onClick={() => filtered[0] && void router.push(`/automations/tower/${filtered[0].id}`)}
        >
          <span>✏️</span> Edit
        </button>
        <button className="ios-btn-secondary" style={{ padding: '6px 12px', fontSize: 13 }} title="Zoom in">
          +
        </button>
        <button className="ios-btn-secondary" style={{ padding: '6px 12px', fontSize: 13 }} title="Zoom out">
          −
        </button>
        <button className="ios-btn-secondary" style={{ padding: '6px 12px', fontSize: 13 }} title="Fullscreen">
          ⤢
        </button>
      </div>

      <DataListPage
        icon={towerIcon}
        breadcrumb="Automations"
        title="Tower"
        primaryAction={{ label: '+ New Tower', onClick: () => void router.push('/automations/tower/new') }}
        tabs={tabsWithCounts}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilters={activeFilters}
        onRemoveFilter={(id) => setActiveFilters((prev) => prev.filter((f) => f.id !== id))}
        onAddFilter={() => setShowFilterPopover((v) => !v)}
        onClearAll={() => setActiveFilters([])}
        searchPlaceholder="Search towers..."
        sortOptions={SORT_OPTIONS}
        selectedSortOption={selectedSort}
        sortDirection={sortDirection}
        onSortOptionChange={setSelectedSort}
        onSortDirectionChange={setSortDirection}
      >
        {/* Tower table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-separator)' }}>
                {['Name', 'Status', 'Trigger', 'Actions', 'Last run', 'Runs', 'Created', ''].map((col) => (
                  <th
                    key={col}
                    style={{
                      padding: '10px 16px',
                      textAlign: 'left',
                      fontWeight: 600,
                      fontSize: 12,
                      color: 'var(--color-label-secondary)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--color-label-secondary)' }}
                  >
                    <div style={{ fontSize: 32, marginBottom: 10 }}>⚡</div>
                    <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--color-label-primary)' }}>
                      No towers found
                    </div>
                    <div style={{ fontSize: 13 }}>Create your first tower to automate workflows.</div>
                  </td>
                </tr>
              ) : (
                filtered.map((auto) => (
                  <tr
                    key={auto.id}
                    style={{ borderBottom: '1px solid var(--color-separator)', transition: 'background 0.1s' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--color-fill-quaternary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <td style={{ padding: '12px 16px', fontWeight: 500, color: 'var(--color-label-primary)' }}>
                      {auto.name}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        className={`badge ${
                          auto.status === 'active'
                            ? 'badge-green'
                            : auto.status === 'paused'
                              ? 'badge-orange'
                              : 'badge-gray'
                        }`}
                        style={{ textTransform: 'capitalize' }}
                      >
                        {auto.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--color-label-secondary)' }}>
                      {auto.trigger.label}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--color-label-secondary)' }}>
                      {auto.actions.length}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--color-label-secondary)', whiteSpace: 'nowrap' }}>
                      {auto.lastRunAt ?? '—'}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--color-label-secondary)' }}>
                      {auto.runCount.toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--color-label-secondary)', whiteSpace: 'nowrap' }}>
                      {auto.createdAt}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button
                        className="ios-btn-plain"
                        style={{ fontSize: 13 }}
                        onClick={() => void router.push(`/automations/tower/${auto.id}`)}
                      >
                        Edit ✏️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Recent Run Logs */}
        <div style={{ borderTop: '1px solid var(--color-separator)' }}>
          <div
            style={{
              padding: '18px 20px 14px',
              fontWeight: 600,
              fontSize: 15,
              color: 'var(--color-label-primary)',
              borderBottom: '1px solid var(--color-separator)',
            }}
          >
            Recent Run Logs
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-separator)' }}>
                  {['Tower name', 'Status', 'Triggered at', 'Duration', 'Error'].map((col) => (
                    <th
                      key={col}
                      style={{
                        padding: '10px 16px',
                        textAlign: 'left',
                        fontWeight: 600,
                        fontSize: 12,
                        color: 'var(--color-label-secondary)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {runHistory.map((run) => (
                  <tr
                    key={run.id}
                    style={{ borderBottom: '1px solid var(--color-separator)', transition: 'background 0.1s' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--color-fill-quaternary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <td style={{ padding: '11px 16px', fontWeight: 500, color: 'var(--color-label-primary)' }}>
                      {run.automationName}
                    </td>
                    <td style={{ padding: '11px 16px' }}>
                      <span
                        className={`badge ${
                          run.status === 'success'
                            ? 'badge-green'
                            : run.status === 'error'
                              ? 'badge-red'
                              : 'badge-orange'
                        }`}
                      >
                        {run.status === 'success' ? '✓ Success' : run.status === 'error' ? '✗ Error' : '⟳ Running'}
                      </span>
                    </td>
                    <td style={{ padding: '11px 16px', color: 'var(--color-label-secondary)', whiteSpace: 'nowrap' }}>
                      {run.triggeredAt}
                    </td>
                    <td style={{ padding: '11px 16px', color: 'var(--color-label-secondary)' }}>{run.durationMs}ms</td>
                    <td
                      style={{
                        padding: '11px 16px',
                        color: 'var(--color-red, #FF3B30)',
                        maxWidth: 240,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {run.error ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </DataListPage>

      {showFilterPopover && (
        <AddFilterPopover
          anchorRef={addFilterBtnRef}
          onClose={() => setShowFilterPopover(false)}
          onAdd={handleAddFilter}
          existingFilterIds={activeFilters.map((f) => f.id)}
        />
      )}
    </AppLayout>
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
