import Head from 'next/head';
import Link from 'next/link';
import { useQuery } from '@apollo/client';

import { LearnLayout } from '../../components/learn/LearnLayout';
import { PageLoadingState } from '../../components/common/PageStates';
import { getStoredUser } from '../../lib/session';
import { GET_COURSES } from '../../graphql/queries/courses';
import { GET_TENANT } from '../../graphql/queries/tenants';
import {
  filterPublishedCourses,
  formatInstructorName,
  learnStoreServerProps,
  type LearnCourse,
} from '../../lib/learn-store';

interface Props {
  tenantSubdomain: string;
}

export default function LearnCatalogPage({ tenantSubdomain }: Props) {
  const { data: tenantData, loading: tenantLoading } = useQuery(GET_TENANT, {
    variables: { subdomain: tenantSubdomain },
  });

  const tenantId = tenantData?.tenantBySubdomain?.id as string | undefined;
  const tenantName = tenantData?.tenantBySubdomain?.name as string | undefined;
  const tenantSettings = tenantData?.tenantBySubdomain?.settings;

  const {
    data,
    loading: coursesLoading,
    error,
  } = useQuery(GET_COURSES, {
    skip: !tenantId,
    variables: { tenantId: tenantId ?? '' },
  });

  const catalogLoading = tenantLoading || (Boolean(tenantId) && coursesLoading);
  const pageTitle = tenantName ? `Learn — ${tenantName}` : `Learn — ${tenantSubdomain}`;

  const courses = filterPublishedCourses((data?.courses as LearnCourse[] | undefined) ?? []);
  const sessionUser = typeof window !== 'undefined' ? getStoredUser() : null;
  const progressPercent = sessionUser ? Math.min(100, courses.length * 10) : 0;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={`Browse training courses from ${tenantName ?? tenantSubdomain}`} />
      </Head>

      <LearnLayout tenantSubdomain={tenantSubdomain} tenantName={tenantName} tenantSettings={tenantSettings}>
        {sessionUser && (
          <div className="ios-card p-4 mb-6 flex items-center gap-4">
            <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden="true">
              <circle cx="28" cy="28" r="24" fill="none" stroke="var(--color-fill-tertiary)" strokeWidth="6" />
              <circle cx="28" cy="28" r="24" fill="none" stroke="var(--color-blue)" strokeWidth="6" strokeDasharray={`${progressPercent * 1.51} 151`} transform="rotate(-90 28 28)" />
            </svg>
            <div>
              <p className="font-semibold text-primary">Your learning progress</p>
              <p className="text-sm text-secondary">{progressPercent}% — based on catalog activity</p>
            </div>
          </div>
        )}
        <header className="mb-8">
          <h1 className="ios-large-title">Training catalog</h1>
          <p className="mt-1 text-secondary text-sm">Expert-led courses — sign in to enroll and start learning</p>
          <div className="flex flex-wrap gap-3 mt-4 text-sm">
            <Link href="/store/product" style={{ color: 'var(--color-blue)' }}>
              GPT Store →
            </Link>
            <Link href="/store/collections" style={{ color: 'var(--color-blue)' }}>
              Collections →
            </Link>
            <Link href="/store/bundles" style={{ color: 'var(--color-blue)' }}>
              Bundles →
            </Link>
          </div>
        </header>

        {catalogLoading && <PageLoadingState label="Loading courses…" />}

        {error && (
          <p className="text-sm" style={{ color: 'var(--color-red)' }}>
            {error.message || 'Could not load courses.'}
          </p>
        )}

        {!catalogLoading && !error && courses.length === 0 && (
          <div className="ios-empty-state ios-card py-12">
            <p className="empty-title">No courses yet</p>
            <p className="empty-subtitle">Check back soon for new training.</p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {courses.map((course) => {
            const instructor = formatInstructorName(course);
            return (
              <Link
                key={course.id}
                href={`/learn/courses/${course.id}`}
                className="ios-card p-5 block hover:opacity-95 transition-opacity"
              >
                <h2 className="font-semibold text-primary text-lg">{course.title}</h2>
                {instructor && <p className="text-xs text-secondary mt-1">With {instructor}</p>}
                {course.description && <p className="text-sm text-secondary mt-2 line-clamp-3">{course.description}</p>}
                <span className="inline-block mt-4 text-sm font-medium" style={{ color: 'var(--color-blue)' }}>
                  View course →
                </span>
              </Link>
            );
          })}
        </div>
      </LearnLayout>
    </>
  );
}

export const getServerSideProps = learnStoreServerProps;
