import Head from 'next/head';
import Link from 'next/link';
import { useQuery } from '@apollo/client';

import { LearnLayout } from '../../../components/learn/LearnLayout';
import { PageLoadingState } from '../../../components/common/PageStates';
import { GET_STOREFRONT_COLLECTIONS } from '../../../graphql/queries/storefront';
import { useLearnTenant } from '../../../hooks/useLearnTenant';
import { learnStoreServerProps } from '../../../lib/learn-store';

interface Props {
  tenantSubdomain: string;
}

export default function StorefrontCollectionsPage({ tenantSubdomain }: Props) {
  const { tenantId, tenantName, tenantSettings, loading: tenantLoading } = useLearnTenant(tenantSubdomain);

  const { data, loading, error } = useQuery(GET_STOREFRONT_COLLECTIONS, {
    skip: !tenantId,
    variables: { tenantId: tenantId ?? '' },
  });

  const collections = data?.storefrontCollections ?? [];
  const catalogLoading = tenantLoading || (Boolean(tenantId) && loading);

  return (
    <>
      <Head>
        <title>Collections — {tenantName ?? tenantSubdomain}</title>
      </Head>
      <LearnLayout tenantSubdomain={tenantSubdomain} tenantName={tenantName} tenantSettings={tenantSettings}>
        <header className="mb-6">
          <h1 className="ios-large-title">Collections</h1>
          <p className="text-sm text-secondary mt-1">Curated learning groups and pathways</p>
        </header>

        {catalogLoading && <PageLoadingState label="Loading collections…" />}
        {error && <p className="text-sm text-red">{error.message}</p>}

        {!catalogLoading && !error && collections.length === 0 && (
          <div className="ios-empty-state ios-card py-12">
            <p className="empty-title">No collections yet</p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {collections.map((col: { id: string; name: string; description: string; color?: string }) => (
            <Link
              key={col.id}
              href={`/learn/collections/${col.id}`}
              className="ios-card p-5 block"
              style={col.color ? { borderLeft: `4px solid ${col.color}` } : undefined}
            >
              <h2 className="font-semibold text-lg text-primary">{col.name}</h2>
              <p className="text-sm text-secondary mt-2 line-clamp-3">{col.description || 'Explore this collection'}</p>
            </Link>
          ))}
        </div>
      </LearnLayout>
    </>
  );
}

export const getServerSideProps = learnStoreServerProps;
