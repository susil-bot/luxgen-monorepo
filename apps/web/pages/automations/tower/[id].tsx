import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

import { Toolkit, type ToolkitItem, AppLayout, getDefaultLogo, getDefaultSidebarSections } from '@luxgen/ui';
import {
  FlowConfigFieldInput,
  TowerGraphCanvas,
  TowerStepConnections,
  TowerStepRail,
} from '../../../components/automations/tower';
import styles from '../../../components/automations/tower/TowerFlow.module.css';
import { useTowerFlowPersist } from '../../../hooks/useTowerFlowPersist';
import {
  flowToGraphSteps,
  flowToOrderedSteps,
  getFlowCompound,
  insertFlowNodeAfter,
  listFlowCompounds,
  removeFlowNode,
  type FlowEdgeLabel,
  type FlowNodeKind,
  type FlowStepView,
  type TowerFlowDocument,
} from '../../../lib/automation-flow';
import { getTenantPageProps } from '../../../lib/tenant-page-props';
import { useTenantScope } from '../../../lib/use-tenant-scope';
import { createHandleUserAction } from '../../../lib/user-actions';
import { useAppLayoutHeader } from '../../../lib/app-layout-header';
import { useLayoutUser } from '../../../lib/app-layout-user';
import { canPublishAutomation } from '../../../lib/automation-permissions';

interface ActivityEvent {
  id: string;
  icon: string;
  label: string;
  at: string;
}

/**
 * T-AUTO-11 — Activity timeline, built from Automation's own lifecycle timestamps
 * (create/update/publish/archive). Pause/resume/delete-step/comment/AI-action events
 * from the full TODO spec §20 require a dedicated audit log collection and are
 * deferred — see docs/todo-orchestrator/queue.yaml notes for T-AUTO-11.
 */
function buildActivityTimeline(meta: {
  createdAt: string | null;
  updatedAt: string | null;
  publishedAt: string | null;
  archivedAt: string | null;
}): ActivityEvent[] {
  const events: ActivityEvent[] = [];
  if (meta.createdAt) events.push({ id: 'created', icon: '\ud83d\udc64', label: 'Workflow created', at: meta.createdAt });
  if (meta.publishedAt) events.push({ id: 'published', icon: '\ud83d\ude80', label: 'Published', at: meta.publishedAt });
  if (meta.archivedAt) events.push({ id: 'archived', icon: '\ud83d\udddc\ufe0f', label: 'Archived', at: meta.archivedAt });
  if (meta.updatedAt && meta.updatedAt !== meta.createdAt) {
    events.push({ id: 'updated', icon: '\u270f\ufe0f', label: 'Last updated', at: meta.updatedAt });
  }
  return events.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
}

