import { useRef, useState } from 'react';

import type { FlowEdgeLabel } from '../../../../lib/automation-flow';
import { AddStepPicker } from '../AddStepPicker';
import styles from './styles';

interface FlowConnectorProps {
  afterNodeId: string;
  branchLabel?: FlowEdgeLabel;
  branchHint?: string;
  onAdd: (afterNodeId: string, compoundId: string, branchLabel?: FlowEdgeLabel) => void;
}

export function FlowConnector({ afterNodeId, branchLabel, branchHint, onAdd }: FlowConnectorProps) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const ariaLabel = branchHint ? `Add step on ${branchHint} branch after this step` : 'Add step after this step';

  return (
    <div className={styles.flowConnectorWrap}>
      {branchHint ? <span className={styles.flowConnectorBranchHint}>{branchHint}</span> : null}
      <div className={styles.flowConnectorLine} aria-hidden />
      <button
        ref={buttonRef}
        type="button"
        className={styles.flowConnectorBtn}
        aria-label={ariaLabel}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        +
      </button>
      <AddStepPicker
        open={open}
        anchorRef={buttonRef}
        onClose={() => setOpen(false)}
        onSelect={(compoundId) => onAdd(afterNodeId, compoundId, branchLabel)}
      />
    </div>
  );
}
