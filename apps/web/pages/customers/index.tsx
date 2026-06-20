import { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import { AppLayout, getDefaultSidebarSections, getDefaultLogo } from '@luxgen/ui';

import { PageEmptyState, PageLoadingState } from '../../components/common/PageStates';
import { GET_STUDENT_CERTIFICATES } from '../../graphql/queries/certificate';
import { GET_COURSES } from '../../graphql/queries/courses';
import { GET_STUDENT_ENROLLMENTS } from '../../graphql/queries/enrollment';
import { openCertificateDownload } from '../../lib/certificate-download';
import { useAppLayoutHeader } from '../../lib/app-layout-header';
import { filterPublishedCourses, type LearnCourse } from '../../lib/learn-store';
import {
  buildLearnerCourseViews,
  buildRecommendedCourses,
  courseEmoji,
  formatCompletedDate,
  sortEnrollmentsByRecent,
  type LearnerEnrollment,
} from '../../lib/learner-progress';
import { AUTH_SESSION_CHANGE_EVENT, getStoredUser } from '../../lib/session';
import { handleUserAction, transformUserDataFromSession } from '../../lib/transformer';

interface Props {
  tenant: string;
}

interface LearnerCertificate {
  id: string;
  courseId: string;
  courseTitle: string;
  certificateNumber: string;
  issuedAt: string;
}

function ProgressRing({ progress }: { progress: number }) {
  const r = 20;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (progress / 100) * circumference;
  return (
    <svg width="48" height="48" className="lux-course-progress-ring">
      <circle cx="24" cy="24" r={r} fill="none" stroke="var(--color-fill-secondary)" strokeWidth="4" />
      <circle
        cx="24"
        cy="24"
        r={r}
        fill="none"
        stroke="var(--color-green)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 24 24)"
        style={{ transition: 'stroke-dashoffset 500ms ease' }}
      />
      <text x="24" y="28" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--color-label-primary)">
        {progress}%
      </text>
    </svg>
  );
}

