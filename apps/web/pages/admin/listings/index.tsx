import { useState } from 'react';
import Head from 'next/head';
import { useQuery, useMutation } from '@apollo/client';
import { AppLayout, getDefaultSidebarSections, getDefaultUser, getDefaultLogo } from '@luxgen/ui';
import {
  GET_LISTINGS_FOR_REVIEW,
  APPROVE_LISTING,
  REJECT_LISTING,
  REQUEST_LISTING_INFO,
} from '../../../graphql/queries/listings';

interface Props {
  tenant: string;
}

export default function AdminListingsPage({ tenant }: Props) {
  const [notes, setNotes] = useState<Record<string, string>>({});
  const { data, refetch } = useQuery(GET_LISTINGS_FOR_REVIEW, {
    variables: { tenantId: tenant },
    errorPolicy: 'ignore',
  });

  const [approve] = useMutation(APPROVE_LISTING);
  const [reject] = useMutation(REJECT_LISTING);
  const [requestInfo] = useMutation(REQUEST_LISTING_INFO);

  const listings = data?.listingsForReview ?? [];

  const run = async (fn: () => Promise<unknown>) => {
    await fn();
    await refetch();
  };

  return (
    <>
      <Head>
        <title>Review listings — {tenant}</title>
      </Head>
      <AppLayout
        responsive
        sidebarSections={getDefaultSidebarSections()}
        user={getDefaultUser()}
        logo={getDefaultLogo()}
      >
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="ios-large-title mb-2">Editorial review</h1>
          <p className="text-sm text-secondary mb-6">
            Review applications. Approved listings move to payment — publication is automatic after payment while
            subscription stays active.
          </p>

          <div className="grid gap-6">
            {listings.map(
              (l: {
                id: string;
                businessName: string;
                applicantEmail: string;
                applicantName?: string;
                applicationStatus: string;
                description?: string;
                category?: string;
              }) => (
                <article key={l.id} className="ios-card p-5">
                  <h2 className="font-semibold text-primary">{l.businessName}</h2>
                  <p className="text-sm text-secondary">
                    {l.applicantName || l.applicantEmail} · {l.applicationStatus}
                  </p>
                  {l.description && <p className="text-sm mt-2 text-secondary">{l.description}</p>}

                  <textarea
                    className="ios-input w-full mt-4 min-h-[80px]"
                    placeholder="Reviewer notes (required for reject / request info)"
                    value={notes[l.id] || ''}
                    onChange={(e) => setNotes((n) => ({ ...n, [l.id]: e.target.value }))}
                  />

                  <div className="flex flex-wrap gap-2 mt-3">
                    <button
                      type="button"
                      className="ios-btn-primary"
                      onClick={() => run(() => approve({ variables: { id: l.id } }))}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className="ios-btn-secondary"
                      onClick={() => {
                        const n = notes[l.id]?.trim();
                        if (!n) return;
                        run(() => requestInfo({ variables: { id: l.id, notes: n } }));
                      }}
                    >
                      Request info
                    </button>
                    <button
                      type="button"
                      className="ios-btn-secondary"
                      style={{ color: 'var(--color-red)' }}
                      onClick={() => {
                        const n = notes[l.id]?.trim();
                        if (!n) return;
                        run(() => reject({ variables: { id: l.id, notes: n } }));
                      }}
                    >
                      Reject
                    </button>
                  </div>
                </article>
              ),
            )}
            {listings.length === 0 && <p className="text-secondary text-sm">No applications pending review.</p>}
          </div>
        </div>
      </AppLayout>
    </>
  );
}

export const getServerSideProps = async (ctx: { query: { tenant?: string } }) => ({
  props: { tenant: ctx.query.tenant || 'demo' },
});
