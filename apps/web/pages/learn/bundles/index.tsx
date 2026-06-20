import Head from 'next/head';
import Link from 'next/link';
import { useQuery } from '@apollo/client';

import { LearnLayout } from '../../../components/learn/LearnLayout';
import { PageLoadingState } from '../../../components/common/PageStates';
import { GET_STOREFRONT_BUNDLES } from '../../../graphql/queries/storefront';
import { useLearnTenant } from '../../../hooks/useLearnTenant';
import { learnStoreServerProps } from '../../../lib/learn-store';
import { formatBillingInterval, formatStorefrontPrice } from '../../../lib/storefront-format';

interface Props {
  tenantSubdomain: string;
}

export default function StorefrontBundlesPage({ tenantSubdomain }: Props) {
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
        <title>Bundles — {tenantName ?? tenantSubdomain}</title>
      </Head>
      <LearnLayout tenantSubdomain={tenantSubdomain} tenantName={tenantName} tenantSettings={tenantSettings}>
        <header className="mb-6">
          <h1 className="ios-large-title">Bundles</h1>
          <p className="text-sm text-secondary mt-1">Save with multi-course packs and subscriptions</p>
        </header>

        {catalogLoading && <PageLoadingState label="Loading bundles…" />}
        {error && <p className="text-sm text-red">{error.message}</p>}

        {!catalogLoading && !error && bundles.length === 0 && (
          <div className="ios-empty-state ios-card py-12">
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
              <Link key={bundle.id} href={`/learn/bundles/${bundle.id}`} className="ios-card p-5 block">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h2 className="font-semibold text-lg text-primary">{bundle.title}</h2>
                    <p className="text-sm text-secondary mt-2">{bundle.description}</p>
                    <p className="text-xs text-secondary mt-2">{bundle.courseIds.length} courses included</p>
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
      </LearnLayout>
    </>
  );
}

export const getServerSideProps = learnStoreServerProps;
