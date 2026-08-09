import React, { useState } from 'react';
import { Checkbox } from './Checkbox';
import { Card } from './Card';
import { Input } from './Input';
import { TextArea } from './TextArea';
import { Button } from './Button';

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

// ---------------------------------------------------------------------------
// Shared due-date bucketing — used by TodoTimeline (read view) and
// TodoContentPlanner (kanban-by-week, drag between buckets to reschedule).
// ---------------------------------------------------------------------------
export type DueBucket = 'overdue' | 'today' | 'tomorrow' | 'this-week' | 'next-week' | 'later' | 'none';

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function daysBetween(from: Date, to: Date): number {
  return Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / 86400000);
}

export function bucketForDueDate(dueDate: string | null | undefined, today: Date = new Date()): DueBucket {
  if (!dueDate) return 'none';
  const diff = daysBetween(today, new Date(dueDate));
  if (diff < 0) return 'overdue';
  if (diff === 0) return 'today';
  if (diff === 1) return 'tomorrow';
  if (diff <= 7) return 'this-week';
  if (diff <= 14) return 'next-week';
  return 'later';
}

const BUCKET_LABELS: Record<DueBucket, string> = {
  overdue: 'Overdue',
  today: 'Today',
  tomorrow: 'Tomorrow',
  'this-week': 'This week',
  'next-week': 'Next week',
  later: 'Later',
  none: 'No due date',
};

// ---------------------------------------------------------------------------
// TodoTimeline — read-oriented view, groups tasks along a date axis. No drag;
// TodoContentPlanner (below) covers the interactive/reschedule case.
// ---------------------------------------------------------------------------
export interface TodoTimelineProps {
  items: TodoItem[];
  onToggle: (id: string) => void;
}

