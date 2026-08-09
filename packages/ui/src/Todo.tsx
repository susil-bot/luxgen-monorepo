import React, { useState } from 'react';
import { Checkbox } from './Checkbox';
import { Card } from './Card';

/** Shared shape — matches the Task GraphQL type (apps/api/src/schema/todo/typeDefs.ts) closely
 * enough for display purposes without importing GraphQL codegen types into packages/ui. */
export interface TodoItem {
  id: string;
  title: string;
  notes?: string | null;
  status: 'TODO' | 'DONE';
  dueDate?: string | null;
}

// ---------------------------------------------------------------------------
// TodoRow — composes the existing Checkbox component (inheritance-by-composition,
// per docs/todo-orchestrator conventions of extending, not duplicating, primitives).
// ---------------------------------------------------------------------------
export interface TodoRowProps {
  item: TodoItem;
  onToggle: (id: string) => void;
  onDelete?: (id: string) => void;
  draggable?: boolean;
  onDragStart?: () => void;
}

export const TodoRow: React.FC<TodoRowProps> = ({ item, onToggle, onDelete, draggable, onDragStart }) => {
  return (
    <div
      className="todo-row"
      draggable={draggable}
      onDragStart={onDragStart}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.625rem 0.25rem',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <Checkbox checked={item.status === 'DONE'} onChange={() => onToggle(item.id)} />
      <span
        style={{
          flex: 1,
          textDecoration: item.status === 'DONE' ? 'line-through' : 'none',
          color: item.status === 'DONE' ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)',
        }}
      >
        {item.title}
      </span>
      {item.dueDate && (
        <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          {new Date(item.dueDate).toLocaleDateString()}
        </span>
      )}
      {onDelete && (
        <button
          type="button"
          onClick={() => onDelete(item.id)}
          aria-label={`Delete ${item.title}`}
          style={{ color: 'var(--color-text-tertiary)', fontSize: '0.875rem' }}
        >
          ✕
        </button>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// TodoList — checklist + quick-add row. "Check the box to mark items as done" copy
// and the "+ New task" affordance mirror the reference screenshot directly.
// ---------------------------------------------------------------------------
export interface TodoListProps {
  items: TodoItem[];
  onToggle: (id: string) => void;
  onDelete?: (id: string) => void;
  onCreate: (title: string) => void;
  emptyHint?: string;
  reorderable?: boolean;
  onReorder?: (orderedIds: string[]) => void;
}

export const TodoList: React.FC<TodoListProps> = ({
  items,
  onToggle,
  onDelete,
  onCreate,
  emptyHint = 'Check the box to mark items as done',
  reorderable = false,
  onReorder,
}) => {
  const [draft, setDraft] = useState('');
  const [dragId, setDragId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const title = draft.trim();
    if (!title) return;
    onCreate(title);
    setDraft('');
  };

  const handleDrop = (targetId: string) => {
    if (!reorderable || !onReorder || !dragId || dragId === targetId) {
      setDragId(null);
      return;
    }
    const ids = items.map((i) => i.id);
    const from = ids.indexOf(dragId);
    const to = ids.indexOf(targetId);
    if (from === -1 || to === -1) {
      setDragId(null);
      return;
    }
    ids.splice(to, 0, ids.splice(from, 1)[0]);
    onReorder(ids);
    setDragId(null);
  };

  return (
    <div className="todo-list">
      {items.length === 0 && (
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)', padding: '0.5rem 0.25rem' }}>
          {emptyHint}
        </p>
      )}
      {items.map((item) => (
        <div key={item.id} onDragOver={(e) => reorderable && e.preventDefault()} onDrop={() => handleDrop(item.id)}>
          <TodoRow
            item={item}
            onToggle={onToggle}
            onDelete={onDelete}
            draggable={reorderable}
            onDragStart={() => setDragId(item.id)}
          />
        </div>
      ))}
      <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 0.25rem' }}>
        <span style={{ color: 'var(--color-text-tertiary)' }}>+</span>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="New task"
          aria-label="New task"
          style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', color: 'var(--color-text-primary)' }}
        />
      </form>
    </div>
  );
};

// ---------------------------------------------------------------------------
// TodoCard — Gallery view, composes the existing Card component.
// ---------------------------------------------------------------------------
export interface TodoCardProps {
  item: TodoItem;
  onToggle: (id: string) => void;
}

export const TodoCard: React.FC<TodoCardProps> = ({ item, onToggle }) => {
  return (
    <Card variant="outlined" padding="medium">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
        <p style={{ fontWeight: 600, textDecoration: item.status === 'DONE' ? 'line-through' : 'none' }}>
          {item.title}
        </p>
        <span
          className="text-xs"
          style={{
            padding: '0.125rem 0.5rem',
            borderRadius: '9999px',
            background: item.status === 'DONE' ? 'var(--color-green-fill, #16a34a22)' : 'var(--color-fill-tertiary)',
            color: item.status === 'DONE' ? 'var(--color-green, #16a34a)' : 'var(--color-text-secondary)',
          }}
        >
          {item.status === 'DONE' ? 'Done' : 'To do'}
        </span>
      </div>
      {item.notes && (
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
          {item.notes}
        </p>
      )}
      <button
        type="button"
        onClick={() => onToggle(item.id)}
        className="text-sm"
        style={{ marginTop: '0.75rem', color: 'var(--color-accent)' }}
      >
        {item.status === 'DONE' ? 'Mark as to do' : 'Mark as done'}
      </button>
    </Card>
  );
};

// ---------------------------------------------------------------------------
// TodoStatsChart — hand-rolled SVG bar chart (no charting library dependency exists
// in this repo yet — packages/ui/src/EngagementTrends follows the same raw-SVG convention).
// ---------------------------------------------------------------------------
export interface TodoStatsChartProps {
  doneCount: number;
  todoCount: number;
}

export const TodoStatsChart: React.FC<TodoStatsChartProps> = ({ doneCount, todoCount }) => {
  const max = Math.max(doneCount, todoCount, 1);
  const barWidth = 64;
  const gap = 48;
  const chartHeight = 160;
  const bars = [
    { label: 'To do', value: todoCount, color: 'var(--color-fill-tertiary)', textColor: 'var(--color-text-primary)' },
    { label: 'Done', value: doneCount, color: 'var(--color-accent, #0A84FF)', textColor: 'var(--color-accent, #0A84FF)' },
  ];

  return (
    <svg width={barWidth * 2 + gap} height={chartHeight + 40} role="img" aria-label="Task completion chart">
      {bars.map((bar, i) => {
        const h = (bar.value / max) * chartHeight;
        const x = i * (barWidth + gap);
        return (
          <g key={bar.label}>
            <rect x={x} y={chartHeight - h} width={barWidth} height={h} rx={6} fill={bar.color} />
            <text x={x + barWidth / 2} y={chartHeight - h - 8} textAnchor="middle" fontSize="14" fontWeight={600} fill={bar.textColor}>
              {bar.value}
            </text>
            <text x={x + barWidth / 2} y={chartHeight + 20} textAnchor="middle" fontSize="12" fill="var(--color-text-secondary)">
              {bar.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
