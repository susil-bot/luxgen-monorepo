import Link from 'next/link';

import { categoryLabel } from '../../lib/store-categories';
import { formatStorefrontPrice } from '../../lib/storefront-format';

interface ProductCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  priceCents: number;
  currency: string;
}

export function ProductCard({ id, title, description, category, priceCents, currency }: ProductCardProps) {
  const cleanDesc = description.replace(/<!--[\s\S]*?-->/g, '').trim();

  return (
    <Link
      href={`/store/product/${id}`}
      className="lux-card-container lux-card-adaptive group block rounded-2xl overflow-hidden transition-all hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-blue)] focus-visible:ring-offset-2"
      style={{
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-separator)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        className="aspect-video min-h-[8rem] flex items-end p-4 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, rgba(0,122,255,0.15), rgba(175,82,222,0.1))`,
        }}
      >
        <span
          className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(0,0,0,0.2)', color: '#fff', backdropFilter: 'blur(8px)' }}
        >
          {categoryLabel(category)}
        </span>
        <div
          className="absolute top-3 right-3 text-[10px] font-medium px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: 'rgba(0,122,255,0.9)', color: '#fff' }}
        >
          Ask GPT →
        </div>
      </div>
      <div className="p-4">
        <h2 className="lux-store-product-title font-semibold text-primary line-clamp-2 sm:line-clamp-1">{title}</h2>
        <p className="text-xs text-secondary mt-1 line-clamp-2">{cleanDesc || 'GPT-curated pick'}</p>
        <p className="mt-3 font-semibold" style={{ color: 'var(--color-blue)' }}>
          {formatStorefrontPrice(priceCents, currency)}
        </p>
      </div>
    </Link>
  );
}