function formatActivityTimestamp(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function stepTypeLabel(kind: FlowNodeKind) {
  if (kind === 'trigger') return 'Trigger';
  if (kind === 'wait') return 'Wait';
  if (kind === 'condition') return 'Condition';
  return 'Action';
}

function runLiveLabel(saveState: string) {
  if (saveState === 'saving') return { text: 'Saving', live: true };
  return { text: 'Idle', live: false };
}

function saveStatusLabel(
  isNew: boolean,
  persistedId: string | null,
  saveState: string,
  dirty: boolean,
  lifecycleStatus: string,
) {
  if (saveState === 'saving') return 'Saving…';
  if (saveState === 'error') return 'Save failed';
  if (dirty) return 'Unsaved changes';
  if (lifecycleStatus === 'archived') return 'Archived';
  if (lifecycleStatus === 'live') return 'Live';
  if (lifecycleStatus === 'paused') return 'Paused';
  if (isNew && !persistedId) return 'Draft';
  if (saveState === 'saved') return 'Saved';
  return lifecycleStatus === 'draft' ? 'Draft' : 'Saved';
}

function flowSnapshot(flow: TowerFlowDocument): string {
  return JSON.stringify(flow);
}

interface TowerEditRoomProps {
  tenant: string;
}

function TowerEditContent({ tenant }: TowerEditRoomProps) {
  const router = useRouter();
  const { id } = router.query;
  const towerId = typeof id === 'string' ? id : 'new';
  const { queryTenantId } = useTenantScope(tenant);
  const user = useLayoutUser();
  const canPublish = canPublishAutomation(user?.role);

  const {
    flow,
    setFlow,
    loading,
    isNew,
    persistedId,
    save,
    saveState,
    saveError,
    lifecycleStatus,
    lifecycleBusy,
    publish,
    pause,
    archive,
    testRun,
    testBusy,
    testError,
    automationMeta,
    updateNotifySettings,
  } = useTowerFlowPersist({
    towerId,
    tenantId: queryTenantId,
    onCreated: (newId) => {
      void router.replace(`/automations/tower/${newId}`, undefined, { shallow: true });
    },
  });

  const baselineRef = useRef<string | null>(null);
  const [dirty, setDirty] = useState(false);

  const steps = useMemo(() => flowToOrderedSteps(flow), [flow]);
  const graphRoots = useMemo(() => flowToGraphSteps(flow), [flow]);
  const [selectedStepId, setSelectedStepId] = useState<string>(flow.entryNodeId);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(flow.meta.name);

  const selectedStep: FlowStepView | undefined = steps.find((s) => s.id === selectedStepId) ?? steps[0];
  const selectedCompound = selectedStep ? getFlowCompound(selectedStep.compoundId) : undefined;
  const triggerOptions = listFlowCompounds('trigger');

  useEffect(() => {
    if (loading) {
      baselineRef.current = null;
      return;
    }
    if (baselineRef.current === null) {
      baselineRef.current = flowSnapshot(flow);
      setDirty(false);
    }
  }, [loading, flow]);

  useEffect(() => {
    setNameInput(flow.meta.name);
  }, [flow.meta.name]);

  useEffect(() => {
    if (steps.length && !steps.some((s) => s.id === selectedStepId)) {
      setSelectedStepId(steps[0]?.id ?? flow.entryNodeId);
    }
  }, [steps, selectedStepId, flow.entryNodeId]);

  const mutateFlow = useCallback(
    (updater: (prev: TowerFlowDocument) => TowerFlowDocument) => {
      setFlow((prev) => {
        const next = updater(prev);
        const baseline = baselineRef.current;
        setDirty(baseline === null ? true : flowSnapshot(next) !== baseline);
        return next;
      });
    },
    [setFlow],
  );

  const persistFlow = useCallback(
    async (nextFlow: TowerFlowDocument) => {
      const idSaved = await save(nextFlow);
      if (idSaved) {
        baselineRef.current = flowSnapshot(nextFlow);
        setDirty(false);
      }
      return idSaved;
    },
    [save],
  );

  const discardChanges = useCallback(() => {
    if (!baselineRef.current) return;
    const restored = JSON.parse(baselineRef.current) as TowerFlowDocument;
    setFlow(restored);
    setDirty(false);
    setSelectedStepId(restored.entryNodeId);
  }, [setFlow]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT' ||
        target?.isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        void persistFlow(flow);
        return;
      }

      if (e.key === 'Escape') {
        void router.push('/automations/tower');
        return;
      }

      if (!typing && (e.key === 'Delete' || e.key === 'Backspace') && selectedStepId !== flow.entryNodeId) {
        e.preventDefault();
        mutateFlow((prev) => removeFlowNode(prev, selectedStepId));
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [router, persistFlow, flow, mutateFlow, selectedStepId]);

  const commitName = () => {
    const name = nameInput.trim() || flow.meta.name;
    mutateFlow((prev) => ({ ...prev, meta: { ...prev.meta, name } }));
    setEditingName(false);
  };

  const replaceTriggerCompound = (compoundId: string) => {
    const compound = getFlowCompound(compoundId);
    if (!compound || compound.kind !== 'trigger') return;
    mutateFlow((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) =>
        n.id === prev.entryNodeId ? { ...n, compoundId, title: compound.label, config: {} } : n,
      ),
    }));
  };

  const updateNodeConfig = (nodeId: string, key: string, value: unknown) => {
    mutateFlow((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) => (n.id === nodeId ? { ...n, config: { ...n.config, [key]: value } } : n)),
    }));
  };

  const updateFlow = (updater: (prev: TowerFlowDocument) => TowerFlowDocument) => {
    mutateFlow(updater);
  };

  const addStepAfterNode = (afterNodeId: string, compoundId: string, branchLabel?: FlowEdgeLabel) => {
    const compound = getFlowCompound(compoundId);
    if (!compound) return;

    mutateFlow((prev) => {
      const next = insertFlowNodeAfter(prev, afterNodeId, compound.kind, compoundId, branchLabel);
      const newNode = next.nodes.find((node) => !prev.nodes.some((existing) => existing.id === node.id));
      if (newNode) {
        void Promise.resolve().then(() => setSelectedStepId(newNode.id));
      }
      return next;
    });
  };

  const deleteSelectedStep = () => {
    if (!selectedStep || selectedStep.id === flow.entryNodeId) return;
    const removeId = selectedStep.id;
    mutateFlow((prev) => removeFlowNode(prev, removeId));
  };

  const editorToolkitItems = useMemo<ToolkitItem[]>(() => {
    const items: ToolkitItem[] = [
      {
        id: 'save',
        label: saveState === 'saving' ? 'Saving…' : dirty ? 'Save*' : 'Save',
        onClick: () => void persistFlow(flow),
        disabled: saveState === 'saving' || lifecycleStatus === 'archived' || !canPublish,
      },
      {
        id: 'run-logs',
        label: 'View run logs',
        onClick: () => {
          const aid = persistedId ?? (towerId !== 'new' ? towerId : '');
          const qs = new URLSearchParams();
          qs.set('tenant', tenant);
          if (aid) qs.set('automationId', aid);
          void router.push(`/automations/tower/runs?${qs.toString()}`);
        },
      },
      {
        // T-AUTO-08: per-workflow success rate / run volume, computed from the same run history.
        id: 'analytics',
        label: 'Analytics',
        disabled: !persistedId,
        onClick: () => {
          const aid = persistedId ?? (towerId !== 'new' ? towerId : '');
          if (!aid) return;
          void router.push(`/automations/tower/${aid}/analytics?tenant=${encodeURIComponent(tenant)}`);
        },
      },
      {
        id: 'test-run',
        label: testBusy ? 'Testing…' : 'Test run',
        disabled: !persistedId || lifecycleStatus === 'archived' || testBusy || dirty || !canPublish,
        onClick: () => {
          void (async () => {
            const run = await testRun();
            if (run?.id) {
              void router.push(
                `/automations/tower/runs/${run.id}?tenant=${encodeURIComponent(tenant)}`,
              );
            }
          })();
        },
      },
    ];

    if (persistedId && lifecycleStatus !== 'archived') {
      if (lifecycleStatus !== 'live') {
        items.push({
          id: 'publish',
          label: lifecycleBusy ? 'Publishing…' : 'Publish',
          onClick: () => void publish(),
          // T-AUTO-10: Learner role (STUDENT/legacy USER) has no builder access per spec §21.
          disabled: lifecycleBusy || !canPublish,
        });
      }
      if (lifecycleStatus === 'live') {
        items.push({
          id: 'pause',
          label: lifecycleBusy ? 'Pausing…' : 'Pause',
          destructive: true,
          onClick: () => void pause(),
          disabled: lifecycleBusy || !canPublish,
        });
      }
      items.push({
        id: 'archive',
        label: lifecycleBusy ? 'Archiving…' : 'Archive',
        destructive: true,
        onClick: () => void archive(),
        disabled: lifecycleBusy || !canPublish,
      });
    }

    return items;
  }, [
    flow,
    router,
    persistFlow,
    saveState,
    dirty,
    persistedId,
    canPublish,
    towerId,
    tenant,
    lifecycleStatus,
    lifecycleBusy,
    publish,
    pause,
    archive,
    testRun,
    testBusy,
    dirty,
  ]);

  if (loading) {
    return (
      <div className={styles.editorRoot} style={{ alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--color-label-secondary)' }}>Loading tower…</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{flow.meta.name} — Tower</title>
      </Head>

      <div className={styles.editorRoot}>
        <header className={styles.editorTopBar}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={() => void router.push('/automations/tower')}
            title="Back to towers"
            aria-label="Back to towers"
          >
            ←
          </button>

          {editingName ? (
            <input
              autoFocus
              className={styles.editorTitleInput}
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onBlur={commitName}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitName();
                if (e.key === 'Escape') {
                  setNameInput(flow.meta.name);
                  setEditingName(false);
                }
              }}
            />
          ) : (
            <button
              type="button"
              className={styles.editorTitle}
              onClick={() => {
                setNameInput(flow.meta.name);
                setEditingName(true);
              }}
            >
              {flow.meta.name}
            </button>
          )}

          <span className={styles.statusPill}>
            <span className="inline-flex items-center gap-1.5">
              {runLiveLabel(saveState).live && (
                <span
                  className="run-live-indicator w-2 h-2 rounded-full animate-pulse"
                  style={{ background: 'var(--color-green)' }}
                  aria-hidden
                />
              )}
              {saveStatusLabel(isNew, persistedId, saveState, dirty, lifecycleStatus)}
            </span>
          </span>
          <span className={styles.statusPill} style={{ fontFamily: 'monospace', fontSize: 10 }}>
            v{flow.version}
          </span>
          {!canPublish ? (
            <span
              className={styles.statusPill}
              style={{ color: 'var(--color-warning)' }}
              title="Your role doesn't have access to edit or publish workflows. Contact an admin to request access."
            >
              🔒 Read-only
            </span>
          ) : null}

          {saveError ? (
            <span className={styles.statusPill} style={{ color: 'var(--color-red)' }} title={saveError}>
              {saveError}
            </span>
          ) : null}
          {testError ? (
            <span className={styles.statusPill} style={{ color: 'var(--color-red)' }} title={testError}>
              Test: {testError}
            </span>
          ) : null}

          <div style={{ flex: 1 }} />

          <Toolkit ariaLabel="Tower editor actions" size="small" items={editorToolkitItems} />
        </header>

        <div className={styles.editorBody}>
          <TowerStepRail
            steps={steps}
            selectedStepId={selectedStepId}
            entryNodeId={flow.entryNodeId}
            onSelectStep={setSelectedStepId}
            onFlowChange={updateFlow}
          />

          <main className={styles.canvas}>
            <div className={styles.testBar}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-label-primary)' }}>Test tower</span>
              <input
                type="text"
                className={`${styles.configInput} ${styles.testBarInput}`}
                placeholder="Enter test payload…"
              />
              <button type="button" className={styles.toggleOn}>
                Run test
              </button>
            </div>

            <TowerGraphCanvas
              roots={graphRoots}
              selectedStepId={selectedStepId}
              onSelectStep={setSelectedStepId}
              onAddStep={addStepAfterNode}
            />
          </main>

          {selectedStep && selectedCompound ? (
            <aside className={styles.configPanel}>
              <div className={styles.configPanelHead}>{stepTypeLabel(selectedStep.kind)} settings</div>
              <div className={styles.configPanelBody}>
                <div className={styles.configField}>
                  <label className={styles.configLabel}>Compound</label>
                  {selectedStep.kind === 'trigger' ? (
                    <select
                      className={styles.configInput}
                      value={selectedStep.compoundId}
                      onChange={(e) => replaceTriggerCompound(e.target.value)}
                    >
                      {triggerOptions.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input className={styles.configInput} readOnly value={selectedStep.compoundId} />
                  )}
                </div>

                {selectedCompound.configFields.map((field) => (
                  <div key={field.key} className={styles.configField}>
                    <label className={styles.configLabel} htmlFor={`cfg-${field.key}`}>
                      {field.label}
                    </label>
                    <FlowConfigFieldInput
                      field={field}
                      inputId={`cfg-${field.key}`}
                      value={selectedStep.config[field.key]}
                      onChange={(value) => updateNodeConfig(selectedStep.id, field.key, value)}
                    />
                  </div>
                ))}

                <TowerStepConnections
                  flow={flow}
                  selectedStep={selectedStep}
                  onFlowChange={updateFlow}
                  onSelectStep={setSelectedStepId}
                />

                {selectedStep.kind !== 'trigger' ? (
                  <button type="button" className={styles.configDeleteBtn} onClick={deleteSelectedStep}>
                    Delete step
                  </button>
                ) : null}

                <p style={{ fontSize: 12, color: 'var(--color-label-secondary)', lineHeight: 1.5, margin: 0 }}>
                  Persisted as <code>TowerFlowDocument</code> v1 on <code>Automation.flowDefinition</code>. Save
                  (⌘/Ctrl+S) writes via <code>updateAutomation</code>/<code>createAutomation</code>.
                </p>
              </div>
            </aside>
          ) : automationMeta ? (
            <aside className={styles.configPanel}>
              <div className={styles.configPanelHead}>Activity</div>
              <div className={styles.configPanelBody}>
                <div className={styles.configField}>
                  <label className={styles.configLabel}>Notify me by email</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                      <input
                        type="checkbox"
                        checked={automationMeta.notifySettings.onFailure}
                        disabled={!canPublish}
                        onChange={(e) => void updateNotifySettings({ onFailure: e.target.checked })}
                      />
                      On failure
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                      <input
                        type="checkbox"
                        checked={automationMeta.notifySettings.onSuccess}
                        disabled={!canPublish}
                        onChange={(e) => void updateNotifySettings({ onSuccess: e.target.checked })}
                      />
                      On every successful run
                    </label>
                  </div>
                </div>

                <div className={styles.configField}>
                  <label className={styles.configLabel}>Timeline</label>
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {buildActivityTimeline(automationMeta).map((event) => (
                      <li key={event.id} style={{ fontSize: 13, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                        <span aria-hidden>{event.icon}</span>
                        <span>
                          <div>{event.label}</div>
                          <div style={{ fontSize: 11, color: 'var(--color-label-secondary)' }}>
                            {formatActivityTimestamp(event.at)}
                          </div>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <p style={{ fontSize: 12, color: 'var(--color-label-secondary)', lineHeight: 1.5, margin: 0 }}>
                  Select a step to edit its settings. Run and pause/resume history — see{' '}
                  <code>View run logs</code> above.
                </p>
              </div>
            </aside>
          ) : null}
        </div>

        {dirty ? (
          <footer className={styles.editorFooter} role="status">
            <span className={styles.editorFooterHint}>Unsaved changes</span>
            <div className={styles.editorFooterActions}>
              <button type="button" className={styles.secondaryBtn} onClick={discardChanges}>
                Discard
              </button>
              <button
                type="button"
                className={styles.primaryBtn}
                disabled={saveState === 'saving'}
                onClick={() => void persistFlow(flow)}
              >
                {saveState === 'saving' ? 'Saving…' : 'Save'}
              </button>
            </div>
          </footer>
        ) : null}
      </div>
    </>
  );
}

function TowerEditRoomPage(props: TowerEditRoomProps) {
  const router = useRouter();
  const headerProps = useAppLayoutHeader();
  const user = useLayoutUser();

  return (
    <AppLayout
      sidebarSections={getDefaultSidebarSections()}
      user={user ?? undefined}
      logo={getDefaultLogo()}
      onUserAction={createHandleUserAction(router)}
      responsive
      contentMaxWidth={false}
      {...headerProps}
    >
      <TowerEditContent {...props} />
    </AppLayout>
  );
}

export default TowerEditRoomPage;

export const getServerSideProps = getTenantPageProps;
