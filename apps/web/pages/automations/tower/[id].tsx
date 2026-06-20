import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

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
  type FlowEdgeLabel,
  type FlowNodeKind,
  type FlowStepView,
  type TowerFlowDocument,
} from '../../../lib/automation-flow';
import { getTenantPageProps } from '../../../lib/tenant-page-props';
import { useTenantScope } from '../../../lib/use-tenant-scope';

function stepTypeLabel(kind: FlowNodeKind) {
  if (kind === 'trigger') return 'Trigger';
  if (kind === 'wait') return 'Wait';
  if (kind === 'condition') return 'Condition';
  return 'Action';
}

function saveStatusLabel(isNew: boolean, persistedId: string | null, saveState: string) {
  if (saveState === 'saving') return 'Saving…';
  if (saveState === 'error') return 'Save failed';
  if (isNew && !persistedId) return 'Draft';
  if (saveState === 'saved') return 'Saved';
  return 'Saved';
}

interface TowerEditRoomProps {
  tenant: string;
}

function TowerEditContent({ tenant }: TowerEditRoomProps) {
  const router = useRouter();
  const { id } = router.query;
  const towerId = typeof id === 'string' ? id : 'new';
  const { queryTenantId } = useTenantScope(tenant);

  const { flow, setFlow, loading, isNew, persistedId, save, saveState, saveError } = useTowerFlowPersist({
    towerId,
    tenantId: queryTenantId,
    onCreated: (newId) => {
      void router.replace(`/automations/tower/${newId}`, undefined, { shallow: true });
    },
  });

  const steps = useMemo(() => flowToOrderedSteps(flow), [flow]);
  const graphRoots = useMemo(() => flowToGraphSteps(flow), [flow]);
  const [selectedStepId, setSelectedStepId] = useState<string>(flow.entryNodeId);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(flow.meta.name);

  const selectedStep: FlowStepView | undefined = steps.find((s) => s.id === selectedStepId) ?? steps[0];
  const selectedCompound = selectedStep ? getFlowCompound(selectedStep.compoundId) : undefined;
  const triggerOptions = listFlowCompounds('trigger');

  useEffect(() => {
    setNameInput(flow.meta.name);
  }, [flow.meta.name]);

  useEffect(() => {
    if (steps.length && !steps.some((s) => s.id === selectedStepId)) {
      setSelectedStepId(steps[0]?.id ?? flow.entryNodeId);
    }
  }, [steps, selectedStepId, flow.entryNodeId]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') void router.push('/automations/tower');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [router]);

  const commitName = () => {
    const name = nameInput.trim() || flow.meta.name;
    setFlow((prev) => ({ ...prev, meta: { ...prev.meta, name } }));
    setEditingName(false);
  };

  const replaceTriggerCompound = (compoundId: string) => {
    const compound = getFlowCompound(compoundId);
    if (!compound || compound.kind !== 'trigger') return;
    setFlow((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) =>
        n.id === prev.entryNodeId ? { ...n, compoundId, title: compound.label, config: {} } : n,
      ),
    }));
  };

  const updateNodeConfig = (nodeId: string, key: string, value: unknown) => {
    setFlow((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) => (n.id === nodeId ? { ...n, config: { ...n.config, [key]: value } } : n)),
    }));
  };

  const handleSave = async () => {
    await save(flow);
  };

  const updateFlow = (updater: (prev: TowerFlowDocument) => TowerFlowDocument) => {
    setFlow(updater);
  };

  const addStepAfterNode = (afterNodeId: string, compoundId: string, branchLabel?: FlowEdgeLabel) => {
    const compound = getFlowCompound(compoundId);
    if (!compound) return;

    setFlow((prev) => {
      const next = insertFlowNodeAfter(prev, afterNodeId, compound.kind, compoundId, branchLabel);
      const newNode = next.nodes.find((node) => !prev.nodes.some((existing) => existing.id === node.id));
      if (newNode) {
        void Promise.resolve().then(() => setSelectedStepId(newNode.id));
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div className={styles.editorRoot} style={{ alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#616161' }}>Loading tower…</p>
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

          <span className={styles.statusPill}>{saveStatusLabel(isNew, persistedId, saveState)}</span>
          <span className={styles.statusPill} style={{ fontFamily: 'monospace', fontSize: 10 }}>
            v{flow.version}
          </span>

          {saveError ? (
            <span className={styles.statusPill} style={{ color: '#d72c0d' }} title={saveError}>
              {saveError}
            </span>
          ) : null}

          <div style={{ flex: 1 }} />

          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={() => void handleSave()}
            disabled={saveState === 'saving'}
          >
            {saveState === 'saving' ? 'Saving…' : 'Save'}
          </button>

          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={() => void router.push('/automations/tower/runs')}
          >
            View run logs
          </button>

          <button
            type="button"
            className={flow.meta.enabled ? styles.toggleOff : styles.toggleOn}
            onClick={() => setFlow((prev) => ({ ...prev, meta: { ...prev.meta, enabled: !prev.meta.enabled } }))}
          >
            {flow.meta.enabled ? 'Turn off' : 'Turn on'}
          </button>
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
              <span style={{ fontSize: 13, fontWeight: 600, color: '#202223' }}>Test tower</span>
              <input
                type="text"
                className={styles.configInput}
                placeholder="Enter test payload…"
                style={{ width: 220 }}
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

                <p style={{ fontSize: 12, color: '#616161', lineHeight: 1.5, margin: 0 }}>
                  Persisted as <code>TowerFlowDocument</code> v1 on <code>Automation.flowDefinition</code>.
                </p>
              </div>
            </aside>
          ) : null}
        </div>
      </div>
    </>
  );
}

export default function TowerEditRoom(props: TowerEditRoomProps) {
  return <TowerEditContent {...props} />;
}

export const getServerSideProps = getTenantPageProps;
