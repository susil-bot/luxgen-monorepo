import { useEffect, useState } from 'react';
import { useAppShellConfig } from '../../lib/app-shell-config';
import { useLayoutUser } from '../../lib/app-layout-user';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery, useMutation } from '@apollo/client';
import { AppLayout } from '@luxgen/ui';
import { GET_MY_LISTINGS, CREATE_LISTING_CHECKOUT } from '../../graphql/queries/listings';
import { getWebUrl } from '../../lib/urls';

interface Props {
  tenant: string;
}

const STATUS_LABEL: Record<string, string> = {
  DRAFT: 'Draft',
  SUBMITTED: 'Under review',
  NEED_MORE_INFORMATION: 'Info requested',
  AWAITING_PAYMENT: 'Approved — pay to publish',
  PUBLISHED: 'Published',
  EXPIRED: 'Expired',
  REJECTED: 'Rejected' };

export default function MyListingsPage({ tenant }: Props) {
  const layoutUser = useLayoutUser();
  const { sidebarSections, logo } = useAppShellConfig();
  const router = useRouter();
  const [email, setEmail] = useState('');

  useEffect(() => {
    const q = router.query.email as string;
    if (q) setEmail(q);
    else {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.email) setEmail(user.email);
      } catch {
        /* ignore */
      }
    }
  }, [router.query.email]);

  const { data, refetch } = useQuery(GET_MY_LISTINGS, {
    variables: { tenantId: tenant, email },
    skip: !email,
    errorPolicy: 'ignore' });

  const [createCheckout] = useMutation(CREATE_LISTING_CHECKOUT);
  const appUrl = getWebUrl();

  const pay = async (listingId: string) => {
    const returnUrl = `${appUrl}/listings/my?tenant=${tenant}&email=${encodeURIComponent(email)}&paid=1`;
    const { data: checkout } = await createCheckout({
      variables: { listingId, successUrl: returnUrl, cancelUrl: returnUrl } });
    if (checkout?.createListingCheckoutSession?.url) {
      window.location.href = checkout.createListingCheckoutSession.url;
    }
  };

  const listings = data?.myListings ?? [];

  return (
    <>
      <Head>
        <title>My listings — {tenant}</title>
      </Head>
      <AppLayout
        responsive
        sidebarSections={sidebarSections}
        user={layoutUser ?? undefined}
        logo={logo}
      >
        <div className="max-w-3xl mx-auto px-4 py-8">
          <h1 className="ios-large-title mb-4">My listing applications</h1>

          {!email && (
            <label className="flex flex-col gap-1 text-sm mb-6">
              <span className="text-secondary">Your email</span>
              <input className="ios-input" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
          )}

          <div className="grid gap-4">
            {listings.map(
              (l: {
                id: string;
                businessName: string;
                applicationStatus: string;
                publicationStatus: string;
                reviewerNotes?: string;
              }) => (
                <article key={l.id} className="ios-card p-5">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h2 className="font-semibold text-primary">{l.businessName}</h2>
                      <p className="text-sm text-secondary mt-1">
                        {STATUS_LABEL[l.applicationStatus] ?? l.applicationStatus}
                        {' · '}
                        {l.publicationStatus}
                      </p>
                      {l.reviewerNotes && <p className="text-sm mt-2 text-secondary">Note: {l.reviewerNotes}</p>}
                    </div>
                    {(l.applicationStatus === 'DRAFT' || l.applicationStatus === 'NEED_MORE_INFORMATION') && (
                      <Link
                        href={`/listings/edit/${l.id}?tenant=${encodeURIComponent(tenant)}`}
                        className="ios-btn-secondary shrink-0"
                      >
                        Edit
                      </Link>
                    )}
                    {(l.applicationStatus === 'AWAITING_PAYMENT' || l.applicationStatus === 'EXPIRED') && (
                      <button type="button" className="ios-btn-primary shrink-0" onClick={() => pay(l.id)}>
                        {l.applicationStatus === 'EXPIRED' ? 'Renew' : 'Pay & publish'}
                      </button>
                    )}
                  </div>
                </article>
              ),
            )}
            {email && listings.length === 0 && <p className="text-secondary text-sm">No applications yet.</p>}
          </div>

          <button type="button" className="ios-btn-secondary mt-6" onClick={() => refetch()}>
            Refresh
          </button>
        </div>
      </AppLayout>
    </>
  );
}

export const getServerSideProps = async (ctx: { query: { tenant?: string } }) => ({
  props: { tenant: ctx.query.tenant || 'demo' } });
