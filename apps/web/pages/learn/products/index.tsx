import Head from 'next/head';
import Link from 'next/link';
import { useQuery } from '@apollo/client';

import { LearnLayout } from '../../../components/learn/LearnLayout';
import { PageLoadingState } from '../../../components/common/PageStates';
import { GET_STOREFRONT_PRODUCTS } from '../../../graphql/queries/storefront';
import { useLearnTenant } from '../../../hooks/useLearnTenant';
import { learnStoreServerProps } from '../../../lib/learn-store';
import { formatStorefrontPrice } from '../../../lib/storefront-format';

interface Props {
  tenantSubdomain: string;
}

export default function StorefrontProductsPage({ tenantSubdomain }: Props) {
  const { tenantId, tenantName, tenantSettings, loading: tenantLoading } = useLearnTenant(tenantSubdomain);

  const { data, loading, error } = useQuery(GET_STOREFRONT_PRODUCTS, {
    skip: !tenantId,
    variables: { tenantId: tenantId ?? '' },
  });

  const products = data?.storefrontProducts ?? [];
  const catalogLoading = tenantLoading || (Boolean(tenantId) && loading);

  return (
    <>
      <Head>
        <title>Products — {tenantName ?? tenantSubdomain}</title>
      </Head>
      <LearnLayout tenantSubdomain={tenantSubdomain} tenantName={tenantName} tenantSettings={tenantSettings}>
        <header className="mb-6">
          <h1 className="ios-large-title">Products</h1>
          <p className="text-sm text-secondary mt-1">Training courses available for enrollment</p>
        </header>

        {catalogLoading && <PageLoadingState label="Loading products…" />}
        {error && <p className="text-sm text-red">{error.message}</p>}

        {!catalogLoading && !error && products.length === 0 && (
          <div className="ios-empty-state ios-card py-12">
            <p className="empty-title">No products yet</p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {products.map(
            (product: {
              id: string;
              title: string;
              description: string;
              instructorName?: string;
              priceCents: number;
              currency: string;
            }) => (
              <Link key={product.id} href={`/learn/products/${product.id}`} className="ios-card p-5 block">
                <h2 className="font-semibold text-lg text-primary">{product.title}</h2>
                {product.instructorName && <p className="text-xs text-secondary mt-1">By {product.instructorName}</p>}
                <p className="text-sm text-secondary mt-2 line-clamp-2">{product.description}</p>
                <p className="mt-3 font-medium" style={{ color: 'var(--color-blue)' }}>
                  {formatStorefrontPrice(product.priceCents, product.currency)} →
                </p>
              </Link>
            ),
          )}
        </div>
      </LearnLayout>
    </>
  );
}

export const getServerSideProps = learnStoreServerProps;
