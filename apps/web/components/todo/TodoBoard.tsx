import { useState } from 'react';
import type { TodoItem } from '@luxgen/ui';

/** Two-column kanban (To do / Done) for the Todo List's Board view. Mirrors the drag/drop
 * mechanics in apps/web/components/project/IterationBoard.tsx (native HTML5 draggable,
 * onDragOver/onDrop per column) but decoupled from ProjectProvider — takes items + a moveItem
 * callback as props so it has no dependency on the sprint-tracker's context. */

const COLUMNS: { status: 'TODO' | 'DONE'; label: string }[] = [
  { status: 'TODO', label: 'To do' },
  { status: 'DONE', label: 'Done' },
];

interface TodoBoardProps {
  items: TodoItem[];
  onMove: (id: string, status: 'TODO' | 'DONE') => void;
}

export function TodoBoard({ items, onMove }: TodoBoardProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<'TODO' | 'DONE' | null>(null);

  const itemsByStatus = COLUMNS.reduce(
    (acc, col) => {
      acc[col.status] = items.filter((i) => i.status === col.status);
      return acc;
    },
    {} as Record<'TODO' | 'DONE', TodoItem[]>,
  );

  const handleDrop = (status: 'TODO' | 'DONE') => {
    if (draggingId) onMove(draggingId, status);
    setDraggingId(null);
    setDropTarget(null);
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {COLUMNS.map((col) => (
        <section
          key={col.status}
          className="ios-card p-3"
          style={{
            outline: dropTarget === col.status ? '2px solid var(--color-accent)' : 'none',
            minHeight: '12rem',
          }}
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
          <header className="flex items-center justify-between mb-3 px-1">
            <h2 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
              {col.label}
            </h2>
            <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              {itemsByStatus[col.status].length}
            </span>
          </header>
          <div className="space-y-2">
            {itemsByStatus[col.status].map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => setDraggingId(item.id)}
                className="ios-card p-3 text-sm cursor-grab"
                style={{ background: 'var(--color-bg-secondary)' }}
              >
                {item.title}
              </div>
            ))}
            {itemsByStatus[col.status].length === 0 && (
              <p className="text-xs px-1" style={{ color: 'var(--color-text-tertiary)' }}>
                Drop a task here
              </p>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
