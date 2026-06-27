import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useMutation } from '@apollo/client';
import { AppLayout, getDefaultSidebarSections, getDefaultUser, getDefaultLogo } from '@luxgen/ui';
import { createHandleUserAction } from '../../lib/user-actions';
import { TenantBanner } from '../../components/tenant/TenantBanner';
import { CREATE_COURSE } from '../../graphql/queries/courses';

export default function CreateCourse({ tenant }: { tenant: string }) {
  const router = useRouter();
  const [createCourse] = useMutation(CREATE_COURSE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await createCourse({
      variables: {
        input: {
          title,
          description,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'DRAFT',
        },
      },
    });
    await router.push(`/courses?tenant=${encodeURIComponent(tenant)}`);
  };

  return (
    <>
      <Head>
        <title>Create Course - LuxGen</title>
      </Head>
      <AppLayout
        sidebarSections={getDefaultSidebarSections()}
        user={getDefaultUser()}
        onUserAction={createHandleUserAction(router)}
        logo={getDefaultLogo()}
      >
        <TenantBanner tenant={tenant} />
        <form onSubmit={onSubmit} className="max-w-3xl mx-auto px-4 py-8 space-y-4">
          <input
            className="input-field"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Title"
          />
          <textarea
            className="input-field"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            placeholder="Description"
          />
          <button type="submit" className="ios-btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Course'}
          </button>
        </form>
      </AppLayout>
    </>
  );
}
