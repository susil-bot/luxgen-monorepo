import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useMutation } from '@apollo/client';
import {
  AppLayout,
  getDefaultLogo,
  getDefaultSidebarSections,
  SnackbarProvider,
  useSnackbar,
  ProductEditForm,
  ProductEditTranslations,
  DEFAULT_PRODUCT_EDIT_META,
  buildCourseCreateInput,
  buildCourseUpdateInput,
  type ProductEditMeta,
  type ProductSeo,
  type ProductStatus,
} from '@luxgen/ui';
import { createHandleUserAction } from '../../lib/user-actions';
import { useLayoutUser, useAppTenantId } from '../../lib/app-layout-user';
import { getStoredUser } from '../../lib/session';
import { CREATE_COURSE, UPDATE_COURSE } from '../../graphql/queries/courses';
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
  const [bodyHtml, setBodyHtml] = useState('');
  const [seo, setSeo] = useState<ProductSeo>({ metaTitle: '', metaDescription: '', urlHandle: '' });
  const [meta, setMeta] = useState<ProductEditMeta>({ ...DEFAULT_PRODUCT_EDIT_META });
  const [status, setStatus] = useState<ProductStatus>('DRAFT');
  const [saving, setSaving] = useState(false);

  const [createCourse] = useMutation(CREATE_COURSE);
  const [updateCourse] = useMutation(UPDATE_COURSE);

  const handleMetaChange = (patch: Partial<ProductEditMeta>) => {
    setMeta((prev) => ({ ...prev, ...patch }));
  };

  const handleSeoChange = (patch: Partial<ProductSeo>) => {
    setSeo((prev) => ({ ...prev, ...patch }));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      showError('Title is required');
      return;
    }

    const instructorId = sessionUser?.id;
    const tid = tenantId ?? sessionUser?.tenant.id ?? tenant;
    if (!instructorId || !tid) {
      showError('Sign in required');
      return;
    }

    setSaving(true);
    try {
      const { data } = await createCourse({
        variables: {
          input: buildCourseCreateInput({ title, bodyHtml, seo, meta }, instructorId, tid),
        },
      });

      const id = data?.createCourse?.id as string | undefined;
      if (!id) {
        showError('Create failed — no product id returned');
        return;
      }

      if (status !== 'DRAFT') {
        await updateCourse({
          variables: {
            id,
            input: buildCourseUpdateInput({ title, bodyHtml, seo, meta, status }),
          },
        });
      }

      showSuccess('Product created');
      void router.push(`/products/${id}/edit`);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Create failed');
    } finally {
      setSaving(false);
    }
  };

  const t = ProductEditTranslations.en;

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
        <ProductEditForm
          tenant={tenant}
          title={title}
          bodyHtml={bodyHtml}
          seo={seo}
          meta={meta}
          status={status}
          enrollmentCount={0}
          saving={saving}
          saveLabel={t.create}
          savingLabel={t.creating}
          onTitleChange={setTitle}
          onBodyChange={setBodyHtml}
          onSeoChange={handleSeoChange}
          onMetaChange={handleMetaChange}
          onStatusChange={setStatus}
          onSave={() => void handleSave()}
        />
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
