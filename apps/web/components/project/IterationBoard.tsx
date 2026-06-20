import { useState } from 'react';

import type { ProjectItem, ProjectIterationScope, ProjectPriority, ProjectStatus } from '../../lib/project-types';
import { PROJECT_COLUMNS } from '../../lib/project-types';
import { useProject } from './ProjectProvider';
import { ProjectCard } from './ProjectCard';
import { ProjectItemModal } from './ProjectItemModal';

interface IterationBoardProps {
  iteration: ProjectIterationScope;
}

export function IterationBoard({ iteration }: IterationBoardProps) {
  const { itemsForIteration, moveItem } = useProject();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<ProjectStatus | null>(null);
  const [editingItem, setEditingItem] = useState<ProjectItem | null>(null);

  const boardItems = itemsForIteration(iteration);

  const itemsByStatus = PROJECT_COLUMNS.reduce(
    (acc, col) => {
      acc[col.status] = boardItems.filter((item) => item.status === col.status);
      return acc;
    },
    {} as Record<ProjectStatus, ProjectItem[]>,
  );

  const handleDrop = (status: ProjectStatus) => {
    if (draggingId) {
      moveItem(draggingId, status);
    }
    setDraggingId(null);
    setDropTarget(null);
  };

  return (
    <>
      <div className="lux-project-kanban">
        {PROJECT_COLUMNS.map((col) => (
          <section
            key={col.status}
            className={`lux-project-column${dropTarget === col.status ? ' lux-project-column--drop' : ''}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDropTarget(col.status);
            }}
            onDragLeave={() => setDropTarget(null)}
            onDrop={(e) => {
              e.preventDefault();
              handleDrop(col.status);
            }}
          >
            <header className="lux-project-column__header">
              <span className={`lux-project-dot ${col.dotClass}`} aria-hidden />
              <h2 className="lux-project-column__title">{col.label}</h2>
              <span className="lux-project-column__count">{itemsByStatus[col.status].length}</span>
            </header>
            <p className="lux-project-column__hint">{col.hint}</p>
            <div className="lux-project-column__cards">
              {itemsByStatus[col.status].map((item) => (
                <ProjectCard
                  key={item.id}
                  item={item}
                  draggable
                  onDragStart={() => setDraggingId(item.id)}
                  onClick={() => setEditingItem(item)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      {editingItem && <ProjectItemModal item={editingItem} onClose={() => setEditingItem(null)} />}
    </>
  );
}

export function NewItemModal({ iteration, onClose }: { iteration: ProjectIterationScope; onClose: () => void }) {
  const { addItem } = useProject();

  return (
    <ProjectItemModal
      iteration={iteration}
      onClose={onClose}
      onSave={async (data) => {
        await addItem({
          title: data.title,
          status: data.status,
          iteration: data.iteration,
          priority: data.priority as ProjectPriority,
          assignee: data.assignee,
          startDate: data.startDate,
          endDate: data.endDate,
          estimate: data.estimate,
          description: data.description,
          labels: data.labels,
        });
        onClose();
      }}
    />
  );
}
