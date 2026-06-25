import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useMutation } from '@apollo/client';
import { AppLayout, getDefaultSidebarSections, getDefaultUser, getDefaultLogo } from '@luxgen/ui';
import { CREATE_LISTING_DRAFT, SUBMIT_LISTING } from '../../graphql/queries/listings';

interface Props {
  tenant: string;
}

export default function ApplyListingPage({ tenant }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    applicantEmail: '',
    applicantName: '',
    businessName: '',
    description: '',
    category: '',
    website: '',
    phone: '',
  });

  const [createDraft] = useMutation(CREATE_LISTING_DRAFT);
  const [submitListing] = useMutation(SUBMIT_LISTING);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!form.applicantEmail.trim() || !form.businessName.trim()) {
      setFormError('Email and business name are required.');
      return;
    }
    const { data } = await createDraft({
      variables: {
        input: { tenantId: tenant, ...form },
      },
    });
    const id = data?.createListingDraft?.id;
    if (!id) return;

    await submitListing({ variables: { id } });
    router.push(`/listings/my?tenant=${encodeURIComponent(tenant)}&email=${encodeURIComponent(form.applicantEmail)}`);
  };

  return (
    <>
      <Head>
        <title>Apply for listing — {tenant}</title>
      </Head>
      <AppLayout sidebarSections={getDefaultSidebarSections()} user={getDefaultUser()} logo={getDefaultLogo()}>
        <div className="max-w-lg mx-auto px-4 py-8">
          <h1 className="ios-large-title mb-2">List your business</h1>
          <p className="text-sm text-secondary mb-6">
            Submit your profile for editorial review. Once approved, pay to publish. Your listing stays live while your
            subscription is active.
          </p>

          {formError && (
            <p role="alert" className="text-red-600 text-sm">
              {formError}
            </p>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {(['applicantEmail', 'applicantName', 'businessName', 'category', 'website', 'phone'] as const).map(
              (field) => (
                <label key={field} className="flex flex-col gap-1 text-sm">
                  <span className="text-secondary capitalize">{field.replace(/([A-Z])/g, ' $1')}</span>
                  <input
                    className="ios-input"
                    required={field === 'applicantEmail' || field === 'businessName'}
                    value={form[field]}
                    onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                  />
                </label>
              ),
            )}
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-secondary">Description</span>
              <textarea
                className="ios-input min-h-[100px]"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </label>
            <button type="submit" className="ios-btn-primary mt-2">
              Submit application
            </button>
          </form>
        </div>
      </AppLayout>
    </>
  );
}

export const getServerSideProps = async (ctx: { query: { tenant?: string } }) => ({
  props: { tenant: ctx.query.tenant || 'demo' },
});
