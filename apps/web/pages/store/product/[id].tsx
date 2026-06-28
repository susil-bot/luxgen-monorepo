import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';

import { GptSalesAssistant } from '../../../components/store/GptSalesAssistant';
import { StoreLayout } from '../../../components/store/StoreLayout';
import { PageLoadingState, PageEmptyState } from '../../../components/common/PageStates';
import { GET_STOREFRONT_PRODUCT } from '../../../graphql/queries/storefront';
import { useLearnTenant } from '../../../hooks/useLearnTenant';
import { storeServerProps } from '../../../lib/learn-store';
import { categoryLabel } from '../../../lib/store-categories';
import { formatStorefrontPrice } from '../../../lib/storefront-format';
import { useLearnEnroll } from '../../../lib/use-learn-enroll';
import { SnackbarProvider, useSnackbar } from '@luxgen/ui';

interface Props {
  tenantSubdomain: string;
}

function StoreProductDetailContent({ tenantSubdomain }: Props) {
  const { showSuccess } = useSnackbar();
  const router = useRouter();
  const productId = router.query.id as string;
  const { tenantName, tenantSettings } = useLearnTenant(tenantSubdomain);

  const { data, loading, error } = useQuery(GET_STOREFRONT_PRODUCT, {
    skip: !productId,
    variables: { id: productId },
  });

  const product = data?.storefrontProduct;
  const returnPath = `/store/product/${productId}`;
  const { enroll, loading: enrolling, success } = useLearnEnroll({ courseId: productId, returnPath });
  const handleBuy = async () => {
    await enroll();
    showSuccess('Added to cart — enrollment started');
  };

  return (
    <>
      <Head>
        <title>{product?.title ?? 'Product'}</title>
        {product ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'Product',
                name: product.title,
                description: product.description?.replace(/<!--[\s\S]*?-->/g, '').trim(),
                offers: {
                  '@type': 'Offer',
                  price: (product.priceCents / 100).toFixed(2),
                  priceCurrency: product.currency ?? 'USD',
                },
              }),
            }}
          />
        ) : null}
      </Head>
      <StoreLayout tenantSubdomain={tenantSubdomain} tenantName={tenantName} tenantSettings={tenantSettings}>
        <Link href="/store/product" className="text-sm text-secondary hover:text-primary mb-6 inline-block">
          ← Back to shop
        </Link>

        {loading && <PageLoadingState label="Loading product…" />}
        {error && <p className="text-sm text-red">{error.message}</p>}
        {!loading && !error && !product && (
          <PageEmptyState
            title="Product not found"
            subtitle="This item may have been removed or the link is incorrect."
            action={
              <Link href="/store/product" className="ios-btn-primary text-sm mt-4 inline-block">
                Browse shop
              </Link>
            }
          />
        )}

        {product && (
          <div className="grid lg:grid-cols-[1fr_320px] gap-8 items-start">
            <article className="space-y-6">
              <div
                className="rounded-2xl p-8 min-h-[200px] flex flex-col justify-end"
                style={{
                  background:
                    'linear-gradient(145deg, rgba(0,122,255,0.2), rgba(88,86,214,0.15), rgba(175,82,222,0.1))',
                  border: '1px solid rgba(0,122,255,0.15)',
                }}
              >
                <span className="text-xs uppercase tracking-widest text-secondary mb-2">
                  {categoryLabel(product.category)}
                </span>
                <h1 className="text-3xl sm:text-4xl font-bold text-primary">{product.title}</h1>
                <p className="text-2xl font-semibold mt-3" style={{ color: 'var(--color-blue)' }}>
                  {formatStorefrontPrice(product.priceCents, product.currency)}
                </p>
              </div>

              {product.description && (
                <section className="rounded-2xl p-6" style={{ background: 'var(--color-bg-secondary)' }}>
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-secondary mb-3">About</h2>
                  <p className="text-secondary text-sm leading-relaxed whitespace-pre-wrap">
                    {product.description.replace(/<!--[\s\S]*?-->/g, '').trim()}
                  </p>
                </section>
              )}

              {success && (
                <div
                  className="rounded-xl p-4 text-sm"
                  style={{ background: 'rgba(52,199,89,0.15)', color: 'var(--color-green)' }}
                >
                  Purchased — you're enrolled.{' '}
                  <Link href="/dashboard" className="underline">
                    Open dashboard
                  </Link>
                </div>
              )}
            </article>

            <GptSalesAssistant
              productTitle={product.title}
              productDescription={product.description}
              category={product.category}
              priceCents={product.priceCents}
              currency={product.currency}
              onBuy={() => void handleBuy()}
              buying={enrolling}
            />
          </div>
        )}
      </StoreLayout>
    </>
  );
}

export default function StoreProductDetailPage(props: Props) {
  return (
    <SnackbarProvider position="top-right" maxSnackbars={3}>
      <StoreProductDetailContent {...props} />
    </SnackbarProvider>
  );
}

export const getServerSideProps = storeServerProps;
