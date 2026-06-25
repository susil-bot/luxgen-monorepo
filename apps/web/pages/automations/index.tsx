import { useState, useMemo, useEffect } from 'react';
import Head from 'next/head';
import { useQuery, useMutation } from '@apollo/client';
import { AppLayout, getDefaultSidebarSections, getDefaultUser, getDefaultLogo } from '@luxgen/ui';
import {
  GET_AUTOMATIONS,
  GET_AUTOMATION_RUNS,
  TOGGLE_AUTOMATION,
  CREATE_AUTOMATION,
  UPDATE_AUTOMATION,
  DELETE_AUTOMATION,
} from '../../graphql/queries/automations';
import { PlanGate } from '../../components/billing/PlanGate';
import { GET_TENANT_BILLING } from '../../graphql/queries/billing';
import { normalizePlan } from '@luxgen/billing';
import {
  triggerFromGql,
  triggerToGql,
  actionFromGql,
  actionToGql,
  formatRelativeTime,
  formatRunTimestamp,
  type UiTriggerType,
  type UiActionType,
} from '../../lib/automation-map';
import { getTenantPageProps } from '../../lib/tenant-page-props';
import { useTenantScope } from '../../lib/use-tenant-scope';

interface Props {
  tenant: string;
}

type TriggerType = UiTriggerType;
type ActionType = UiActionType;

