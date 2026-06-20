import type { ProjectItem } from '../../lib/project-types';
import { PRIORITY_LABELS } from '../../lib/project-types';

interface ProjectCardProps {
  item: ProjectItem;
  onClick?: () => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
}

function formatDate(iso?: string): string | null {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return iso;
  }
}

export function ProjectCard({ item, onClick, draggable, onDragStart }: ProjectCardProps) {
  const start = formatDate(item.startDate);
  const end = formatDate(item.endDate);
  const dateRange = start && end ? `${start} – ${end}` : (end ?? start);

  return (
    <article
      className="lux-project-card"
      draggable={draggable}
      onDragStart={onDragStart}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      <div className="lux-project-card__head">
        <span className={`lux-project-priority lux-project-priority--${item.priority.toLowerCase()}`}>
          {item.priority}
        </span>
        {item.estimate != null && <span className="lux-project-card__estimate">{item.estimate}d</span>}
      </div>
      <h3 className="lux-project-card__title">{item.title}</h3>
      {dateRange && <p className="lux-project-card__dates">{dateRange}</p>}
      <div className="lux-project-card__footer">
        {(item.assigneeName ?? item.assignee) && (
          <span className="lux-project-card__assignee">{item.assigneeName ?? item.assignee}</span>
        )}
        <span className="lux-project-card__priority-label">{PRIORITY_LABELS[item.priority]}</span>
      </div>
      {item.labels.length > 0 && (
        <div className="lux-project-card__labels">
          {item.labels.map((label) => (
            <span key={label} className="lux-project-label">
              {label}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
