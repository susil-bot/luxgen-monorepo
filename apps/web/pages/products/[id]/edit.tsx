import { useEffect, useState } from 'react';
import { useAppShellConfig } from '../../../lib/app-shell-config';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from '@apollo/client';
import {
  AppLayout,
  SnackbarProvider,
  useSnackbar,
  ProductEditForm,
  DEFAULT_PRODUCT_EDIT_META,
  mapCourseToProductEditState,
  buildCourseUpdateInput,
  type ProductEditMeta,
  type ProductSeo,
  type ProductStatus } from '@luxgen/ui';
import { PageLoadingState } from '../../../components/common/PageStates';
import { createHandleUserAction } from '../../../lib/user-actions';
import { useLayoutUser } from '../../../lib/app-layout-user';
import { useAppLayoutHeader } from '../../../lib/app-layout-header';
import { GET_COURSE, UPDATE_COURSE } from '../../../graphql/queries/courses';
import { getTenantPageProps } from '../../../lib/tenant-page-props';
import { useActivityTimeline } from '../../../lib/use-activity-timeline';
import { useTenantScope } from '../../../lib/use-tenant-scope';

interface Props {
  tenant: string;
}

function EditProductContent({ tenant }: Props) {
  const { sidebarSections, logo } = useAppShellConfig();
  const router = useRouter();
  const { id } = router.query;
  const courseId = typeof id === 'string' ? id : '';
  const layoutUser = useLayoutUser();
  const { queryTenantId } = useTenantScope(tenant);
  const handleUserAction = createHandleUserAction(router);
  const headerProps = useAppLayoutHeader();
  const { showSuccess, showError } = useSnackbar();

  const [title, setTitle] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [seo, setSeo] = useState<ProductSeo>({ metaTitle: '', metaDescription: '', urlHandle: '' });
  const [meta, setMeta] = useState<ProductEditMeta>({ ...DEFAULT_PRODUCT_EDIT_META });
  const [status, setStatus] = useState<ProductStatus>('DRAFT');
  const [saving, setSaving] = useState(false);

  const { data, loading, error } = useQuery(GET_COURSE, {
    variables: { id: courseId },
    skip: !courseId });

  const [updateCourse] = useMutation(UPDATE_COURSE);

  const staffInitials =
    layoutUser?.name
      ?.split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2) ?? 'ST';
  const timeline = useActivityTimeline(queryTenantId, 'PRODUCT', courseId || undefined, staffInitials);

  useEffect(() => {
    const course = data?.course;
    if (!course) return;

    const state = mapCourseToProductEditState(course);
    setTitle(state.title);
    setBodyHtml(state.bodyHtml);
    setSeo(state.seo);
    setStatus(state.status);
    setMeta(state.meta);
  }, [data]);

  const handleMetaChange = (patch: Partial<ProductEditMeta>) => {
    setMeta((prev) => ({ ...prev, ...patch }));
  };

  const handleSeoChange = (patch: Partial<ProductSeo>) => {
    setSeo((prev) => ({ ...prev, ...patch }));
  };

  const handleSave = async () => {
    if (!courseId || !title.trim()) {
      showError('Title is required');
      return;
    }
    setSaving(true);
    try {
      await updateCourse({
        variables: {
          id: courseId,
          input: buildCourseUpdateInput({ title, bodyHtml, seo, meta, status }) } });
      showSuccess('Product saved');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (!courseId) {
    return <PageLoadingState label="Loading product…" />;
  }

  if (loading && !data) {
    return <PageLoadingState label="Loading product…" />;
  }

  if (error && !data) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-secondary">{error.message}</p>
        <Link href="/products" className="ios-btn-primary mt-4 inline-block">
          Back to products
        </Link>
      </div>
    );
  }

  const enrollmentCount = data?.course?.students?.length ?? 0;

  return (
    <>
      <Head>
        <title>
          {title || 'Edit product'} — {tenant}
        </title>
      </Head>

      <AppLayout
        sidebarSections={sidebarSections}
        user={layoutUser ?? undefined}
        logo={logo}
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
          enrollmentCount={enrollmentCount}
          saving={saving}
          onTitleChange={setTitle}
          onBodyChange={setBodyHtml}
          onSeoChange={handleSeoChange}
          onMetaChange={handleMetaChange}
          onStatusChange={setStatus}
          onSave={() => void handleSave()}
          timeline={timeline}
        />
      </AppLayout>
    </>
  );
}

export default function EditProductPage(props: Props) {
  return (
    <SnackbarProvider position="top-right" maxSnackbars={3}>
      <EditProductContent {...props} />
    </SnackbarProvider>
  );
}
