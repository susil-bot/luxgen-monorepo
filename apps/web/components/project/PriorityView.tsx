import { useMemo, useState } from 'react';

import type { ProjectItem, ProjectPriority } from '../../lib/project-types';
import { PRIORITY_LABELS } from '../../lib/project-types';
import { priorityRank, useProject } from './ProjectProvider';
import { ProjectCard } from './ProjectCard';
import { ProjectItemModal } from './ProjectItemModal';

type PriorityFilter = 'all' | ProjectPriority;

export function PriorityView() {
  const { filteredItems } = useProject();
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [editingItem, setEditingItem] = useState<ProjectItem | null>(null);

  const sorted = useMemo(() => {
    const list =
      priorityFilter === 'all' ? [...filteredItems] : filteredItems.filter((item) => item.priority === priorityFilter);
    return list.sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority));
  }, [filteredItems, priorityFilter]);

  return (
    <>
      <div className="lux-project-priority">
        <div className="lux-project-priority__filters" role="group" aria-label="Filter by priority">
          <button
            type="button"
            className={`lux-project-priority-chip${priorityFilter === 'all' ? ' lux-project-priority-chip--active' : ''}`}
            onClick={() => setPriorityFilter('all')}
          >
            All
          </button>
          {(Object.keys(PRIORITY_LABELS) as ProjectPriority[]).map((p) => (
            <button
              key={p}
              type="button"
              className={`lux-project-priority-chip lux-project-priority-chip--${p.toLowerCase()}${priorityFilter === p ? ' lux-project-priority-chip--active' : ''}`}
              onClick={() => setPriorityFilter(p)}
            >
              {p} · {PRIORITY_LABELS[p]}
            </button>
          ))}
        </div>

        <div className="lux-project-priority__grid">
          {sorted.length === 0 ? (
            <p className="lux-project-empty">No items match this filter.</p>
          ) : (
            sorted.map((item) => <ProjectCard key={item.id} item={item} onClick={() => setEditingItem(item)} />)
          )}
        </div>
      </div>

      {editingItem && <ProjectItemModal item={editingItem} onClose={() => setEditingItem(null)} />}
    </>
  );
}
