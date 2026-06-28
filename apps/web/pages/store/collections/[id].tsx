import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';

import { StorefrontProductCard } from '../../../components/store/StorefrontProductCard';
import { StoreLayout } from '../../../components/store/StoreLayout';
import { PageLoadingState } from '../../../components/common/PageStates';
import { GET_STOREFRONT_COLLECTION, GET_STOREFRONT_PRODUCTS } from '../../../graphql/queries/storefront';
import { useLearnTenant } from '../../../hooks/useLearnTenant';
import { storeServerProps } from '../../../lib/learn-store';

interface Props {
  tenantSubdomain: string;
}

export default function StoreCollectionDetailPage({ tenantSubdomain }: Props) {
  const router = useRouter();
  const collectionId = router.query.id as string;
  const { tenantId, tenantName, tenantSettings } = useLearnTenant(tenantSubdomain);

  const { data, loading, error } = useQuery(GET_STOREFRONT_COLLECTION, {
    skip: !collectionId || !tenantId,
    variables: { id: collectionId, tenantId: tenantId ?? '' },
  });

  const { data: productsData } = useQuery(GET_STOREFRONT_PRODUCTS, {
    skip: !tenantId,
    variables: { tenantId: tenantId ?? '', category: null },
  });

  const collection = data?.storefrontCollection;
  const products = productsData?.storefrontProducts ?? [];

  return (
    <>
      <Head>
        <title>{collection?.name ? `${collection.name} — GPT Store` : 'Collection'}</title>
      </Head>
      <StoreLayout tenantSubdomain={tenantSubdomain} tenantName={tenantName} tenantSettings={tenantSettings}>
        <Link href="/store/collections" className="text-sm text-secondary hover:text-primary mb-6 inline-block">
          ← Collections
        </Link>

        {loading && <PageLoadingState label="Loading collection…" />}
        {error && <p className="text-sm text-red">{error.message}</p>}

        {collection && (
          <article className="space-y-8">
            <header
              className="rounded-2xl p-8"
              style={{
                background: collection.color
                  ? `linear-gradient(145deg, ${collection.color}33, rgba(88,86,214,0.12))`
                  : 'linear-gradient(145deg, rgba(0,122,255,0.15), rgba(175,82,222,0.1))',
                border: '1px solid rgba(0,122,255,0.15)',
              }}
            >
              <h1 className="text-3xl font-bold text-primary">{collection.name}</h1>
              {collection.description && (
                <p className="text-secondary text-sm mt-3 max-w-2xl">{collection.description}</p>
              )}
            </header>

            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-secondary mb-4">In this collection</h2>
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
            </section>
          </article>
        )}
      </StoreLayout>
    </>
  );
}

export const getServerSideProps = storeServerProps;
