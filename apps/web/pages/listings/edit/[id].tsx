import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from '@apollo/client';
import { AppLayout, getDefaultSidebarSections, getDefaultLogo, SnackbarProvider, useSnackbar } from '@luxgen/ui';
import { GET_LISTING, UPDATE_LISTING_DRAFT } from '../../../graphql/queries/listings';
import { useLayoutUser } from '../../../lib/app-layout-user';
import { useAppLayoutHeader } from '../../../lib/app-layout-header';
import { createHandleUserAction } from '../../../lib/user-actions';

interface Props {
  tenant: string;
}

const EDITABLE_STATUSES = new Set(['DRAFT', 'NEED_MORE_INFORMATION']);

function EditListingContent({ tenant }: Props) {
  const router = useRouter();
  const id = typeof router.query.id === 'string' ? router.query.id : '';
  const layoutUser = useLayoutUser();
  const headerProps = useAppLayoutHeader();
  const handleUserAction = createHandleUserAction(router);
  const { showSuccess, showError } = useSnackbar();

  const { data, loading } = useQuery(GET_LISTING, { variables: { id }, skip: !id });
  const listing = data?.listing;

  const [businessName, setBusinessName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [website, setWebsite] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [hydrated, setHydrated] = useState(false);
  const [saving, setSaving] = useState(false);

  if (listing && !hydrated) {
    setBusinessName(listing.businessName ?? '');
    setDescription(listing.description ?? '');
    setCategory(listing.category ?? '');
    setWebsite(listing.website ?? '');
    setPhone(listing.phone ?? '');
    setAddress(listing.address ?? '');
    setHydrated(true);
  }

  const [updateDraft] = useMutation(UPDATE_LISTING_DRAFT);

  const canEdit = listing && EDITABLE_STATUSES.has(listing.applicationStatus);

  const handleSave = async () => {
    if (!id || !canEdit) return;
    setSaving(true);
    try {
      await updateDraft({
        variables: {
          id,
          input: {
            businessName: businessName.trim(),
            description: description.trim() || undefined,
            category: category.trim() || undefined,
            website: website.trim() || undefined,
            phone: phone.trim() || undefined,
            address: address.trim() || undefined,
          },
        },
      });
      showSuccess('Listing updated');
      void router.push(`/listings/my?tenant=${encodeURIComponent(tenant)}`);
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : 'Could not save listing');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Head>
        <title>Edit listing — {tenant}</title>
      </Head>
      <AppLayout
        sidebarSections={getDefaultSidebarSections()}
        user={layoutUser ?? undefined}
        logo={getDefaultLogo()}
        onUserAction={handleUserAction}
        {...headerProps}
      >
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Link href={`/listings/my?tenant=${encodeURIComponent(tenant)}`} className="text-sm text-secondary">
            ← My listings
          </Link>
          <h1 className="ios-large-title mt-4">Edit listing</h1>

          {loading && <p className="text-secondary text-sm mt-4">Loading…</p>}
          {listing && !canEdit && (
            <p className="text-secondary text-sm mt-4">
              This listing cannot be edited in status {listing.applicationStatus}.
            </p>
          )}

          {listing && canEdit && (
            <div className="ios-card p-6 mt-4 space-y-4">
              <div className="ios-form-group">
                <label htmlFor="businessName">Business name</label>
                <input id="businessName" className="ios-input" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
              </div>
              <div className="ios-form-group">
                <label htmlFor="description">Description</label>
                <textarea id="description" className="ios-input" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="ios-form-group">
                <label htmlFor="category">Category</label>
                <input id="category" className="ios-input" value={category} onChange={(e) => setCategory(e.target.value)} />
              </div>
              <div className="ios-form-group">
                <label htmlFor="website">Website</label>
                <input id="website" className="ios-input" value={website} onChange={(e) => setWebsite(e.target.value)} />
              </div>
              <div className="ios-form-group">
                <label htmlFor="phone">Phone</label>
                <input id="phone" className="ios-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="ios-form-group">
                <label htmlFor="address">Address</label>
                <input id="address" className="ios-input" value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
              <button type="button" className="ios-btn-primary" disabled={saving} onClick={() => void handleSave()}>
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          )}
        </div>
      </AppLayout>
    </>
  );
}

export default function EditListingPage(props: Props) {
  return (
    <SnackbarProvider position="top-right" maxSnackbars={3}>
      <EditListingContent {...props} />
    </SnackbarProvider>
  );
}

export const getServerSideProps = async (ctx: { query: { tenant?: string } }) => ({
  props: { tenant: ctx.query.tenant || 'demo' },
});
