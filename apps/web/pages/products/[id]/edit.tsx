import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from '@apollo/client';
import { AppLayout, getDefaultLogo, getDefaultSidebarSections, SnackbarProvider, useSnackbar } from '@luxgen/ui';
import { PageLoadingState } from '../../../components/common/PageStates';
import { ProductEditForm } from '../../../components/products/edit/ProductEditForm';
import { createHandleUserAction } from '../../../lib/user-actions';
import { useLayoutUser } from '../../../lib/app-layout-user';
import { useAppLayoutHeader } from '../../../lib/app-layout-header';
import { GET_COURSE, UPDATE_COURSE } from '../../../graphql/queries/courses';
import {
  DEFAULT_PRODUCT_EDIT_META,
  parseProductEditRecord,
  serializeProductEditRecord,
  type ProductEditMeta,
} from '../../../lib/product-edit-meta';
import type { ProductSeo } from '../../../lib/product-seo';
import { courseToProductRow, type ProductStatus } from '../../../lib/product-display';
import { getTenantPageProps } from '../../../lib/tenant-page-props';

interface Props {
  tenant: string;
}

function EditProductContent({ tenant }: Props) {
  const router = useRouter();
  const { id } = router.query;
  const courseId = typeof id === 'string' ? id : '';
  const layoutUser = useLayoutUser();
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
    skip: !courseId,
  });

  const [updateCourse] = useMutation(UPDATE_COURSE);

  useEffect(() => {
    const course = data?.course;
    if (!course) return;

    const parsed = parseProductEditRecord(course.description);
    setTitle(course.title ?? '');
    setBodyHtml(parsed.bodyHtml);
    setSeo(
      parsed.seo.metaTitle
        ? parsed.seo
        : { ...parsed.seo, metaTitle: course.title ?? '' },
    );
    setStatus((course.status as ProductStatus) ?? 'DRAFT');

    const row = courseToProductRow(course);
    setMeta({
      ...parsed.meta,
      vendor: parsed.meta.vendor || row.vendor,
      sku: parsed.meta.sku || row.sku,
      productType: parsed.meta.productType || row.productType,
    });
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
          input: {
            title: title.trim(),
            description: serializeProductEditRecord(bodyHtml, seo, meta),
            status,
          },
        },
      });
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
        <title>{title || 'Edit product'} — {tenant}</title>
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
          enrollmentCount={enrollmentCount}
          saving={saving}
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

export default function EditProductPage(props: Props) {
  return (
    <SnackbarProvider position="top-right" maxSnackbars={3}>
      <EditProductContent {...props} />
    </SnackbarProvider>
  );
}

export const getServerSideProps = getTenantPageProps;
