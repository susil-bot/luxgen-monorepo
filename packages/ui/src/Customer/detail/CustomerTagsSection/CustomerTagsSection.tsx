import type { CustomerDetail } from '../../fetcher';
import { CustomerDetailSection } from '../../CustomerDetailSection';

export function CustomerTagsSection({ customer }: { customer: CustomerDetail }) {
  return (
    <CustomerDetailSection title="Tags">
      {customer.tags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {customer.tags.map((tag) => (
            <span key={tag} className="badge badge-gray">
              {tag}
            </span>
          ))}
        </div>
      ) : (
        <input className="ios-input" disabled placeholder="Add tags — Phase 3" />
      )}
    </CustomerDetailSection>
  );
}