interface Automation {
  id: string;
  name: string;
  enabled: boolean;
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

const ACTIONS: { type: ActionType; label: string; emoji: string }[] = [
  { type: 'send_email', label: 'Send Email', emoji: '📧' },
  { type: 'add_to_group', label: 'Add to Group', emoji: '➕' },
  { type: 'remove_from_group', label: 'Remove from Group', emoji: '➖' },
  { type: 'enroll_in_course', label: 'Enroll in Course', emoji: '📚' },
  { type: 'issue_certificate', label: 'Issue Certificate', emoji: '🏆' },
  { type: 'call_webhook', label: 'Call Webhook', emoji: '🔗' },
  { type: 'notify_slack', label: 'Notify Slack', emoji: '💬' },
  { type: 'tag_user', label: 'Tag User', emoji: '🏷️' },
  { type: 'run_agent_task', label: 'Run Agent Task', emoji: '🤖' },
];

interface BuilderState {
  name: string;
  trigger: TriggerType | null;
  actions: ActionType[];
}

export default function AutomationsPage({ tenant }: Props) {
  const { queryTenantId, subdomain } = useTenantScope(tenant);
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [runHistory, setRunHistory] = useState<AutomationRun[]>([]);

  const { data: billingData } = useQuery(GET_TENANT_BILLING, {
    variables: { tenantId: queryTenantId },
    skip: !queryTenantId,
    errorPolicy: 'ignore',
  });
  const tenantPlan = normalizePlan(billingData?.tenantBilling?.plan?.toLowerCase?.() ?? 'free');

  const { data: gqlData, refetch: refetchAutomations } = useQuery(GET_AUTOMATIONS, {
    variables: { tenantId: queryTenantId },
    skip: !queryTenantId,
    errorPolicy: 'ignore',
    fetchPolicy: 'cache-and-network',
  });

  const { data: runsData, refetch: refetchRuns } = useQuery(GET_AUTOMATION_RUNS, {
    variables: { tenantId: queryTenantId, limit: 10 },
    skip: !queryTenantId,
    errorPolicy: 'ignore',
    fetchPolicy: 'cache-and-network',
  });

  const [toggleMutation] = useMutation(TOGGLE_AUTOMATION);
  const [createMutation] = useMutation(CREATE_AUTOMATION);
  const [updateMutation] = useMutation(UPDATE_AUTOMATION);
  const [deleteMutation] = useMutation(DELETE_AUTOMATION);

  const graphqlReady = gqlData?.automations != null;

  useEffect(() => {
    if (!gqlData?.automations) return;
    setAutomations(
      gqlData.automations.map(
        (a: {
          id: string;
          name: string;
          enabled: boolean;
          triggerType: string;
          triggerLabel: string;
          actions: { type: string; label: string }[];
          runCount: number;
          lastRunAt?: string;
          createdAt: string;
        }) => ({
          id: a.id,
          name: a.name,
          enabled: a.enabled,
          trigger: { type: triggerFromGql(a.triggerType), label: a.triggerLabel },
          actions: a.actions.map((x) => ({ type: actionFromGql(x.type), label: x.label })),
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
      runsData.automationRuns.map(
        (r: {
          id: string;
          automationName: string;
          triggeredAt: string;
          status: 'success' | 'error' | 'running';
          durationMs: number;
          error?: string;
        }) => ({
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
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'paused'>('all');
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [builder, setBuilder] = useState<BuilderState>({ name: '', trigger: null, actions: [] });

  const filtered = useMemo(() => {
    if (activeTab === 'active') return automations.filter((a) => a.enabled);
    if (activeTab === 'paused') return automations.filter((a) => !a.enabled);
    return automations;
  }, [automations, activeTab]);

  const toggleEnabled = async (id: string) => {
    const current = automations.find((a) => a.id === id);
    if (!current) return;
    const next = !current.enabled;
    setAutomations((prev) => prev.map((a) => (a.id === id ? { ...a, enabled: next } : a)));
    if (graphqlReady) {
      try {
        await toggleMutation({ variables: { id, enabled: next } });
        await refetchAutomations();
      } catch {
        setAutomations((prev) => prev.map((a) => (a.id === id ? { ...a, enabled: !next } : a)));
      }
    }
  };

  const duplicateAutomation = (a: Automation) => {
    setAutomations((prev) => [
      ...prev,
      {
        ...a,
        id: `${a.id}-copy-${Date.now()}`,
        name: `${a.name} (copy)`,
        enabled: false,
        runCount: 0,
        lastRunAt: null,
        createdAt: 'Just now',
      },
    ]);
  };

  const deleteAutomation = async (id: string) => {
    if (graphqlReady) {
      try {
        await deleteMutation({ variables: { id } });
        await refetchAutomations();
      } catch {
        return;
      }
    }
    setAutomations((prev) => prev.filter((a) => a.id !== id));
    setDeleteId(null);
  };

  const openBuilder = (id?: string) => {
    if (id) {
      const a = automations.find((x) => x.id === id);
      if (a) {
        setBuilder({ name: a.name, trigger: a.trigger.type, actions: a.actions.map((x) => x.type) });
        setEditingId(id);
      }
    } else {
      setBuilder({ name: '', trigger: null, actions: [] });
      setEditingId(null);
    }
    setBuilderOpen(true);
  };

  const saveAutomation = async () => {
    if (!builder.trigger || builder.actions.length === 0 || !builder.name.trim()) return;
    const triggerMeta = TRIGGERS.find((t) => t.type === builder.trigger)!;
    const actionMetas = builder.actions.map((a) => ({ type: a, label: ACTIONS.find((x) => x.type === a)!.label }));

    if (graphqlReady) {
      const gqlActions = actionMetas.map((a) => ({
        type: actionToGql(a.type),
        label: a.label,
      }));
      try {
        if (editingId) {
          await updateMutation({
            variables: {
              id: editingId,
              input: {
                name: builder.name,
                triggerType: triggerToGql(builder.trigger!),
                triggerLabel: triggerMeta.label,
                actions: gqlActions,
              },
            },
          });
        } else {
          await createMutation({
            variables: {
              input: {
                tenantId: queryTenantId,
                name: builder.name,
                triggerType: triggerToGql(builder.trigger!),
                triggerLabel: triggerMeta.label,
                actions: gqlActions,
                enabled: false,
              },
            },
          });
        }
        await refetchAutomations();
        await refetchRuns();
      } catch {
        return;
      }
    } else if (editingId) {
      setAutomations((prev) =>
        prev.map((a) =>
          a.id === editingId
            ? {
                ...a,
                name: builder.name,
                trigger: { type: builder.trigger!, label: triggerMeta.label },
                actions: actionMetas,
              }
            : a,
        ),
      );
    } else {
      setAutomations((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          name: builder.name,
          enabled: false,
          trigger: { type: builder.trigger!, label: triggerMeta.label },
          actions: actionMetas,
          runCount: 0,
          lastRunAt: null,
          createdAt: 'Just now',
        },
      ]);
    }
    setBuilderOpen(false);
  };

  const addAction = (type: ActionType) => {
    setBuilder((b) => ({ ...b, actions: [...b.actions, type] }));
  };
  const removeAction = (idx: number) => {
    setBuilder((b) => ({ ...b, actions: b.actions.filter((_, i) => i !== idx) }));
  };

  const builderValid = builder.name.trim() && builder.trigger && builder.actions.length > 0;

  const counts = {
    all: automations.length,
    active: automations.filter((a) => a.enabled).length,
    paused: automations.filter((a) => !a.enabled).length,
  };

  return (
    <>
      <Head>
        <title>Automations — {subdomain.charAt(0).toUpperCase() + subdomain.slice(1)}</title>
      </Head>
      <AppLayout
        responsive
        sidebarSections={getDefaultSidebarSections()}
        user={getDefaultUser()}
        logo={getDefaultLogo()}
        onUserAction={() => {}}
        showSearch
        showNotifications
        notificationCount={0}
      >
        <PlanGate feature="automations" currentPlan={tenantPlan} tenant={subdomain}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Header */}
            <div className="lux-automations-header">
              <div>
                <h1 className="ios-large-title" style={{ margin: 0 }}>
                  Automations
                </h1>
                <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--color-label-secondary)' }}>
                  Build trigger-action workflows without writing code.
                </p>
                <a
                  href={`/marketplace?tenant=${encodeURIComponent(subdomain)}`}
                  style={{ fontSize: 13, color: 'var(--color-blue)', marginTop: 6, display: 'inline-block' }}
                >
                  Browse marketplace templates →
                </a>
              </div>
              <button className="ios-btn-primary" onClick={() => openBuilder()}>
                + Create Automation
              </button>
            </div>

            {/* Tabs */}
            <div className="lux-tab-bar">
              {(['all', 'active', 'paused'] as const).map((tab) => (
                <button
                  key={tab}
                  className="lux-tab"
                  aria-selected={activeTab === tab}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  <span className="lux-tab-count badge badge-blue">{counts[tab]}</span>
                </button>
              ))}
            </div>

            {/* Automations grid */}
            {filtered.length === 0 ? (
              <div className="ios-empty-state">
                <div style={{ fontSize: 36, marginBottom: 12 }}>⚡</div>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>No automations here</div>
                <button className="ios-btn-primary" onClick={() => openBuilder()}>
                  Create your first automation
                </button>
              </div>
            ) : (
              <div className="lux-automation-grid">
                {filtered.map((auto) => (
                  <div key={auto.id} className="lux-automation-card">
                    {/* Header row */}
                    <div className="lux-automation-header-row">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                        <span className={`badge ${auto.enabled ? 'badge-green' : ''}`}>
                          {auto.enabled ? 'Active' : 'Paused'}
                        </span>
                        <span
                          className="lux-automation-name"
                          style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        >
                          {auto.name}
                        </span>
                      </div>
                      {/* iOS toggle */}
                      <label style={{ position: 'relative', width: 44, height: 24, flexShrink: 0, cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={auto.enabled}
                          onChange={() => toggleEnabled(auto.id)}
                          style={{ opacity: 0, width: 0, height: 0 }}
                        />
                        <span
                          style={{
                            position: 'absolute',
                            inset: 0,
                            background: auto.enabled ? 'var(--color-green)' : 'var(--color-fill-secondary)',
                            borderRadius: 24,
                            transition: 'background var(--transition-fast)',
                          }}
                        />
                        <span
                          style={{
                            position: 'absolute',
                            top: 3,
                            left: auto.enabled ? 23 : 3,
                            width: 18,
                            height: 18,
                            background: '#fff',
                            borderRadius: '50%',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                            transition: 'left var(--transition-fast)',
                          }}
                        />
                      </label>
                    </div>

                    {/* Trigger → Actions flow */}
                    <div className="lux-automation-flow">
                      <span className="lux-trigger-chip">{auto.trigger.label}</span>
                      {auto.actions.map((action, i) => (
                        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span className="lux-flow-arrow">→</span>
                          <span className="lux-action-chip">{action.label}</span>
                        </span>
                      ))}
                    </div>

                    {/* Meta */}
                    <div className="lux-automation-meta">
                      <span>Ran {auto.runCount.toLocaleString()} times</span>
                      {auto.lastRunAt && <span>Last run: {auto.lastRunAt}</span>}
                      <span>Created {auto.createdAt}</span>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button className="lux-icon-btn" title="Edit" onClick={() => openBuilder(auto.id)}>
                        ✏️
                      </button>
                      <button className="lux-icon-btn" title="Duplicate" onClick={() => duplicateAutomation(auto)}>
                        📋
                      </button>
                      <button className="lux-icon-btn danger" title="Delete" onClick={() => setDeleteId(auto.id)}>
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Run History */}
            <div className="lux-run-history">
              <div
                style={{
                  padding: '20px 24px 16px',
                  fontWeight: 600,
                  fontSize: 16,
                  color: 'var(--color-label-primary)',
                }}
              >
                Recent Runs
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="lux-data-table">
                  <thead>
                    <tr>
                      <th>Automation</th>
                      <th>Triggered At</th>
                      <th>Status</th>
                      <th>Duration</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {runHistory.map((run) => (
                      <tr key={run.id}>
                        <td style={{ fontWeight: 500 }}>{run.automationName}</td>
                        <td style={{ color: 'var(--color-label-secondary)' }}>{run.triggeredAt}</td>
                        <td>
                          <span
                            className={
                              run.status === 'success'
                                ? 'lux-run-success'
                                : run.status === 'error'
                                  ? 'lux-run-error'
                                  : ''
                            }
                          >
                            {run.status === 'success'
                              ? '✓ Success'
                              : run.status === 'error'
                                ? `✗ Error${run.error ? ` — ${run.error}` : ''}`
                                : '⟳ Running'}
                          </span>
                        </td>
                        <td style={{ color: 'var(--color-label-secondary)' }}>{run.durationMs}ms</td>
                        <td>
                          <button className="lux-run-detail-btn">Details</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Step Builder Modal */}
          {builderOpen && (
            <div
              className="lux-step-builder-modal"
              onClick={(e) => {
                if (e.target === e.currentTarget) setBuilderOpen(false);
              }}
            >
              <div className="lux-step-builder-sheet">
                {/* Sheet header */}
                <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--color-separator)' }}>
                  <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--color-label-primary)' }}>
                    {editingId ? 'Edit Automation' : 'Create Automation'}
                  </h2>
                </div>

                <div
                  style={{
                    padding: '20px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 20,
                    overflowY: 'auto',
                    flex: 1,
                  }}
                >
                  {/* Name */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontWeight: 600,
                        fontSize: 14,
                        marginBottom: 8,
                        color: 'var(--color-label-primary)',
                      }}
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      value={builder.name}
                      onChange={(e) => setBuilder((b) => ({ ...b, name: e.target.value }))}
                      placeholder="e.g. Welcome new learners"
                      style={{
                        width: '100%',
                        height: 40,
                        padding: '0 12px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-separator-opaque)',
                        background: 'var(--color-bg-primary)',
                        color: 'var(--color-label-primary)',
                        fontSize: 14,
                        fontFamily: 'inherit',
                      }}
                    />
                  </div>

                  {/* Trigger */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontWeight: 600,
                        fontSize: 14,
                        marginBottom: 10,
                        color: 'var(--color-label-primary)',
                      }}
                    >
                      When this happens… (Trigger)
                    </label>
                    <div className="lux-trigger-selector">
                      {TRIGGERS.map((t) => (
                        <div
                          key={t.type}
                          className="lux-trigger-option"
                          aria-selected={builder.trigger === t.type}
                          role="option"
                          onClick={() => setBuilder((b) => ({ ...b, trigger: t.type }))}
                        >
                          <span style={{ fontSize: 20 }}>{t.emoji}</span>
                          <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-label-primary)' }}>
                            {t.label}
                          </span>
                          <span style={{ fontSize: 12, color: 'var(--color-label-secondary)' }}>{t.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontWeight: 600,
                        fontSize: 14,
                        marginBottom: 10,
                        color: 'var(--color-label-primary)',
                      }}
                    >
                      Do this… (Actions)
                    </label>
                    <div className="lux-action-list">
                      {builder.actions.map((actionType, idx) => {
                        const meta = ACTIONS.find((a) => a.type === actionType)!;
                        return (
                          <div key={idx} className="lux-action-block">
                            <button className="lux-action-remove-btn" onClick={() => removeAction(idx)}>
                              ×
                            </button>
                            <div
                              style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 14 }}
                            >
                              <span
                                style={{
                                  background: 'var(--color-fill-tertiary)',
                                  borderRadius: 'var(--radius-sm)',
                                  padding: '2px 8px',
                                  fontSize: 12,
                                  color: 'var(--color-label-secondary)',
                                }}
                              >
                                Step {idx + 1}
                              </span>
                              <span>
                                {meta.emoji} {meta.label}
                              </span>
                            </div>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                              <input
                                type="text"
                                placeholder={
                                  actionType === 'send_email'
                                    ? 'Recipient email or {{learner.email}}'
                                    : actionType === 'add_to_group'
                                      ? 'Group name or ID'
                                      : 'Value'
                                }
                                style={{
                                  flex: 1,
                                  height: 34,
                                  padding: '0 10px',
                                  borderRadius: 'var(--radius-sm)',
                                  border: '1px solid var(--color-separator)',
                                  background: 'var(--color-bg-secondary)',
                                  color: 'var(--color-label-primary)',
                                  fontSize: 13,
                                  fontFamily: 'inherit',
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                      {/* Add action dropdown */}
                      <select
                        className="lux-action-add-btn"
                        value=""
                        onChange={(e) => {
                          if (e.target.value) addAction(e.target.value as ActionType);
                          e.target.value = '';
                        }}
                        style={{ cursor: 'pointer', textAlign: 'center' }}
                      >
                        <option value="">+ Add Action</option>
                        {ACTIONS.map((a) => (
                          <option key={a.type} value={a.type}>
                            {a.emoji} {a.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="lux-step-builder-footer">
                  <button className="ios-btn-secondary" onClick={() => setBuilderOpen(false)}>
                    Cancel
                  </button>
                  <button
                    className="ios-btn-primary"
                    disabled={!builderValid}
                    onClick={saveAutomation}
                    style={{ opacity: builderValid ? 1 : 0.5 }}
                  >
                    {editingId ? 'Save Changes' : 'Create Automation'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete confirmation */}
          {deleteId && (
            <div className="lux-step-builder-modal" onClick={() => setDeleteId(null)}>
              <div className="lux-step-builder-sheet" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
                <div style={{ padding: '24px' }}>
                  <div style={{ fontSize: 40, textAlign: 'center', marginBottom: 12 }}>🗑️</div>
                  <h3
                    style={{
                      margin: '0 0 8px',
                      fontSize: 18,
                      fontWeight: 700,
                      textAlign: 'center',
                      color: 'var(--color-label-primary)',
                    }}
                  >
                    Delete Automation?
                  </h3>
                  <p
                    style={{
                      margin: '0 0 20px',
                      fontSize: 14,
                      color: 'var(--color-label-secondary)',
                      textAlign: 'center',
                    }}
                  >
                    This will permanently delete the automation and its run history.
                  </p>
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                    <button className="ios-btn-secondary" onClick={() => setDeleteId(null)}>
                      Cancel
                    </button>
                    <button
                      className="ios-btn-primary"
                      style={{ background: 'var(--color-red)' }}
                      onClick={() => deleteAutomation(deleteId)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </PlanGate>
      </AppLayout>
    </>
  );
}

export const getServerSideProps = getTenantPageProps;
