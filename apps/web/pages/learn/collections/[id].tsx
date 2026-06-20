import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';

import { LearnLayout } from '../../../components/learn/LearnLayout';
import { PageLoadingState } from '../../../components/common/PageStates';
import { GET_STOREFRONT_COLLECTION, GET_STOREFRONT_PRODUCTS } from '../../../graphql/queries/storefront';
import { useLearnTenant } from '../../../hooks/useLearnTenant';
import { learnStoreServerProps } from '../../../lib/learn-store';
import { formatStorefrontPrice } from '../../../lib/storefront-format';

interface Props {
  tenantSubdomain: string;
}

export default function StorefrontCollectionPage({ tenantSubdomain }: Props) {
  const router = useRouter();
  const collectionId = router.query.id as string;
  const { tenantId, tenantName, tenantSettings } = useLearnTenant(tenantSubdomain);

  const { data, loading, error } = useQuery(GET_STOREFRONT_COLLECTION, {
    skip: !collectionId || !tenantId,
    variables: { id: collectionId, tenantId: tenantId ?? '' },
  });

  const { data: productsData } = useQuery(GET_STOREFRONT_PRODUCTS, {
    skip: !tenantId,
    variables: { tenantId: tenantId ?? '' },
  });

  const collection = data?.storefrontCollection;
  const products = productsData?.storefrontProducts ?? [];

  return (
    <>
      <Head>
        <title>{collection?.name ? `${collection.name} — Collections` : 'Collection'}</title>
      </Head>
      <LearnLayout tenantSubdomain={tenantSubdomain} tenantName={tenantName} tenantSettings={tenantSettings}>
        <Link href="/learn/collections" className="ios-btn-plain text-sm mb-4 inline-flex">
          ← Collections
        </Link>

        {loading && <PageLoadingState label="Loading collection…" />}
        {error && <p className="text-sm text-red">{error.message}</p>}

        {collection && (
          <article className="space-y-8">
            <header>
              <h1 className="ios-large-title">{collection.name}</h1>
              {collection.description && <p className="text-secondary text-sm mt-2">{collection.description}</p>}
            </header>

            <section>
              <h2 className="font-semibold text-primary mb-4">Featured products</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {products.map((product: { id: string; title: string; priceCents: number; currency: string }) => (
                  <Link key={product.id} href={`/learn/products/${product.id}`} className="ios-card p-4 block">
                    <p className="font-medium text-primary">{product.title}</p>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-blue)' }}>
                      {formatStorefrontPrice(product.priceCents, product.currency)}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          </article>
        )}
      </LearnLayout>
    </>
  );
}

export const getServerSideProps = learnStoreServerProps;
