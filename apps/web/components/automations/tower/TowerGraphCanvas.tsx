import type { FlowEdgeLabel, FlowGraphStepView, FlowNodeKind } from '../../../lib/automation-flow';
import { FlowConnector } from './FlowConnector';
import styles from './TowerFlow.module.css';

function stepIcon(kind: FlowNodeKind, emoji?: string) {
  return emoji ?? (kind === 'trigger' ? '⚡' : kind === 'wait' ? '🕐' : kind === 'condition' ? '◆' : '{/}');
}

function stepTypeLabel(kind: FlowNodeKind) {
  if (kind === 'trigger') return 'Trigger';
  if (kind === 'wait') return 'Wait';
  if (kind === 'condition') return 'Condition';
  return 'Action';
}

interface TowerGraphCanvasProps {
  roots: FlowGraphStepView[];
  selectedStepId: string;
  onSelectStep: (stepId: string) => void;
  onAddStep: (afterNodeId: string, compoundId: string, branchLabel?: FlowEdgeLabel) => void;
}

function TowerGraphStep({
  step,
  selectedStepId,
  onSelectStep,
  onAddStep,
}: {
  step: FlowGraphStepView;
  selectedStepId: string;
  onSelectStep: (stepId: string) => void;
  onAddStep: TowerGraphCanvasProps['onAddStep'];
}) {
  const isSelected = selectedStepId === step.id;

  return (
    <div className={styles.flowStepColumn}>
      <div
        role="button"
        tabIndex={0}
        className={`${styles.flowNode} ${isSelected ? styles.flowNodeSelected : ''}`}
        onClick={() => onSelectStep(step.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') onSelectStep(step.id);
        }}
      >
        {step.kind === 'trigger' ? (
          <>
            <div className={styles.flowNodeTriggerHead}>
              <span>{stepIcon(step.kind, step.emoji)}</span>
              {stepTypeLabel(step.kind)}
            </div>
            <div className={styles.flowNodeBody}>
              <h3 className={styles.flowNodeTitle}>{step.title}</h3>
              <p className={styles.flowNodeDesc}>{step.description}</p>
            </div>
          </>
        ) : (
          <div className={styles.flowNodeBody}>
            <p className={styles.flowNodeKindLabel}>{stepTypeLabel(step.kind)}</p>
            <h3 className={styles.flowNodeTitle}>{step.title}</h3>
            <p className={styles.flowNodeDesc}>{step.description}</p>
          </div>
        )}
      </div>

      {step.kind === 'condition' ? (
        <div className={styles.branchRow}>
          {(['true', 'false'] as const).map((label) => {
            const branch = step.branches?.find((item) => item.label === label);
            return (
              <div key={label} className={styles.branchColumn}>
                <FlowConnector
                  afterNodeId={step.id}
                  branchLabel={label}
                  branchHint={label === 'true' ? 'Yes' : 'No'}
                  onAdd={onAddStep}
                />
                {branch?.steps.map((branchStep) => (
                  <TowerGraphStep
                    key={branchStep.id}
                    step={branchStep}
                    selectedStepId={selectedStepId}
                    onSelectStep={onSelectStep}
                    onAddStep={onAddStep}
                  />
                ))}
              </div>
            );
          })}
        </div>
      ) : (
        <>
          <FlowConnector afterNodeId={step.id} onAdd={onAddStep} />
          {step.next ? (
            <TowerGraphStep
              step={step.next}
              selectedStepId={selectedStepId}
              onSelectStep={onSelectStep}
              onAddStep={onAddStep}
            />
          ) : null}
        </>
      )}
    </div>
  );
}

export function TowerGraphCanvas({ roots, selectedStepId, onSelectStep, onAddStep }: TowerGraphCanvasProps) {
  return (
    <div className={styles.flowColumn}>
      {roots.map((step) => (
        <TowerGraphStep
          key={step.id}
          step={step}
          selectedStepId={selectedStepId}
          onSelectStep={onSelectStep}
          onAddStep={onAddStep}
        />
      ))}
    </div>
  );
}
