import { useState } from 'react';

import {
  getFlowCompound,
  insertFlowStepAfter,
  listFlowCompounds,
  moveFlowNode,
  removeFlowStep,
  type FlowNodeKind,
  type FlowStepView,
  type TowerFlowDocument,
} from '../../../lib/automation-flow';
import styles from './TowerFlow.module.css';

function stepIcon(kind: FlowNodeKind, emoji?: string) {
  return emoji ?? (kind === 'trigger' ? '⚡' : kind === 'wait' ? '🕐' : kind === 'condition' ? '◆' : '{/}');
}

function stepIconClass(kind: FlowNodeKind) {
  if (kind === 'trigger') return styles.stepIconTrigger;
  if (kind === 'wait') return styles.stepIconWait;
  if (kind === 'condition') return styles.stepIconCondition;
  return styles.stepIconAction;
}

function stepTypeLabel(kind: FlowNodeKind) {
  if (kind === 'trigger') return 'Trigger';
  if (kind === 'wait') return 'Wait';
  if (kind === 'condition') return 'Condition';
  return 'Action';
}

function moveStepBeforeTarget(
  flow: TowerFlowDocument,
  draggedId: string,
  targetId: string,
  steps: FlowStepView[],
): TowerFlowDocument {
  if (draggedId === targetId) return flow;

  const targetIndex = steps.findIndex((step) => step.id === targetId);
  const fromIndex = steps.findIndex((step) => step.id === draggedId);
  if (targetIndex <= 0 || fromIndex <= 0) return flow;

  const afterNodeId = steps[targetIndex - 1]!.id;
  return moveFlowNode(flow, draggedId, afterNodeId);
}

function moveStepToEnd(flow: TowerFlowDocument, draggedId: string, steps: FlowStepView[]): TowerFlowDocument {
  const fromIndex = steps.findIndex((step) => step.id === draggedId);
  if (fromIndex <= 0 || fromIndex >= steps.length - 1) return flow;

  const lastId = steps[steps.length - 1]!.id;
  return moveFlowNode(flow, draggedId, lastId);
}

interface TowerStepRailProps {
  steps: FlowStepView[];
  selectedStepId: string;
  entryNodeId: string;
  onSelectStep: (stepId: string) => void;
  onFlowChange: (updater: (flow: TowerFlowDocument) => TowerFlowDocument) => void;
}

