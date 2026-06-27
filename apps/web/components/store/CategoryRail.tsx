import { useRouter } from 'next/router';

import { STORE_CATEGORIES, type StoreCategoryId } from '../../lib/store-categories';

interface CategoryRailProps {
  active: StoreCategoryId;
}

export function CategoryRail({ active }: CategoryRailProps) {
  const router = useRouter();

  const setCategory = (category: StoreCategoryId) => {
    const query = category === 'all' ? {} : { category };
    void router.push({ pathname: '/store/product', query }, undefined, { shallow: true });
  };

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
      {STORE_CATEGORIES.map(({ id, label, emoji }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => setCategory(id)}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm transition-all ${
              isActive ? 'lux-category-chip-active' : ''
            }`}
            style={
              isActive
                ? undefined
                : {
                    background: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-separator)',
                    color: 'var(--color-label-secondary)',
                  }
            }
          >
            <span aria-hidden>{emoji}</span>
            {label}
          </button>
        );
      })}
    </div>
  );
}
