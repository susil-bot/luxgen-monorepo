import Head from 'next/head';
import Link from 'next/link';
import { useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';

import { LearnLayout } from '../../../components/learn/LearnLayout';
import { PageLoadingState } from '../../../components/common/PageStates';
import { GET_COURSE } from '../../../graphql/queries/courses';
import { GET_ENROLLMENT } from '../../../graphql/queries/enrollment';
import { GET_TENANT } from '../../../graphql/queries/tenants';
import { formatInstructorName, learnStoreServerProps, type LearnCourse } from '../../../lib/learn-store';
import { getStoredUser } from '../../../lib/session';
import { useLearnEnroll } from '../../../lib/use-learn-enroll';

interface Props {
  tenantSubdomain: string;
}

export default function LearnCourseDetailPage({ tenantSubdomain }: Props) {
  const router = useRouter();
  const courseId = router.query.id as string;

  const { data: tenantData } = useQuery(GET_TENANT, {
    variables: { subdomain: tenantSubdomain },
  });
  const tenantName = tenantData?.tenantBySubdomain?.name as string | undefined;
  const tenantSettings = tenantData?.tenantBySubdomain?.settings;

  const { data, loading, error } = useQuery(GET_COURSE, {
    skip: !courseId,
    variables: { id: courseId },
  });

  const course = data?.course as LearnCourse | undefined;
  const user = typeof window !== 'undefined' ? getStoredUser() : null;

  const { data: enrollmentData, refetch: refetchEnrollment } = useQuery(GET_ENROLLMENT, {
    skip: !courseId || !user?.id,
    variables: { courseId, studentId: user?.id ?? '' },
  });

  const isEnrolled = Boolean(enrollmentData?.enrollment?.id);
  const returnPath = `/learn/courses/${courseId}`;

  const {
    enroll,
    loading: enrolling,
    error: enrollError,
    success,
  } = useLearnEnroll({
    courseId,
    returnPath,
  });

  useEffect(() => {
    if (success) {
      void refetchEnrollment();
    }
  }, [success, refetchEnrollment]);

  const instructor = course ? formatInstructorName(course) : null;
  const isPublished = course?.status === 'PUBLISHED';

  return (
    <>
      <Head>
        <title>{course?.title ? `${course.title} — Learn` : 'Course — Learn'}</title>
      </Head>

      <LearnLayout tenantSubdomain={tenantSubdomain} tenantName={tenantName} tenantSettings={tenantSettings}>
        <Link href="/learn" className="ios-btn-plain text-sm mb-4 inline-flex">
          ← Catalog
        </Link>

        {loading && <PageLoadingState label="Loading course…" />}

        {error && (
          <p className="text-sm" style={{ color: 'var(--color-red)' }}>
            {error.message || 'Course not found.'}
          </p>
        )}

        {course && (
          <article className="space-y-6">
            <header>
              <h1 className="ios-large-title">{course.title}</h1>
              {instructor && <p className="text-secondary text-sm mt-2">Instructor: {instructor}</p>}
              {!isPublished && (
                <p className="text-xs mt-2 uppercase tracking-wide text-secondary">Status: {course.status}</p>
              )}
            </header>

            {course.description && (
              <section className="ios-card p-5">
                <h2 className="font-semibold text-primary mb-2">About this course</h2>
                <p className="text-secondary text-sm leading-relaxed whitespace-pre-wrap">{course.description}</p>
              </section>
            )}

            <section className="ios-card p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 md:static fixed bottom-0 left-0 right-0 z-30 md:relative rounded-none md:rounded-2xl border-t md:border shadow-lg md:shadow-none px-4 py-4 md:p-5" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
              <div>
                <p className="font-semibold text-primary">
                  {isEnrolled || success ? 'You are enrolled' : 'Ready to start?'}
                </p>
                <p className="text-sm text-secondary mt-1">
                  {isEnrolled || success
                    ? 'Continue from your dashboard.'
                    : 'Sign in and enroll to access this course.'}
                </p>
              </div>

              {isEnrolled || success ? (
                <Link href="/dashboard" className="ios-btn-primary">
                  Go to dashboard
                </Link>
              ) : isPublished ? (
                <button type="button" className="ios-btn-primary" disabled={enrolling} onClick={() => void enroll()}>
                  {enrolling ? 'Enrolling…' : 'Enroll now'}
                </button>
              ) : (
                <span className="text-sm text-secondary">Not open for enrollment</span>
              )}
            </section>

            {(isEnrolled || success) && (
              <section className="ios-card p-5 space-y-4 lux-course-player">
                <h2 className="font-semibold">Course player</h2>
                <div
                  className="aspect-video rounded-lg flex items-center justify-center"
                  style={{ background: 'var(--color-fill-tertiary)' }}
                >
                  <span className="text-secondary text-sm">Video player placeholder</span>
                </div>
                <ul className="space-y-2">
                  {['Introduction', 'Lesson 1', 'Lesson 2', 'Lesson 3'].map((lesson, i) => (
                    <li key={lesson} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" disabled readOnly />
                      <span>{lesson}</span>
                      {i === 0 ? <span className="badge badge-blue text-xs">Current</span> : null}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {enrollError && (
              <p className="text-sm" style={{ color: 'var(--color-red)' }}>
                {enrollError}
              </p>
            )}
          </article>
        )}
      </LearnLayout>
    </>
  );
}

export const getServerSideProps = learnStoreServerProps;
