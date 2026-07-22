import { useState } from 'react';

import type { ProjectItem, ProjectIterationScope, ProjectPriority, ProjectStatus } from '../../lib/project-types';
import { PROJECT_COLUMNS, PRIORITY_LABELS } from '../../lib/project-types';
import { useProject } from './ProjectProvider';

interface ProjectItemModalProps {
  item?: ProjectItem;
  iteration?: ProjectIterationScope;
  onClose: () => void;
  onSave?: (data: {
    title: string;
    status: ProjectStatus;
    iteration: ProjectIterationScope;
    priority: ProjectPriority;
    assignee?: string;
    startDate?: string;
    endDate?: string;
    estimate?: number;
    description?: string;
    labels: string[];
  }) => void | Promise<void>;
}

function dateForInput(iso?: string): string {
  if (!iso) return '';
  return iso.slice(0, 10);
}

export function ProjectItemModal({ item, iteration = 'current', onClose, onSave }: ProjectItemModalProps) {
  const { updateItem, deleteItem } = useProject();
  const isNew = !item;

  const [title, setTitle] = useState(item?.title ?? '');
  const [status, setStatus] = useState<ProjectStatus>(item?.status ?? 'BACKLOG');
  const [scope, setScope] = useState<ProjectIterationScope>(item?.iteration ?? iteration);
  const [priority, setPriority] = useState<ProjectPriority>(item?.priority ?? 'P2');
  const [assignee, setAssignee] = useState(item?.assigneeName ?? item?.assignee ?? '');
  const [startDate, setStartDate] = useState(dateForInput(item?.startDate));
  const [endDate, setEndDate] = useState(dateForInput(item?.endDate));
  const [estimate, setEstimate] = useState(item?.estimate?.toString() ?? '');
  const [description, setDescription] = useState(item?.description ?? '');
  const [labelsRaw, setLabelsRaw] = useState(item?.labels.join(', ') ?? '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const labels = labelsRaw
      .split(',')
      .map((l) => l.trim())
      .filter(Boolean);
    const payload = {
      title: title.trim(),
      status,
      iteration: scope,
      priority,
      assignee: assignee.trim() || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      estimate: estimate ? Number(estimate) : undefined,
      description: description.trim() || undefined,
      labels,
    };

    if (isNew && onSave) {
      await onSave(payload);
      return;
    }

    if (item) {
      await updateItem(item.id, payload);
    }
    onClose();
  };

  return (
    <div className="lux-project-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="lux-project-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-item-modal-title"
      >
        <header className="lux-project-modal__header">
          <h2 id="project-item-modal-title">{isNew ? 'Add project item' : 'Edit project item'}</h2>
          <button type="button" className="lux-project-modal__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        <form className="lux-project-modal__form" onSubmit={handleSubmit}>
          <label className="lux-project-field">
            <span>Title</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus />
          </label>

          <div className="lux-project-field-row">
            <label className="lux-project-field">
              <span>Status</span>
              <select value={status} onChange={(e) => setStatus(e.target.value as ProjectStatus)}>
                {PROJECT_COLUMNS.map((col) => (
                  <option key={col.status} value={col.status}>
                    {col.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="lux-project-field">
              <span>Iteration</span>
              <select value={scope} onChange={(e) => setScope(e.target.value as ProjectIterationScope)}>
                <option value="current">Ongoing</option>
                <option value="next">Next</option>
              </select>
            </label>
            <label className="lux-project-field">
              <span>Priority</span>
              <select value={priority} onChange={(e) => setPriority(e.target.value as ProjectPriority)}>
                {(Object.keys(PRIORITY_LABELS) as ProjectPriority[]).map((p) => (
                  <option key={p} value={p}>
                    {p} — {PRIORITY_LABELS[p]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="lux-project-field">
            <span>Assignee</span>
            <input value={assignee} onChange={(e) => setAssignee(e.target.value)} placeholder="Name" />
          </label>

          <div className="lux-project-field-row">
            <label className="lux-project-field">
              <span>Start date</span>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </label>
            <label className="lux-project-field">
              <span>End date</span>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </label>
            <label className="lux-project-field">
              <span>Estimate (days)</span>
              <input type="number" min={0} value={estimate} onChange={(e) => setEstimate(e.target.value)} />
            </label>
          </div>

          <label className="lux-project-field">
            <span>Labels (comma-separated)</span>
            <input value={labelsRaw} onChange={(e) => setLabelsRaw(e.target.value)} placeholder="course, video" />
          </label>

          <label className="lux-project-field">
            <span>Description</span>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </label>

          <footer className="lux-project-modal__footer">
            {!isNew && item && (
              <button
                type="button"
                className="lux-project-modal__delete"
                onClick={() => {
                  void deleteItem(item.id).then(onClose);
                }}
              >
                Delete
              </button>
            )}
            <div className="lux-project-modal__actions">
              <button type="button" className="lux-project-modal__cancel" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="lux-project-modal__save">
                {isNew ? 'Create' : 'Save'}
              </button>
            </div>
          </footer>
        </form>
      </div>
    </div>
  );
}
