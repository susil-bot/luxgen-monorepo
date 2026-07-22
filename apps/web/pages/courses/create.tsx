import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useMutation } from '@apollo/client';
import { AppLayout, SnackbarProvider, useSnackbar } from '@luxgen/ui';
import { TenantBanner } from '../../components/tenant/TenantBanner';
import { CREATE_COURSE } from '../../graphql/queries/courses';
import { useCommercePageShell } from '../../lib/commerce-page-shell';
import { useAppTenantId } from '../../lib/app-layout-user';
import { getStoredUser } from '../../lib/session';
import { isMongoObjectId } from '../../lib/mongo-id';
import { getTenantPageProps } from '../../lib/tenant-page-props';
function CreateCourseContent({ tenant }: { tenant: string }) {
  const router = useRouter();
  const { appLayoutProps } = useCommercePageShell();
  const { showSuccess, showError } = useSnackbar();
  const tenantId = useAppTenantId();
  const sessionUser = typeof window !== 'undefined' ? getStoredUser() : null;
  const queryTenantId = tenantId ?? sessionUser?.tenant.id;
  const instructorId = sessionUser?.id;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [createCourse] = useMutation(CREATE_COURSE);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMongoObjectId(queryTenantId) || !instructorId) {
      showError('Sign in to create a course.');
      return;
    }
    setIsSubmitting(true);
    try {
      const { data } = await createCourse({
        variables: {
          input: {
            title: title.trim(),
            description: description.trim() || undefined,
            instructorId,
            tenantId: queryTenantId,
          },
        },
      });
      const newId = data?.createCourse?.id;
      if (!newId) {
        showError('Create failed.');
        return;
      }
      showSuccess('Course created');
      void router.push(`/courses/${newId}`);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <>
      <Head>
        <title>Create Course</title>
      </Head>
      <AppLayout {...appLayoutProps}>
        <TenantBanner tenant={tenant} />
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-4 py-8 space-y-4">
          <h1 className="ios-large-title">Create New Course</h1>
          <input
            className="input-field"
            required
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="input-field"
            rows={4}
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button type="submit" className="ios-btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Creating…' : 'Create Course'}
          </button>
        </form>
      </AppLayout>
    </>
  );
}
export default function CreateCourse(p: { tenant: string }) {
  return (
    <SnackbarProvider>
      <CreateCourseContent {...p} />
    </SnackbarProvider>
  );
}
export const getServerSideProps = getTenantPageProps;
