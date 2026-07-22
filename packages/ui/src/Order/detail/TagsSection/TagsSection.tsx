import { OrderDetailSection } from '../../OrderDetailSection';

export interface TagsSectionProps {
  tags: string[];
}

export function TagsSection({ tags }: TagsSectionProps) {
  return (
    <OrderDetailSection title="Tags">
      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag} className="badge badge-gray">
              {tag}
            </span>
          ))}
        </div>
      ) : (
        <input className="ios-input" disabled placeholder="Add tags — Phase 3" />
      )}
    </OrderDetailSection>
  );
}
