import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMutation } from '@apollo/client';
import { AppLayout, getDefaultLogo, getDefaultSidebarSections, SnackbarProvider, useSnackbar } from '@luxgen/ui';
import { createHandleUserAction } from '../../lib/user-actions';
import { useLayoutUser, useAppTenantId } from '../../lib/app-layout-user';
import { getStoredUser } from '../../lib/session';
import { CREATE_COURSE } from '../../graphql/queries/courses';
import { getTenantPageProps } from '../../lib/tenant-page-props';
import { useAppLayoutHeader } from '../../lib/app-layout-header';

interface Props {
  tenant: string;
}

function CreateProductContent({ tenant }: Props) {
  const router = useRouter();
  const layoutUser = useLayoutUser();
  const handleUserAction = createHandleUserAction(router);
  const headerProps = useAppLayoutHeader();
  const { showSuccess, showError } = useSnackbar();
  const tenantId = useAppTenantId();
  const sessionUser = typeof window !== 'undefined' ? getStoredUser() : null;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const [createCourse, { loading }] = useMutation(CREATE_COURSE);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const instructorId = sessionUser?.id;
    const tid = tenantId ?? sessionUser?.tenant.id;
    if (!instructorId || !tid) {
      showError('Sign in required');
      return;
    }

    try {
      const { data } = await createCourse({
        variables: {
          input: {
            title: title.trim(),
            description: description.trim() || undefined,
            instructorId,
            tenantId: tid,
          },
        },
      });
      showSuccess('Product created');
      const id = data?.createCourse?.id;
      void router.push(id ? `/products/${id}/edit` : '/products');
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : 'Create failed');
    }
  };

  return (
    <>
      <Head>
        <title>Add product — {tenant}</title>
      </Head>

      <AppLayout
        sidebarSections={getDefaultSidebarSections()}
        user={layoutUser ?? undefined}
        logo={getDefaultLogo()}
        onUserAction={handleUserAction}
        {...headerProps}
        responsive
      >
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
          <Link href="/products" className="ios-btn-plain text-sm">
            ← Products
          </Link>
          <h1 className="ios-large-title">Add product</h1>

          <form onSubmit={(e) => void handleSubmit(e)} className="ios-card p-6 space-y-4">
            <div className="ios-form-group">
              <label htmlFor="title">Title</label>
              <input id="title" className="ios-input" required value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="ios-form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                className="ios-input min-h-[120px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <p className="text-xs text-tertiary">Creates a Course (draft). Pricing, variants, SEO — Phase 2.</p>
            <button type="submit" className="ios-btn-primary" disabled={loading}>
              {loading ? 'Creating…' : 'Save product'}
            </button>
          </form>
        </div>
      </AppLayout>
    </>
  );
}

export default function CreateProductPage(props: Props) {
  return (
    <SnackbarProvider position="top-right" maxSnackbars={3}>
      <CreateProductContent {...props} />
    </SnackbarProvider>
  );
}

export const getServerSideProps = getTenantPageProps;
