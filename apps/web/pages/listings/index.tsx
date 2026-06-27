import Head from 'next/head';
import { useAppShellConfig } from '../../lib/app-shell-config';
import { useLayoutUser } from '../../lib/app-layout-user';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { AppLayout } from '@luxgen/ui';
import { GET_PUBLISHED_LISTINGS } from '../../graphql/queries/listings';

interface Props {
  tenant: string;
}

export default function ListingsDirectoryPage({ tenant }: Props) {
  const layoutUser = useLayoutUser();
  const { sidebarSections, logo } = useAppShellConfig();
  const { data, loading } = useQuery(GET_PUBLISHED_LISTINGS, {
    variables: { tenantId: tenant },
    errorPolicy: 'ignore' });

  const listings = data?.publishedListings ?? [];

  return (
    <>
      <Head>
        <title>Business Listings — {tenant}</title>
      </Head>
      <AppLayout
        responsive
        sidebarSections={sidebarSections}
        user={layoutUser ?? undefined}
        logo={logo}
      >
        <div className="max-w-4xl mx-auto px-4 py-8">
          <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="ios-large-title" style={{ margin: 0 }}>
                Business listings
              </h1>
              <p className="text-sm text-secondary mt-1">Published profiles with active subscriptions</p>
            </div>
            <Link href={`/listings/apply?tenant=${encodeURIComponent(tenant)}`} className="ios-btn-primary">
              List your business
            </Link>
          </header>

          {loading && <p className="text-secondary text-sm">Loading…</p>}

          <div className="grid gap-4">
            {listings.map(
              (l: { id: string; businessName: string; slug: string; description?: string; category?: string }) => (
                <article key={l.id} className="ios-card p-5">
                  <h2 className="font-semibold text-primary">{l.businessName}</h2>
                  {l.category && <p className="text-xs text-secondary mt-1">{l.category}</p>}
                  {l.description && <p className="text-sm text-secondary mt-2">{l.description}</p>}
                </article>
              ),
            )}
            {!loading && listings.length === 0 && <p className="text-secondary text-sm">No published listings yet.</p>}
          </div>
        </div>
      </AppLayout>
    </>
  );
}

export const getServerSideProps = async (ctx: { query: { tenant?: string } }) => ({
  props: { tenant: ctx.query.tenant || 'demo' } });
