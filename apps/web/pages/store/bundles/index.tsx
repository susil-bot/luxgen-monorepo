import Head from 'next/head';
import Link from 'next/link';
import { useQuery } from '@apollo/client';

import { StoreLayout } from '../../../components/store/StoreLayout';
import { PageLoadingState } from '../../../components/common/PageStates';
import { GET_STOREFRONT_BUNDLES } from '../../../graphql/queries/storefront';
import { useLearnTenant } from '../../../hooks/useLearnTenant';
import { storeServerProps } from '../../../lib/learn-store';
import { formatBillingInterval, formatStorefrontPrice } from '../../../lib/storefront-format';

interface Props {
  tenantSubdomain: string;
}

export default function StoreBundlesPage({ tenantSubdomain }: Props) {
  const { tenantId, tenantName, tenantSettings, loading: tenantLoading } = useLearnTenant(tenantSubdomain);

  const { data, loading, error } = useQuery(GET_STOREFRONT_BUNDLES, {
    skip: !tenantId,
    variables: { tenantId: tenantId ?? '' },
  });

  const bundles = data?.storefrontBundles ?? [];
  const catalogLoading = tenantLoading || (Boolean(tenantId) && loading);

  return (
    <>
      <Head>
        <title>Bundles — GPT Store</title>
      </Head>
      <StoreLayout tenantSubdomain={tenantSubdomain} tenantName={tenantName} tenantSettings={tenantSettings}>
        <header className="mb-6">
          <p className="text-xs uppercase tracking-[0.2em] text-secondary mb-2">Stack & save</p>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Bundles</h1>
          <p className="text-sm text-secondary mt-2">Multi-product packs — one checkout, GPT recommends the rest.</p>
        </header>

        {catalogLoading && <PageLoadingState label="Loading bundles…" />}
        {error && <p className="text-sm text-red">{error.message}</p>}

        {!catalogLoading && !error && bundles.length === 0 && (
          <div className="ios-empty-state ios-card py-16 rounded-2xl">
            <p className="empty-title">No bundles yet</p>
          </div>
        )}

        <div className="grid gap-4">
          {bundles.map(
            (bundle: {
              id: string;
              title: string;
              description: string;
              priceCents: number;
              currency: string;
              billingInterval: string;
              courseIds: string[];
            }) => (
              <Link
                key={bundle.id}
                href={`/store/bundles/${bundle.id}`}
                className="block rounded-2xl p-6 transition-transform hover:scale-[1.01]"
                style={{
                  background: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-separator)',
                }}
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h2 className="font-semibold text-lg text-primary">{bundle.title}</h2>
                    <p className="text-sm text-secondary mt-2">{bundle.description}</p>
                    <p className="text-xs text-secondary mt-2">{bundle.courseIds.length} items included</p>
                  </div>
                  <p className="font-semibold whitespace-nowrap" style={{ color: 'var(--color-blue)' }}>
                    {formatStorefrontPrice(bundle.priceCents, bundle.currency)}{' '}
                    <span className="text-xs font-normal text-secondary">
                      {formatBillingInterval(bundle.billingInterval)}
                    </span>
                  </p>
                </div>
              </Link>
            ),
          )}
        </div>
      </StoreLayout>
    </>
  );
}

export const getServerSideProps = storeServerProps;
