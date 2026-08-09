import { useState } from 'react';
import { isTodoDone, isTodoOpen, type TodoItem } from '@luxgen/ui';

/** Two-column kanban (Open / Done) for Board view — buckets all open vs done statuses. */

type BoardBucket = 'OPEN' | 'DONE';

const COLUMNS: { status: BoardBucket; label: string }[] = [
  { status: 'OPEN', label: 'To do' },
  { status: 'DONE', label: 'Done' },
];

interface TodoBoardProps {
  items: TodoItem[];
  onMove: (id: string, status: 'OPEN' | 'COMPLETED') => void;
  onOpen?: (id: string) => void;
}

export function TodoBoard({ items, onMove, onOpen }: TodoBoardProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<BoardBucket | null>(null);

  const itemsByStatus = COLUMNS.reduce(
    (acc, col) => {
      acc[col.status] = items.filter((i) => (col.status === 'OPEN' ? isTodoOpen(i) : isTodoDone(i)));
      return acc;
    },
    {} as Record<BoardBucket, TodoItem[]>,
  );

  const handleDrop = (bucket: BoardBucket) => {
    if (draggingId) onMove(draggingId, bucket === 'OPEN' ? 'OPEN' : 'COMPLETED');
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
                onClick={() => onOpen?.(item.id)}
                className="ios-card p-3 text-sm cursor-grab"
                style={{ background: 'var(--color-bg-secondary)' }}
              >
                <div>{item.title}</div>
                {item.priority && item.priority !== 'MEDIUM' ? (
                  <div className="text-xs mt-1" style={{ color: 'var(--color-label-secondary)' }}>
                    {item.priority}
                  </div>
                ) : null}
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