export default function CustomersPage({ tenant }: Props) {
  const router = useRouter();
  const headerProps = useAppLayoutHeader();
  const [mounted, setMounted] = useState(false);
  const [sessionUser, setSessionUser] = useState(() => getStoredUser());
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const refresh = () => setSessionUser(getStoredUser());
    refresh();
    window.addEventListener(AUTH_SESSION_CHANGE_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(AUTH_SESSION_CHANGE_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const tenantId = sessionUser?.tenant.id;
  const studentId = sessionUser?.id;
  const searchQuery = typeof router.query.search === 'string' ? router.query.search.trim().toLowerCase() : '';

  const {
    data: enrollmentData,
    loading: enrollmentsLoading,
    error: enrollmentsError,
  } = useQuery(GET_STUDENT_ENROLLMENTS, {
    skip: !tenantId || !studentId,
    variables: { tenantId: tenantId ?? '', studentId: studentId ?? '' },
  });

  const {
    data: coursesData,
    loading: coursesLoading,
    error: coursesError,
  } = useQuery(GET_COURSES, {
    skip: !tenantId,
    variables: { tenantId: tenantId ?? '' },
  });

  const {
    data: certificatesData,
    loading: certificatesLoading,
    error: certificatesError,
  } = useQuery(GET_STUDENT_CERTIFICATES, {
    skip: !tenantId || !studentId,
    variables: { tenantId: tenantId ?? '', studentId: studentId ?? '' },
  });

  const layoutUser = transformUserDataFromSession();
  const courses = filterPublishedCourses((coursesData?.courses as LearnCourse[] | undefined) ?? []);
  const enrollments = (enrollmentData?.studentEnrollments as LearnerEnrollment[] | undefined) ?? [];
  const certificates = (certificatesData?.studentCertificates as LearnerCertificate[] | undefined) ?? [];

  const enrolledCourses = useMemo(() => {
    const views = buildLearnerCourseViews(enrollments, courses);
    const sorted = sortEnrollmentsByRecent(enrollments, views);
    if (!searchQuery) return sorted;
    return sorted.filter(
      (course) =>
        course.title.toLowerCase().includes(searchQuery) || course.instructor.toLowerCase().includes(searchQuery),
    );
  }, [enrollments, courses, searchQuery]);

  const inProgressCourses = enrolledCourses.filter(
    (course) => course.learningStatus !== 'COMPLETED' && course.progress < 100,
  );
  const completedCourses = enrolledCourses.filter(
    (course) => course.learningStatus === 'COMPLETED' || course.progress >= 100,
  );
  const recentCourses = sortEnrollmentsByRecent(
    enrollments.filter((e) => e.learningStatus !== 'COMPLETED' && (e.progressPercent ?? 0) < 100),
    inProgressCourses,
  );

  const recommendedCourses = useMemo(() => {
    const enrolledIds = new Set(enrollments.map((e) => e.courseId));
    const recommended = buildRecommendedCourses(courses, enrolledIds);
    if (!searchQuery) return recommended;
    return recommended.filter(
      (course) =>
        course.title.toLowerCase().includes(searchQuery) || course.instructor.toLowerCase().includes(searchQuery),
    );
  }, [courses, enrollments, searchQuery]);

  const averageProgress =
    inProgressCourses.length > 0
      ? Math.round(inProgressCourses.reduce((sum, course) => sum + course.progress, 0) / inProgressCourses.length)
      : completedCourses.length > 0
        ? 100
        : 0;

  const goalCircumference = 2 * Math.PI * 26;
  const goalOffset = goalCircumference - (averageProgress / 100) * goalCircumference;
  const greetingName = sessionUser?.firstName?.trim() || 'Learner';

  const loading = !sessionUser || enrollmentsLoading || coursesLoading || certificatesLoading;
  const queryError = enrollmentsError ?? coursesError ?? certificatesError;

  const handleDownloadCertificate = async (certificateId: string) => {
    setDownloadError(null);
    setDownloadingId(certificateId);
    try {
      await openCertificateDownload(certificateId);
    } catch (error) {
      setDownloadError(error instanceof Error ? error.message : 'Could not open certificate.');
    } finally {
      setDownloadingId(null);
    }
  };

  if (!sessionUser && mounted) {
    return (
      <>
        <Head>
          <title>My Learning — {tenant.charAt(0).toUpperCase() + tenant.slice(1)}</title>
        </Head>
        <AppLayout
          sidebarSections={getDefaultSidebarSections()}
          user={layoutUser ?? undefined}
          logo={getDefaultLogo()}
          onUserAction={(action) => handleUserAction(action, router)}
          {...headerProps}
        >
          <PageEmptyState
            icon="🔐"
            title="Sign in to view your learning"
            subtitle="Your enrolled courses and progress appear here after you log in."
            action={
              <Link href="/login" className="ios-btn-primary mt-4 inline-flex">
                Sign in
              </Link>
            }
          />
        </AppLayout>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>My Learning — {tenant.charAt(0).toUpperCase() + tenant.slice(1)}</title>
      </Head>
      <AppLayout
        sidebarSections={getDefaultSidebarSections()}
        user={layoutUser ?? undefined}
        logo={getDefaultLogo()}
        onUserAction={(action) => handleUserAction(action, router)}
        {...headerProps}
      >
        {loading && <PageLoadingState label="Loading your courses…" />}

        {queryError && !loading && (
          <p className="text-sm" style={{ color: 'var(--color-red)' }}>
            {queryError.message || 'Could not load your learning progress.'}
          </p>
        )}

        {!loading && !queryError && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <div className="lux-learner-hero">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                <div>
                  <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, marginBottom: 6 }}>
                    Good morning, {greetingName} 👋
                  </h1>
                  <p style={{ margin: 0, opacity: 0.85, fontSize: 15 }}>
                    {inProgressCourses.length > 0
                      ? `You have ${inProgressCourses.length} course${inProgressCourses.length === 1 ? '' : 's'} in progress. Keep it up!`
                      : enrolledCourses.length > 0
                        ? 'All caught up — explore the catalog for more.'
                        : 'Browse the catalog and enroll to start learning.'}
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                  <svg width="64" height="64">
                    <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="5" />
                    {mounted && (
                      <circle
                        cx="32"
                        cy="32"
                        r="26"
                        fill="none"
                        stroke="#fff"
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeDasharray={goalCircumference}
                        strokeDashoffset={goalOffset}
                        transform="rotate(-90 32 32)"
                        style={{ transition: 'stroke-dashoffset 600ms ease' }}
                      />
                    )}
                    <text x="32" y="37" textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff">
                      {averageProgress}%
                    </text>
                  </svg>
                  <span style={{ fontSize: 11, opacity: 0.8 }}>Avg. progress</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <span className="lux-streak-badge">🏆 {certificates.length} certificates</span>
                <span className="lux-streak-badge">📚 {enrolledCourses.length} enrolled</span>
              </div>
            </div>

            {inProgressCourses.length > 0 && (
              <section>
                <div
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}
                >
                  <h2 className="ios-large-title" style={{ fontSize: 20, margin: 0 }}>
                    Continue Learning
                  </h2>
                </div>
                <div className="lux-continue-strip">
                  {recentCourses.slice(0, 5).map((course) => (
                    <div key={course.id} className="lux-course-progress-card">
                      <div
                        className="lux-course-thumbnail"
                        style={{ fontSize: 40, background: 'var(--color-fill-tertiary)' }}
                      >
                        {course.emoji}
                      </div>
                      <div style={{ padding: '14px 14px 0' }}>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: 14,
                            marginBottom: 4,
                            color: 'var(--color-label-primary)',
                          }}
                        >
                          {course.title}
                        </div>
                        <div className="lux-course-meta">{course.instructor}</div>
                      </div>
                      <div style={{ padding: '10px 14px' }}>
                        <div className="lux-progress-bar-track">
                          <div className="lux-progress-bar" style={{ width: mounted ? `${course.progress}%` : '0%' }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                          <span className="lux-progress-label">{course.progress}% complete</span>
                          <span className="lux-progress-label">{course.lastAccessedAt}</span>
                        </div>
                      </div>
                      <div style={{ padding: '0 14px 14px' }}>
                        <Link
                          href={`/learn/courses/${course.courseId}`}
                          className="ios-btn-primary"
                          style={{ width: '100%', fontSize: 14, display: 'block', textAlign: 'center' }}
                        >
                          Resume
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <h2 className="ios-large-title" style={{ fontSize: 20, margin: 0 }}>
                  My Courses ({enrolledCourses.length})
                </h2>
                <Link href="/learn" className="ios-btn-secondary" style={{ fontSize: 13 }}>
                  Browse Catalog
                </Link>
              </div>

              {enrolledCourses.length === 0 ? (
                <div className="ios-empty-state ios-card py-12">
                  <p className="empty-title">No enrollments yet</p>
                  <p className="empty-subtitle">Browse the catalog and enroll in a course to track progress here.</p>
                  <Link href="/learn" className="ios-btn-primary mt-4 inline-flex">
                    Browse catalog
                  </Link>
                </div>
              ) : (
                <div className="lux-enrolled-grid">
                  {enrolledCourses.map((course) => (
                    <div key={course.id} className="lux-enrolled-card">
                      <div
                        className="lux-course-thumbnail"
                        style={{ fontSize: 48, background: 'var(--color-fill-tertiary)' }}
                      >
                        {course.emoji}
                      </div>
                      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                        <div>
                          <span className="badge" style={{ marginBottom: 6, display: 'inline-block' }}>
                            {course.category}
                          </span>
                          <div
                            style={{
                              fontWeight: 600,
                              fontSize: 15,
                              color: 'var(--color-label-primary)',
                              lineHeight: 1.4,
                            }}
                          >
                            {course.title}
                          </div>
                          <div className="lux-course-meta" style={{ marginTop: 4 }}>
                            <span>{course.instructor}</span>
                            <span>·</span>
                            <span>{course.duration}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <ProgressRing progress={course.progress} />
                          <div style={{ flex: 1 }}>
                            <div className="lux-progress-bar-track">
                              <div
                                className="lux-progress-bar"
                                style={{ width: mounted ? `${course.progress}%` : '0%' }}
                              />
                            </div>
                            <span className="lux-progress-label">{course.progress}% complete</span>
                          </div>
                        </div>
                        <Link
                          href={`/learn/courses/${course.courseId}`}
                          className="ios-btn-secondary"
                          style={{ fontSize: 13, textAlign: 'center' }}
                        >
                          {course.progress > 0 ? 'Continue' : 'Start'}
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {certificates.length > 0 && (
              <section>
                <div
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}
                >
                  <h2 className="ios-large-title" style={{ fontSize: 20, margin: 0 }}>
                    Certificates ({certificates.length})
                  </h2>
                </div>
                {downloadError && (
                  <p className="text-sm mb-3" style={{ color: 'var(--color-red)' }}>
                    {downloadError}
                  </p>
                )}
                <div className="lux-cert-row">
                  {certificates.map((certificate) => (
                    <div key={certificate.id} className="lux-cert-card">
                      <span className="lux-cert-icon">{courseEmoji(certificate.courseId)}</span>
                      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-label-primary)' }}>
                        {certificate.courseTitle}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--color-label-secondary)' }}>
                        Issued {formatCompletedDate(certificate.issuedAt)}
                      </div>
                      <button
                        type="button"
                        className="ios-btn-plain lux-cert-download"
                        style={{ fontSize: 13, padding: 0 }}
                        disabled={downloadingId === certificate.id}
                        onClick={() => void handleDownloadCertificate(certificate.id)}
                      >
                        {downloadingId === certificate.id ? 'Opening…' : 'Download PDF'}
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {recommendedCourses.length > 0 && (
              <section>
                <div
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}
                >
                  <h2 className="ios-large-title" style={{ fontSize: 20, margin: 0 }}>
                    Recommended for You
                  </h2>
                </div>
                <div className="lux-recommended-grid">
                  {recommendedCourses.map((course) => (
                    <div key={course.id} className="lux-enrolled-card lux-recommend-card">
                      <div
                        className="lux-course-thumbnail"
                        style={{ fontSize: 48, background: 'var(--color-fill-tertiary)' }}
                      >
                        {course.emoji}
                      </div>
                      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                        <div>
                          <span className="badge" style={{ marginBottom: 6, display: 'inline-block' }}>
                            {course.category}
                          </span>
                          <div
                            style={{
                              fontWeight: 600,
                              fontSize: 15,
                              color: 'var(--color-label-primary)',
                              lineHeight: 1.4,
                            }}
                          >
                            {course.title}
                          </div>
                          <div className="lux-course-meta" style={{ marginTop: 4 }}>
                            <span>{course.instructor}</span>
                            <span>·</span>
                            <span>{course.duration}</span>
                          </div>
                        </div>
                        <Link
                          href={`/learn/courses/${course.courseId}`}
                          className="ios-btn-primary"
                          style={{ fontSize: 13, textAlign: 'center' }}
                        >
                          View course
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </AppLayout>
    </>
  );
}

export async function getServerSideProps(context: { query: { tenant?: string } }) {
  return {
    props: {
      tenant: context.query.tenant || 'demo',
    },
  };
}
