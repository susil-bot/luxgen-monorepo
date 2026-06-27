import Head from 'next/head';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';

import { CategoryRail } from '../../../components/store/CategoryRail';
import { StorefrontProductCard } from '../../../components/store/StorefrontProductCard';
import { StoreLayout } from '../../../components/store/StoreLayout';
import { PageLoadingState } from '../../../components/common/PageStates';
import { GET_STOREFRONT_PRODUCTS } from '../../../graphql/queries/storefront';
import { useLearnTenant } from '../../../hooks/useLearnTenant';
import { storeServerProps } from '../../../lib/learn-store';
import { STORE_CATEGORIES, type StoreCategoryId } from '../../../lib/store-categories';

interface Props {
  tenantSubdomain: string;
}

export default function StoreProductPage({ tenantSubdomain }: Props) {
  const router = useRouter();
  const rawCategory = router.query.category as string | undefined;
  const activeCategory: StoreCategoryId = STORE_CATEGORIES.some((c) => c.id === rawCategory)
    ? (rawCategory as StoreCategoryId)
    : 'all';

  const { tenantId, tenantName, tenantSettings, loading: tenantLoading } = useLearnTenant(tenantSubdomain);

  const { data, loading, error } = useQuery(GET_STOREFRONT_PRODUCTS, {
    skip: !tenantId,
    variables: {
      tenantId: tenantId ?? '',
      category: activeCategory === 'all' ? null : activeCategory,
    },
  });

  const products = data?.storefrontProducts ?? [];
  const catalogLoading = tenantLoading || (Boolean(tenantId) && loading);

  return (
    <>
      <Head>
        <title>GPT Store</title>
      </Head>
      <StoreLayout tenantSubdomain={tenantSubdomain} tenantName={tenantName} tenantSettings={tenantSettings}>
        <header className="mb-6">
          <p className="text-xs uppercase tracking-[0.2em] text-secondary mb-2">AI-native commerce</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight">
            Shop with{' '}
            <span
              style={{
                background: 'linear-gradient(90deg, #007AFF, #AF52DE)',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
              }}
            >
              GPT
            </span>
          </h1>
          <p className="text-sm text-secondary mt-2 max-w-xl">
            Curated picks across categories. No SEO maze — just ask the seller AI and buy in one tap.
          </p>
        </header>

        <CategoryRail active={activeCategory} />

        {catalogLoading && <PageLoadingState label="Curating products…" />}
        {error && <p className="text-sm text-red">{error.message}</p>}

        {!catalogLoading && !error && products.length === 0 && (
          <div className="ios-empty-state ios-card py-16 rounded-2xl">
            <p className="empty-title">Nothing in this category yet</p>
            <p className="empty-subtitle">Try another category or check back soon.</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map(
            (product: {
              id: string;
              title: string;
              description: string;
              category: string;
              priceCents: number;
              currency: string;
            }) => (
              <StorefrontProductCard key={product.id} {...product} />
            ),
          )}
        </div>
      </StoreLayout>
    </>
  );
}

export const getServerSideProps = storeServerProps;
