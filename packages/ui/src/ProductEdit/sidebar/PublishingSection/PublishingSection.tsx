import { ProductEditSection } from '../../ProductEditSection';
import { publishingChannels } from './fetcher';

export function PublishingSection() {
  return (
    <ProductEditSection title="Publishing" hint="Shopify: sales channels · LuxGen: tenant surfaces">
      <ul className="space-y-2">
        {publishingChannels.map((ch) => (
          <li key={ch.id} className="flex items-center justify-between text-sm">
            <span className="text-primary">{ch.label}</span>
            <span className={`badge ${ch.enabled ? 'badge-green' : 'badge-gray'}`}>
              {ch.enabled ? 'Published' : 'Off'}
            </span>
          </li>
        ))}
      </ul>
      <button type="button" className="ios-btn-plain text-sm mt-2" disabled>
        Manage publishing — Phase 3
      </button>
    </ProductEditSection>
  );
}