export const TodoTimeline: React.FC<TodoTimelineProps> = ({ items, onToggle }) => {
  const order: DueBucket[] = ['overdue', 'today', 'tomorrow', 'this-week', 'next-week', 'later', 'none'];
  const grouped = order
    .map((bucket) => ({ bucket, tasks: items.filter((i) => bucketForDueDate(i.dueDate, new Date()) === bucket) }))
    .filter((g) => g.tasks.length > 0);

  if (grouped.length === 0) {
    return (
      <p className="text-sm" style={{ color: 'var(--color-text-secondary)', padding: '0.5rem 0.25rem' }}>
        No tasks yet.
      </p>
    );
  }

  return (
    <div className="todo-timeline">
      {grouped.map(({ bucket, tasks }) => (
        <div key={bucket} style={{ marginBottom: '1.25rem' }}>
          <h3
            className="text-xs font-semibold uppercase tracking-wide"
            style={{
              color: bucket === 'overdue' ? 'var(--color-red, #dc2626)' : 'var(--color-text-secondary)',
              marginBottom: '0.5rem',
            }}
          >
            {BUCKET_LABELS[bucket]}
          </h3>
          <div style={{ borderLeft: '2px solid var(--color-border)', paddingLeft: '1rem' }}>
            {tasks.map((item) => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.375rem 0' }}>
                <Checkbox checked={item.status === 'DONE'} onChange={() => onToggle(item.id)} />
                <span
                  style={{
                    textDecoration: item.status === 'DONE' ? 'line-through' : 'none',
                    color: item.status === 'DONE' ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)',
                  }}
                >
                  {item.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// ---------------------------------------------------------------------------
// TodoCalendarView — month grid, tasks shown on their due-date cell. Click a
// task chip to toggle done. Navigation only moves the visible month; it does
// not change data (no drag-to-reschedule here — see TodoContentPlanner).
// ---------------------------------------------------------------------------
export interface TodoCalendarViewProps {
  items: TodoItem[];
  onToggle: (id: string) => void;
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const TodoCalendarView: React.FC<TodoCalendarViewProps> = ({ items, onToggle }) => {
  const [viewDate, setViewDate] = useState(() => startOfDay(new Date()));
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstOfMonth = new Date(year, month, 1);
  const firstWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = startOfDay(new Date());

  const cells: (Date | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const tasksByDay = new Map<string, TodoItem[]>();
  items.forEach((item) => {
    if (!item.dueDate) return;
    const key = startOfDay(new Date(item.dueDate)).toDateString();
    const list = tasksByDay.get(key) ?? [];
    list.push(item);
    tasksByDay.set(key, list);
  });

  return (
    <div className="todo-calendar">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          className="text-sm"
          style={{ color: 'var(--color-accent)' }}
          onClick={() => setViewDate(startOfDay(new Date(year, month - 1, 1)))}
        >
          ← Prev
        </button>
        <span className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
          {viewDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
        </span>
        <button
          type="button"
          className="text-sm"
          style={{ color: 'var(--color-accent)' }}
          onClick={() => setViewDate(startOfDay(new Date(year, month + 1, 1)))}
        >
          Next →
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {WEEKDAY_LABELS.map((wd) => (
          <div key={wd} className="text-xs font-medium text-center" style={{ color: 'var(--color-text-tertiary)' }}>
            {wd}
          </div>
        ))}
        {cells.map((date, i) => {
          const dayTasks = date ? tasksByDay.get(date.toDateString()) ?? [] : [];
          const isToday = date ? date.toDateString() === today.toDateString() : false;
          return (
            <div
              key={i}
              style={{
                minHeight: '4.5rem',
                border: '1px solid var(--color-border)',
                borderRadius: '0.375rem',
                padding: '0.25rem',
                background: isToday ? 'var(--color-fill-tertiary)' : 'transparent',
              }}
            >
              {date && (
                <>
                  <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                    {date.getDate()}
                  </span>
                  <div style={{ marginTop: '0.125rem' }}>
                    {dayTasks.slice(0, 3).map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => onToggle(t.id)}
                        className="text-xs w-full text-left truncate"
                        style={{
                          display: 'block',
                          padding: '0.0625rem 0.25rem',
                          marginTop: '0.125rem',
                          borderRadius: '0.25rem',
                          background: t.status === 'DONE' ? 'var(--color-green-fill, #16a34a22)' : 'var(--color-fill-tertiary)',
                          color: t.status === 'DONE' ? 'var(--color-green, #16a34a)' : 'var(--color-text-primary)',
                          textDecoration: t.status === 'DONE' ? 'line-through' : 'none',
                        }}
                      >
                        {t.title}
                      </button>
                    ))}
                    {dayTasks.length > 3 && (
                      <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                        +{dayTasks.length - 3} more
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// TodoDashboard — live KPI tiles (composes Card) + the existing TodoStatsChart.
// ---------------------------------------------------------------------------
export interface TodoDashboardProps {
  items: TodoItem[];
}

export const TodoDashboard: React.FC<TodoDashboardProps> = ({ items }) => {
  const today = startOfDay(new Date());
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const total = items.length;
  const done = items.filter((i) => i.status === 'DONE').length;
  const todo = total - done;
  const overdue = items.filter((i) => i.status === 'TODO' && i.dueDate && new Date(i.dueDate) < today).length;
  const doneThisWeek = items.filter(
    (i) => i.status === 'DONE' && i.dueDate && new Date(i.dueDate) >= weekAgo && new Date(i.dueDate) <= today,
  ).length;

  const tiles: { label: string; value: number; color?: string }[] = [
    { label: 'Total tasks', value: total },
    { label: 'To do', value: todo },
    { label: 'Done', value: done, color: 'var(--color-green, #16a34a)' },
    { label: 'Overdue', value: overdue, color: overdue > 0 ? 'var(--color-red, #dc2626)' : undefined },
    { label: 'Done this week', value: doneThisWeek },
  ];

  return (
    <div className="todo-dashboard">
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5 mb-6">
        {tiles.map((tile) => (
          <Card key={tile.label} variant="outlined" padding="medium">
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              {tile.label}
            </p>
            <p className="text-2xl font-semibold" style={{ color: tile.color ?? 'var(--color-text-primary)', marginTop: '0.25rem' }}>
              {tile.value}
            </p>
          </Card>
        ))}
      </div>
      <div className="flex justify-center py-4">
        <TodoStatsChart doneCount={done} todoCount={todo} />
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// TodoContentPlanner — kanban-by-week. Dragging a task into a column sets its
// due date to a representative date for that bucket (clears it for "No date").
// Overdue/Today/Tomorrow aren't drop targets here (TodoTimeline covers reading
// that level of granularity); this view is deliberately coarser, for planning.
// ---------------------------------------------------------------------------
export interface TodoContentPlannerProps {
  items: TodoItem[];
  onReschedule: (id: string, dueDate: string | null) => void;
}

const PLANNER_COLUMNS: { bucket: DueBucket; label: string }[] = [
  { bucket: 'this-week', label: 'This week' },
  { bucket: 'next-week', label: 'Next week' },
  { bucket: 'later', label: 'Later' },
  { bucket: 'none', label: 'No date' },
];

function representativeDateForBucket(bucket: DueBucket): string | null {
  const today = startOfDay(new Date());
  if (bucket === 'this-week') return today.toISOString();
  if (bucket === 'next-week') {
    const d = new Date(today);
    d.setDate(d.getDate() + 8);
    return d.toISOString();
  }
  if (bucket === 'later') {
    const d = new Date(today);
    d.setDate(d.getDate() + 15);
    return d.toISOString();
  }
  return null;
}

export const TodoContentPlanner: React.FC<TodoContentPlannerProps> = ({ items, onReschedule }) => {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<DueBucket | null>(null);

  // Overdue/Today/Tomorrow tasks still need a home in this coarser view — fold them into
  // "This week" so nothing silently disappears, without adding extra drop-only columns.
  const bucketOf = (item: TodoItem): DueBucket => {
    const b = bucketForDueDate(item.dueDate, new Date());
    return b === 'overdue' || b === 'today' || b === 'tomorrow' ? 'this-week' : b;
  };

  const handleDrop = (bucket: DueBucket) => {
    if (draggingId) onReschedule(draggingId, representativeDateForBucket(bucket));
    setDraggingId(null);
    setDropTarget(null);
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {PLANNER_COLUMNS.map((col) => {
        const tasks = items.filter((i) => bucketOf(i) === col.bucket);
        return (
          <section
            key={col.bucket}
            className="ios-card p-3"
            style={{
              outline: dropTarget === col.bucket ? '2px solid var(--color-accent)' : 'none',
              minHeight: '10rem',
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDropTarget(col.bucket);
            }}
            onDragLeave={() => setDropTarget(null)}
            onDrop={(e) => {
              e.preventDefault();
              handleDrop(col.bucket);
            }}
          >
            <header className="flex items-center justify-between mb-3 px-1">
              <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
                {col.label}
              </h3>
              <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                {tasks.length}
              </span>
            </header>
            <div className="space-y-2">
              {tasks.map((item) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={() => setDraggingId(item.id)}
                  className="ios-card p-3 text-sm cursor-grab"
                  style={{
                    background: 'var(--color-bg-secondary)',
                    textDecoration: item.status === 'DONE' ? 'line-through' : 'none',
                  }}
                >
                  {item.title}
                </div>
              ))}
              {tasks.length === 0 && (
                <p className="text-xs px-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  Drop a task here
                </p>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------------------
// TodoTaskForm — full create form (title + notes + due date), composes the
// existing Input/TextArea/Button primitives. Complements TodoList's inline
// quick-add, which only takes a title.
// ---------------------------------------------------------------------------
export interface TodoTaskFormProps {
  onCreate: (input: { title: string; notes?: string; dueDate?: string }) => void;
}

export const TodoTaskForm: React.FC<TodoTaskFormProps> = ({ onCreate }) => {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    onCreate({ title: trimmed, notes: notes.trim() || undefined, dueDate: dueDate || undefined });
    setTitle('');
    setNotes('');
    setDueDate('');
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What needs doing?" required />
      <TextArea label="Notes" value={notes} onChange={(value) => setNotes(value)} placeholder="Optional details" rows={3} />
      <div className="ios-form-group">
        <label htmlFor="todo-form-due-date">Due date</label>
        <input
          id="todo-form-due-date"
          type="date"
          className="ios-input"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>
      <Button type="submit" variant="primary">
        Add task
      </Button>
    </form>
  );
};