export function TowerStepRail({ steps, selectedStepId, entryNodeId, onSelectStep, onFlowChange }: TowerStepRailProps) {
  const [draggedStepId, setDraggedStepId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | 'end' | null>(null);

  const addStepOptions = [
    ...listFlowCompounds('action'),
    ...listFlowCompounds('wait'),
    ...listFlowCompounds('condition'),
  ];

  const selectedStep = steps.find((step) => step.id === selectedStepId);

  const clearDragState = () => {
    setDraggedStepId(null);
    setDropTargetId(null);
  };

  const handleDropOnStep = (targetId: string) => {
    if (!draggedStepId) return;
    onFlowChange((flow) => moveStepBeforeTarget(flow, draggedStepId, targetId, steps));
    clearDragState();
  };

  const handleDropAtEnd = () => {
    if (!draggedStepId) return;
    onFlowChange((flow) => moveStepToEnd(flow, draggedStepId, steps));
    clearDragState();
  };

  const addStepAfterSelected = (compoundId: string) => {
    const compound = getFlowCompound(compoundId);
    if (!compound || !selectedStep) return;
    onFlowChange((flow) => insertFlowStepAfter(flow, selectedStep.id, compound.kind, compoundId));
  };

  const removeSelectedStep = () => {
    if (!selectedStep || selectedStep.id === entryNodeId) return;
    onFlowChange((flow) => removeFlowStep(flow, selectedStep.id));
  };

  const moveSelectedStep = (direction: 'up' | 'down') => {
    if (!selectedStep || selectedStep.id === entryNodeId) return;
    const index = steps.findIndex((step) => step.id === selectedStep.id);
    if (index <= 0) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex <= 0 || targetIndex >= steps.length) return;

    const targetId = steps[targetIndex]!.id;
    onFlowChange((flow) => moveStepBeforeTarget(flow, selectedStep.id, targetId, steps));
  };

  return (
    <aside className={styles.stepRail}>
      <div className={styles.stepRailHead}>Workflow steps</div>
      <p className={styles.stepRailHint}>Drag steps to reorder</p>

      {steps.map((step, index) => {
        const isDropTarget = dropTargetId === step.id;
        const isDragging = draggedStepId === step.id;

        return (
          <div
            key={step.id}
            className={`${styles.stepItemWrap} ${isDropTarget ? styles.stepItemWrapDropTarget : ''}`}
            onDragOver={(event) => {
              if (!draggedStepId || draggedStepId === step.id || step.kind === 'trigger') return;
              event.preventDefault();
              event.dataTransfer.dropEffect = 'move';
              setDropTargetId(step.id);
            }}
            onDragLeave={() => {
              if (dropTargetId === step.id) setDropTargetId(null);
            }}
            onDrop={(event) => {
              event.preventDefault();
              if (step.kind === 'trigger') return;
              handleDropOnStep(step.id);
            }}
          >
            <div className={styles.stepItemRow}>
              {step.kind !== 'trigger' ? (
                <button
                  type="button"
                  className={styles.stepDragHandle}
                  draggable
                  aria-label={`Drag to reorder ${step.title}`}
                  onDragStart={(event) => {
                    setDraggedStepId(step.id);
                    event.dataTransfer.effectAllowed = 'move';
                    event.dataTransfer.setData('text/plain', step.id);
                  }}
                  onDragEnd={clearDragState}
                  onClick={(event) => event.stopPropagation()}
                >
                  ⠿
                </button>
              ) : (
                <span className={styles.stepDragHandleSpacer} aria-hidden />
              )}

              <button
                type="button"
                className={`${styles.stepItem} ${selectedStepId === step.id ? styles.stepItemActive : ''} ${isDragging ? styles.stepItemDragging : ''}`}
                onClick={() => onSelectStep(step.id)}
              >
                <span className={`${styles.stepIcon} ${stepIconClass(step.kind)}`}>
                  {stepIcon(step.kind, step.emoji)}
                </span>
                <span>
                  <p className={styles.stepLabel}>
                    {index + 1}. {stepTypeLabel(step.kind)}
                  </p>
                  <p className={styles.stepMeta}>{step.title}</p>
                  <p className={styles.stepMeta} style={{ fontSize: 11, opacity: 0.75 }}>
                    {step.compoundId}
                  </p>
                </span>
              </button>
            </div>

            {selectedStepId === step.id && step.kind !== 'trigger' ? (
              <div className={styles.stepItemActions}>
                <button type="button" className={styles.stepActionBtn} onClick={() => moveSelectedStep('up')}>
                  ↑
                </button>
                <button type="button" className={styles.stepActionBtn} onClick={() => moveSelectedStep('down')}>
                  ↓
                </button>
                <button type="button" className={styles.stepActionBtnDanger} onClick={removeSelectedStep}>
                  Remove
                </button>
              </div>
            ) : null}
          </div>
        );
      })}

      {draggedStepId ? (
        <div
          className={`${styles.stepDropZoneEnd} ${dropTargetId === 'end' ? styles.stepDropZoneEndActive : ''}`}
          onDragOver={(event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'move';
            setDropTargetId('end');
          }}
          onDragLeave={() => {
            if (dropTargetId === 'end') setDropTargetId(null);
          }}
          onDrop={(event) => {
            event.preventDefault();
            handleDropAtEnd();
          }}
        >
          Drop here to move to end
        </div>
      ) : null}

      <div className={styles.stepRailFoot}>
        <label className={styles.configLabel} htmlFor="add-step-compound">
          Add step after selected
        </label>
        <select
          id="add-step-compound"
          className={styles.configInput}
          defaultValue=""
          onChange={(e) => {
            if (e.target.value) {
              addStepAfterSelected(e.target.value);
              e.target.value = '';
            }
          }}
        >
          <option value="">Choose step type…</option>
          {addStepOptions.map((compound) => (
            <option key={compound.id} value={compound.id}>
              {compound.label} ({compound.kind})
            </option>
          ))}
        </select>
      </div>
    </aside>
  );
}
