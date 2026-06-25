import Head from 'next/head';
import Link from 'next/link';
import { useQuery } from '@apollo/client';

import { StoreLayout } from '../../../components/store/StoreLayout';
import { PageLoadingState } from '../../../components/common/PageStates';
import { GET_STOREFRONT_COLLECTIONS } from '../../../graphql/queries/storefront';
import { useLearnTenant } from '../../../hooks/useLearnTenant';
import { storeServerProps } from '../../../lib/learn-store';

interface Props {
  tenantSubdomain: string;
}

export default function StoreCollectionsPage({ tenantSubdomain }: Props) {
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
        <title>Collections — GPT Store</title>
      </Head>
      <StoreLayout tenantSubdomain={tenantSubdomain} tenantName={tenantName} tenantSettings={tenantSettings}>
        <header className="mb-6">
          <p className="text-xs uppercase tracking-[0.2em] text-secondary mb-2">Curated by AI</p>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Collections</h1>
          <p className="text-sm text-secondary mt-2">Themed drops — men, women, interior, digital, and more.</p>
        </header>

        {catalogLoading && <PageLoadingState label="Loading collections…" />}
        {error && <p className="text-sm text-red">{error.message}</p>}

        {!catalogLoading && !error && collections.length === 0 && (
          <div className="ios-empty-state ios-card py-16 rounded-2xl">
            <p className="empty-title">No collections yet</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {collections.map((col: { id: string; name: string; description: string; color?: string }) => (
            <Link
              key={col.id}
              href={`/store/collections/${col.id}`}
              className="block rounded-2xl p-6 transition-transform hover:scale-[1.01]"
              style={{
                background: col.color
                  ? `linear-gradient(145deg, ${col.color}22, rgba(0,122,255,0.08))`
                  : 'var(--color-bg-secondary)',
                border: '1px solid var(--color-separator)',
              }}
            >
              <h2 className="font-semibold text-lg text-primary">{col.name}</h2>
              <p className="text-sm text-secondary mt-2 line-clamp-3">{col.description || 'Explore this drop'}</p>
              <span
                className="inline-block mt-4 text-xs font-medium uppercase tracking-wider"
                style={{ color: 'var(--color-blue)' }}
              >
                Open collection →
              </span>
            </Link>
          ))}
        </div>
      </StoreLayout>
    </>
  );
}

export const getServerSideProps = storeServerProps;
