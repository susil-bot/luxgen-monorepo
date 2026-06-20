import { useEffect, useRef } from 'react';

import { listFlowCompounds, type FlowNodeKind } from '../../../lib/automation-flow';
import styles from './TowerFlow.module.css';

const ADD_KINDS: Array<{ kind: FlowNodeKind; label: string }> = [
  { kind: 'action', label: 'Action' },
  { kind: 'condition', label: 'Condition' },
  { kind: 'wait', label: 'Wait' },
];

interface AddStepPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (compoundId: string) => void;
  anchorRef: React.RefObject<HTMLElement | null>;
}

export function AddStepPicker({ open, onClose, onSelect, anchorRef }: AddStepPickerProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || anchorRef.current?.contains(target)) return;
      onClose();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose, anchorRef]);

  if (!open) return null;

  return (
    <div ref={panelRef} className={styles.addStepPicker} role="dialog" aria-label="Add workflow step">
      <p className={styles.addStepPickerTitle}>Add step</p>
      {ADD_KINDS.map(({ kind, label }) => {
        const compounds = listFlowCompounds(kind);
        if (compounds.length === 0) return null;

        return (
          <div key={kind} className={styles.addStepPickerGroup}>
            <p className={styles.addStepPickerGroupLabel}>{label}</p>
            <ul className={styles.addStepPickerList}>
              {compounds.map((compound) => (
                <li key={compound.id}>
                  <button
                    type="button"
                    className={styles.addStepPickerOption}
                    onClick={() => {
                      onSelect(compound.id);
                      onClose();
                    }}
                  >
                    <span className={styles.addStepPickerOptionEmoji}>{compound.emoji ?? '•'}</span>
                    <span>
                      <span className={styles.addStepPickerOptionLabel}>{compound.label}</span>
                      <span className={styles.addStepPickerOptionDesc}>{compound.description}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
