import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';

import { LearnLayout } from '../../../components/learn/LearnLayout';
import { PageLoadingState } from '../../../components/common/PageStates';
import { GET_COURSE } from '../../../graphql/queries/courses';
import { GET_ENROLLMENT } from '../../../graphql/queries/enrollment';
import { GET_TENANT } from '../../../graphql/queries/tenants';
import { formatInstructorName, learnStoreServerProps, type LearnCourse } from '../../../lib/learn-store';
import { AUTH_SESSION_CHANGE_EVENT, getStoredUser } from '../../../lib/session';
import { useLearnEnroll } from '../../../lib/use-learn-enroll';
import { useLearnProgress } from '../../../lib/use-learn-progress';

interface Props {
  tenantSubdomain: string;
}

export default function LearnCourseDetailPage({ tenantSubdomain }: Props) {
  const router = useRouter();
  const courseId = router.query.id as string;
  const [sessionUser, setSessionUser] = useState(() => getStoredUser());

  useEffect(() => {
    const refresh = () => setSessionUser(getStoredUser());
    refresh();
    window.addEventListener(AUTH_SESSION_CHANGE_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(AUTH_SESSION_CHANGE_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

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
  const returnPath = `/learn/courses/${courseId}`;

  const {
    data: enrollmentData,
    loading: enrollmentLoading,
    refetch: refetchEnrollment,
  } = useQuery(GET_ENROLLMENT, {
    skip: !courseId || !sessionUser?.id,
    variables: { courseId, studentId: sessionUser?.id ?? '' },
  });

  const enrollment = enrollmentData?.enrollment;
  const isEnrolled = Boolean(enrollment?.id);
  const progressPercent = enrollment?.progressPercent ?? 0;
  const isCompleted = enrollment?.learningStatus === 'COMPLETED' || progressPercent >= 100;

  const {
    enroll,
    loading: enrolling,
    error: enrollError,
    success: enrollSuccess,
  } = useLearnEnroll({
    courseId,
    returnPath,
  });

  const {
    markComplete,
    bumpProgress,
    completing,
    updating,
    error: progressError,
  } = useLearnProgress({
    courseId,
    returnPath,
    onUpdated: () => void refetchEnrollment(),
  });

  useEffect(() => {
    if (enrollSuccess) {
      void refetchEnrollment();
    }
  }, [enrollSuccess, refetchEnrollment]);

  const instructor = course ? formatInstructorName(course) : null;
  const isPublished = course?.status === 'PUBLISHED';
  const showEnrolled = isEnrolled || enrollSuccess;

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

            {showEnrolled && !enrollmentLoading && (
              <section className="ios-card p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-primary">Your progress</h2>
                    <p className="text-sm text-secondary mt-1">
                      {isCompleted ? 'Course completed — certificate ready.' : `${progressPercent}% complete`}
                    </p>
                  </div>
                  <Link href="/customers" className="ios-btn-secondary text-sm">
                    My learning
                  </Link>
                </div>

                <div className="lux-progress-bar-track">
                  <div className="lux-progress-bar" style={{ width: `${progressPercent}%` }} />
                </div>

                {isCompleted ? (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link href="/customers" className="ios-btn-primary">
                      View certificate
                    </Link>
                    <Link href="/learn" className="ios-btn-secondary">
                      Browse more courses
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      className="ios-btn-primary"
                      disabled={completing || updating}
                      onClick={() => void markComplete()}
                    >
                      {completing ? 'Completing…' : 'Mark course complete'}
                    </button>
                    {progressPercent < 75 && (
                      <button
                        type="button"
                        className="ios-btn-secondary"
                        disabled={completing || updating}
                        onClick={() => void bumpProgress(progressPercent)}
                      >
                        {updating ? 'Saving…' : `Record progress (+25%)`}
                      </button>
                    )}
                  </div>
                )}
              </section>
            )}

            <section className="ios-card p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="font-semibold text-primary">{showEnrolled ? 'You are enrolled' : 'Ready to start?'}</p>
                <p className="text-sm text-secondary mt-1">
                  {showEnrolled
                    ? isCompleted
                      ? 'Nice work — your progress is saved.'
                      : 'Track progress here or from My learning.'
                    : 'Sign in and enroll to access this course.'}
                </p>
              </div>

              {!showEnrolled && isPublished ? (
                <button type="button" className="ios-btn-primary" disabled={enrolling} onClick={() => void enroll()}>
                  {enrolling ? 'Enrolling…' : 'Enroll now'}
                </button>
              ) : !showEnrolled ? (
                <span className="text-sm text-secondary">Not open for enrollment</span>
              ) : null}
            </section>

            {(enrollError || progressError) && (
              <p className="text-sm" style={{ color: 'var(--color-red)' }}>
                {enrollError || progressError}
              </p>
            )}
          </article>
        )}
      </LearnLayout>
    </>
  );
}

export const getServerSideProps = learnStoreServerProps;
