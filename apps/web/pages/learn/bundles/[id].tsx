import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';

import { LearnLayout } from '../../../components/learn/LearnLayout';
import { PageLoadingState } from '../../../components/common/PageStates';
import { GET_STOREFRONT_BUNDLE, GET_STOREFRONT_PRODUCTS } from '../../../graphql/queries/storefront';
import { useLearnTenant } from '../../../hooks/useLearnTenant';
import { learnStoreServerProps } from '../../../lib/learn-store';
import { formatBillingInterval, formatStorefrontPrice } from '../../../lib/storefront-format';
import { useStorefrontSubscribe } from '../../../lib/use-storefront-subscribe';

interface Props {
  tenantSubdomain: string;
}

export default function StorefrontBundlePage({ tenantSubdomain }: Props) {
  const router = useRouter();
  const bundleId = router.query.id as string;
  const { tenantId, tenantName, tenantSettings } = useLearnTenant(tenantSubdomain);

  const { data, loading, error } = useQuery(GET_STOREFRONT_BUNDLE, {
    skip: !bundleId || !tenantId,
    variables: { id: bundleId, tenantId: tenantId ?? '' },
  });

  const { data: productsData } = useQuery(GET_STOREFRONT_PRODUCTS, {
    skip: !tenantId,
    variables: { tenantId: tenantId ?? '' },
  });

  const bundle = data?.storefrontBundle;
  const allProducts = productsData?.storefrontProducts ?? [];
  const included = allProducts.filter((p: { id: string }) => bundle?.courseIds?.includes(p.id));
  const returnPath = `/learn/bundles/${bundleId}`;
  const { subscribe, loading: subscribing, error: subError, success } = useStorefrontSubscribe(returnPath);

  return (
    <>
      <Head>
        <title>{bundle?.title ? `${bundle.title} — Bundles` : 'Bundle'}</title>
      </Head>
      <LearnLayout tenantSubdomain={tenantSubdomain} tenantName={tenantName} tenantSettings={tenantSettings}>
        <Link href="/learn/bundles" className="ios-btn-plain text-sm mb-4 inline-flex">
          ← Bundles
        </Link>

        {loading && <PageLoadingState label="Loading bundle…" />}
        {error && <p className="text-sm text-red">{error.message}</p>}

        {bundle && (
          <article className="space-y-6">
            <header>
              <h1 className="ios-large-title">{bundle.title}</h1>
              <p className="text-lg font-semibold mt-2" style={{ color: 'var(--color-blue)' }}>
                {formatStorefrontPrice(bundle.priceCents, bundle.currency)}{' '}
                <span className="text-sm font-normal text-secondary">
                  {formatBillingInterval(bundle.billingInterval)}
                </span>
              </p>
              {bundle.description && <p className="text-secondary text-sm mt-3">{bundle.description}</p>}
            </header>

            <section className="ios-card p-5">
              <h2 className="font-semibold mb-3">Included courses</h2>
              <ul className="space-y-2">
                {included.map((p: { id: string; title: string }) => (
                  <li key={p.id}>
                    <Link href={`/learn/products/${p.id}`} className="text-sm" style={{ color: 'var(--color-blue)' }}>
                      {p.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            <section className="ios-card p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <p className="font-semibold">
                {success ? 'Subscribed — all courses enrolled' : 'Subscribe to this bundle'}
              </p>
              {success ? (
                <Link href="/learn/subscriptions" className="ios-btn-primary">
                  View subscriptions
                </Link>
              ) : (
                <button
                  type="button"
                  className="ios-btn-primary"
                  disabled={subscribing}
                  onClick={() => void subscribe(bundleId)}
                >
                  {subscribing ? 'Processing…' : bundle.billingInterval === 'one_time' ? 'Buy bundle' : 'Subscribe'}
                </button>
              )}
            </section>
            {subError && <p className="text-sm text-red">{subError}</p>}
          </article>
        )}
      </LearnLayout>
    </>
  );
}

export const getServerSideProps = learnStoreServerProps;
