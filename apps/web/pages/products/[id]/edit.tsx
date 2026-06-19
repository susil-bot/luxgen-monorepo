import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from '@apollo/client';
import { AppLayout, getDefaultLogo, getDefaultSidebarSections, SnackbarProvider, useSnackbar } from '@luxgen/ui';
import { PageLoadingState } from '../../../components/common/PageStates';
import { SimpleRichTextEditor } from '../../../components/products/SimpleRichTextEditor';
import { createHandleUserAction } from '../../../lib/user-actions';
import { useLayoutUser } from '../../../lib/app-layout-user';
import { GET_COURSE, UPDATE_COURSE } from '../../../graphql/queries/courses';
import { parseProductDescription, serializeProductDescription, type ProductSeo } from '../../../lib/product-seo';
import { getTenantPageProps } from '../../../lib/tenant-page-props';
import { useAppLayoutHeader } from '../../../lib/app-layout-header';

interface Props {
  tenant: string;
}

type WizardStep = 'details' | 'seo' | 'publish';

const STEPS: { id: WizardStep; label: string }[] = [
  { id: 'details', label: 'Details' },
  { id: 'seo', label: 'SEO' },
  { id: 'publish', label: 'Publish' },
];

function EditProductContent({ tenant }: Props) {
  const router = useRouter();
  const { id } = router.query;
  const courseId = typeof id === 'string' ? id : '';
  const layoutUser = useLayoutUser();
  const handleUserAction = createHandleUserAction(router);
  const headerProps = useAppLayoutHeader();
  const { showSuccess, showError } = useSnackbar();

  const [step, setStep] = useState<WizardStep>('details');
  const [title, setTitle] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [seo, setSeo] = useState<ProductSeo>({ metaTitle: '', metaDescription: '', urlHandle: '' });
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED' | 'COMPLETED' | 'CANCELLED'>('DRAFT');
  const [saving, setSaving] = useState(false);

  const { data, loading, error } = useQuery(GET_COURSE, {
    variables: { id: courseId },
    skip: !courseId,
  });

  const [updateCourse] = useMutation(UPDATE_COURSE);

  useEffect(() => {
    const course = data?.course;
    if (!course) return;
    setTitle(course.title ?? '');
    const parsed = parseProductDescription(course.description);
    setBodyHtml(parsed.bodyHtml);
    setSeo(parsed.seo);
    setStatus(course.status ?? 'DRAFT');
    if (!parsed.seo.metaTitle && course.title) {
      setSeo((prev) => ({ ...prev, metaTitle: course.title }));
    }
  }, [data]);

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
            description: serializeProductDescription(bodyHtml, seo),
            status,
          },
        },
      });
      showSuccess('Product saved');
      void router.push('/products');
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

  return (
    <>
      <Head>
        <title>Edit product — {tenant}</title>
      </Head>

      <AppLayout
        sidebarSections={getDefaultSidebarSections()}
        user={layoutUser ?? undefined}
        logo={getDefaultLogo()}
        onUserAction={handleUserAction}
        {...headerProps}
        responsive
      >
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
          <Link href="/products" className="ios-btn-plain text-sm">
            ← Products
          </Link>
          <h1 className="ios-large-title">Edit product</h1>

          <nav className="flex gap-2 flex-wrap">
            {STEPS.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`ios-btn-secondary text-sm ${step === s.id ? 'ring-2 ring-[var(--color-blue)]' : ''}`}
                onClick={() => setStep(s.id)}
              >
                {s.label}
              </button>
            ))}
          </nav>

          <div className="ios-card p-6 space-y-4">
            {step === 'details' && (
              <>
                <div className="ios-form-group">
                  <label htmlFor="title">Title</label>
                  <input
                    id="title"
                    className="ios-input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="ios-form-group">
                  <label>Description</label>
                  <SimpleRichTextEditor value={bodyHtml} onChange={setBodyHtml} />
                </div>
              </>
            )}

            {step === 'seo' && (
              <>
                <div className="ios-form-group">
                  <label htmlFor="metaTitle">Meta title</label>
                  <input
                    id="metaTitle"
                    className="ios-input"
                    value={seo.metaTitle}
                    onChange={(e) => setSeo((prev) => ({ ...prev, metaTitle: e.target.value }))}
                    maxLength={70}
                  />
                  <p className="text-xs text-tertiary">{seo.metaTitle.length}/70</p>
                </div>
                <div className="ios-form-group">
                  <label htmlFor="metaDescription">Meta description</label>
                  <textarea
                    id="metaDescription"
                    className="ios-input min-h-[100px]"
                    value={seo.metaDescription}
                    onChange={(e) => setSeo((prev) => ({ ...prev, metaDescription: e.target.value }))}
                    maxLength={160}
                  />
                  <p className="text-xs text-tertiary">{seo.metaDescription.length}/160</p>
                </div>
                <div className="ios-form-group">
                  <label htmlFor="urlHandle">URL handle</label>
                  <input
                    id="urlHandle"
                    className="ios-input"
                    placeholder="advanced-react-course"
                    value={seo.urlHandle}
                    onChange={(e) => setSeo((prev) => ({ ...prev, urlHandle: e.target.value }))}
                  />
                </div>
              </>
            )}

            {step === 'publish' && (
              <>
                <p className="text-secondary text-sm">Choose catalog visibility for this product.</p>
                <div className="flex flex-col gap-2">
                  {(['DRAFT', 'PUBLISHED', 'COMPLETED', 'CANCELLED'] as const).map((value) => (
                    <label key={value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value={value}
                        checked={status === value}
                        onChange={() => setStatus(value)}
                      />
                      <span className="text-primary capitalize">{value.toLowerCase()}</span>
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              className="ios-btn-secondary"
              disabled={step === 'details'}
              onClick={() => setStep(step === 'seo' ? 'details' : 'seo')}
            >
              Back
            </button>
            <div className="flex gap-2">
              {step !== 'publish' ? (
                <button
                  type="button"
                  className="ios-btn-primary"
                  onClick={() => setStep(step === 'details' ? 'seo' : 'publish')}
                >
                  Continue
                </button>
              ) : (
                <button type="button" className="ios-btn-primary" disabled={saving} onClick={() => void handleSave()}>
                  {saving ? 'Saving…' : 'Save product'}
                </button>
              )}
            </div>
          </div>
        </div>
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
