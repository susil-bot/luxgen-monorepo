import { useEffect, useMemo, useState } from 'react';
import { useAppShellConfig } from '../../lib/app-shell-config';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import { AppLayout, SnackbarProvider } from '@luxgen/ui';
import { PageLoadingState } from '../../components/common/PageStates';
import { GET_LEARNER_DASHBOARD } from '../../graphql/queries/learner';
import { GET_STOREFRONT_PRODUCTS } from '../../graphql/queries/storefront';
import { createHandleUserAction } from '../../lib/user-actions';
import { useLayoutUser, useAppTenantId } from '../../lib/app-layout-user';
import { getStoredUser } from '../../lib/session';
import { getTenantPageProps } from '../../lib/tenant-page-props';
import { useAppLayoutHeader } from '../../lib/app-layout-header';
import { isMongoObjectId } from '../../lib/mongo-id';

interface Props {
  tenant: string;
}

function formatRelativeTime(value?: string | null): string {
  if (!value) return 'Not yet';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not yet';
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

function formatMonthYear(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
}

function courseEmoji(title: string): string {
  const lower = title.toLowerCase();
  if (lower.includes('react') || lower.includes('code')) return '⚛️';
  if (lower.includes('data') || lower.includes('python')) return '📊';
  if (lower.includes('lead')) return '🧠';
  if (lower.includes('design') || lower.includes('ux')) return '🔬';
  if (lower.includes('finance')) return '💰';
  if (lower.includes('market')) return '📈';
  return '📚';
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

function CustomersContent({ tenant }: Props) {
  const { sidebarSections, logo } = useAppShellConfig();
  const router = useRouter();
  const handleUserAction = createHandleUserAction(router);
  const layoutUser = useLayoutUser();
  const tenantId = useAppTenantId();
  const headerProps = useAppLayoutHeader();
  const [mounted, setMounted] = useState(false);
  const [studentId, setStudentId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const stored = getStoredUser();
    setStudentId(stored?.id ?? null);
  }, []);

  const { data, loading, error } = useQuery(GET_LEARNER_DASHBOARD, {
    variables: { tenantId, studentId },
    skip: !isMongoObjectId(tenantId) || !studentId,
    fetchPolicy: 'cache-and-network' });

  const { data: catalogData } = useQuery(GET_STOREFRONT_PRODUCTS, {
    variables: { tenantId },
    skip: !isMongoObjectId(tenantId),
    fetchPolicy: 'cache-and-network' });

  const dashboard = data?.learnerDashboard;
  const enrolledCourses = dashboard?.courses ?? [];
  const inProgressCourses = enrolledCourses.filter((course) => course.learningStatus !== 'COMPLETED');
  const completedCourses = enrolledCourses.filter((course) => course.learningStatus === 'COMPLETED');
  const recentCourses = [...inProgressCourses].sort((a, b) => {
    const aTime = a.lastAccessedAt ? new Date(a.lastAccessedAt).getTime() : new Date(a.enrolledAt).getTime();
    const bTime = b.lastAccessedAt ? new Date(b.lastAccessedAt).getTime() : new Date(b.enrolledAt).getTime();
    return bTime - aTime;
  });

  const enrolledIds = new Set(enrolledCourses.map((course) => course.courseId));
  const recommended = useMemo(
    () => (catalogData?.storefrontProducts ?? []).filter((product) => !enrolledIds.has(product.id)).slice(0, 3),
    [catalogData, enrolledIds],
  );

  const greetingName = layoutUser?.name?.split(' ')[0] ?? 'Learner';
  const stats = dashboard?.stats;
  const certificateCount = stats?.certificateCount ?? completedCourses.length;
  const enrolledCount = stats?.enrolledCount ?? enrolledCourses.length;
  const inProgressCount = stats?.inProgressCount ?? inProgressCourses.length;

  if (!layoutUser) {
    return (
      <>
        <Head>
          <title>My Learning — {tenant}</title>
        </Head>
        <AppLayout
          responsive
          sidebarSections={sidebarSections}
          user={undefined}
          logo={logo}
          onUserAction={handleUserAction}
          {...headerProps}
        >
          <div className="max-w-lg mx-auto px-4 py-16 text-center">
            <h1 className="text-2xl font-semibold text-primary">My Learning</h1>
            <p className="text-secondary mt-2">Sign in to view your courses, progress, and subscriptions.</p>
            <Link href="/login" className="ios-btn-primary inline-block mt-6">
              Sign in
            </Link>
          </div>
        </AppLayout>
      </>
    );
  }

  if (loading && !dashboard) {
    return (
      <>
        <Head>
          <title>My Learning — {tenant}</title>
        </Head>
        <AppLayout
          responsive
          sidebarSections={sidebarSections}
          user={layoutUser}
          logo={logo}
          onUserAction={handleUserAction}
          {...headerProps}
        >
          <PageLoadingState label="Loading your learning dashboard…" />
        </AppLayout>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Head>
          <title>My Learning — {tenant}</title>
        </Head>
        <AppLayout
          responsive
          sidebarSections={sidebarSections}
          user={layoutUser}
          logo={logo}
          onUserAction={handleUserAction}
          {...headerProps}
        >
          <div className="max-w-lg mx-auto px-4 py-16 text-center">
            <p className="text-secondary">Unable to load your dashboard. Please try again.</p>
          </div>
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
        responsive
        sidebarSections={sidebarSections}
        user={layoutUser}
        logo={logo}
        onUserAction={handleUserAction}
        {...headerProps}
        showSearch
        showNotifications
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          <div className="lux-learner-hero">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
              <div>
                <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, marginBottom: 6 }}>
                  Good morning, {greetingName} 👋
                </h1>
                <p style={{ margin: 0, opacity: 0.85, fontSize: 15 }}>
                  {inProgressCount > 0
                    ? `You have ${inProgressCount} course${inProgressCount === 1 ? '' : 's'} in progress. Keep it up!`
                    : 'Browse the catalog to start your next course.'}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <span className="lux-streak-badge">🏆 {certificateCount} certificates</span>
              <span className="lux-streak-badge">📚 {enrolledCount} enrolled</span>
              {(dashboard?.subscriptions?.length ?? 0) > 0 && (
                <span className="lux-streak-badge">🔁 {dashboard?.subscriptions.length} subscriptions</span>
              )}
            </div>
          </div>

          {inProgressCourses.length > 0 && (
            <section>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <h2 className="ios-large-title" style={{ fontSize: 20, margin: 0 }}>
                  Continue Learning
                </h2>
              </div>
              <div className="lux-continue-strip">
                {recentCourses.slice(0, 5).map((course) => (
                  <div key={course.enrollmentId} className="lux-course-progress-card">
                    <div
                      className="lux-course-thumbnail"
                      style={{ fontSize: 40, background: 'var(--color-fill-tertiary)' }}
                    >
                      {courseEmoji(course.courseTitle)}
                    </div>
                    <div style={{ padding: '14px 14px 0' }}>
                      <div
                        style={{ fontWeight: 600, fontSize: 14, marginBottom: 4, color: 'var(--color-label-primary)' }}
                      >
                        {course.courseTitle}
                      </div>
                      <div className="lux-course-meta">{course.instructorName}</div>
                    </div>
                    <div style={{ padding: '10px 14px' }}>
                      <div className="lux-progress-bar-track">
                        <div
                          className="lux-progress-bar"
                          style={{ width: mounted ? `${course.progressPercent}%` : '0%' }}
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                        <span className="lux-progress-label">{course.progressPercent}% complete</span>
                        <span className="lux-progress-label">{formatRelativeTime(course.lastAccessedAt)}</span>
                      </div>
                    </div>
                    <div style={{ padding: '0 14px 14px' }}>
                      <Link
                        href={`/learn/courses/${course.courseId}?lesson=${Math.max(1, Math.round((course.progressPercent / 100) * 4))}`}
                        className="ios-btn-primary"
                        style={{ width: '100%', fontSize: 14, display: 'block', textAlign: 'center' }}
                      >
                        Resume lesson
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
                My Courses ({enrolledCount})
              </h2>
              <Link href="/store/product" className="ios-btn-secondary" style={{ fontSize: 13 }}>
                Browse Catalog
              </Link>
            </div>
            {enrolledCourses.length === 0 ? (
              <p className="text-secondary">You are not enrolled in any courses yet.</p>
            ) : (
              <div className="lux-enrolled-grid">
                {enrolledCourses.map((course) => (
                  <div key={course.enrollmentId} className="lux-enrolled-card">
                    <div
                      className="lux-course-thumbnail"
                      style={{ fontSize: 48, background: 'var(--color-fill-tertiary)' }}
                    >
                      {courseEmoji(course.courseTitle)}
                    </div>
                    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                      <div>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: 15,
                            color: 'var(--color-label-primary)',
                            lineHeight: 1.4 }}
                        >
                          {course.courseTitle}
                        </div>
                        <div className="lux-course-meta" style={{ marginTop: 4 }}>
                          <span>{course.instructorName}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <ProgressRing progress={course.progressPercent} />
                        <div style={{ flex: 1 }}>
                          <div className="lux-progress-bar-track">
                            <div
                              className="lux-progress-bar"
                              style={{ width: mounted ? `${course.progressPercent}%` : '0%' }}
                            />
                          </div>
                          <span className="lux-progress-label">{course.progressPercent}% complete</span>
                        </div>
                      </div>
                      <Link
                        href={`/learn/courses/${course.courseId}?lesson=${Math.max(1, Math.round((course.progressPercent / 100) * 4))}`}
                        className="ios-btn-secondary"
                        style={{ fontSize: 13, textAlign: 'center' }}
                      >
                        {course.progressPercent > 0 ? 'Continue' : 'Start'}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {completedCourses.length > 0 && (
            <section>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <h2 className="ios-large-title" style={{ fontSize: 20, margin: 0 }}>
                  Certificates ({completedCourses.length})
                </h2>
              </div>
              <div className="lux-cert-row">
                {completedCourses.map((course) => (
                  <div key={course.enrollmentId} className="lux-cert-card">
                    <span className="lux-cert-icon">{courseEmoji(course.courseTitle)}</span>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-label-primary)' }}>
                      {course.courseTitle}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-label-secondary)' }}>
                      Issued {formatMonthYear(course.completedAt)}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {recommended.length > 0 && (
            <section>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <h2 className="ios-large-title" style={{ fontSize: 20, margin: 0 }}>
                  Recommended for You
                </h2>
              </div>
              <div className="lux-recommended-grid">
                {recommended.map((product) => (
                  <div key={product.id} className="lux-enrolled-card lux-recommend-card">
                    <div
                      className="lux-course-thumbnail"
                      style={{ fontSize: 48, background: 'var(--color-fill-tertiary)' }}
                    >
                      {courseEmoji(product.title)}
                    </div>
                    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                      <div>
                        <span className="badge" style={{ marginBottom: 6, display: 'inline-block' }}>
                          {product.category}
                        </span>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: 15,
                            color: 'var(--color-label-primary)',
                            lineHeight: 1.4 }}
                        >
                          {product.title}
                        </div>
                        <div className="lux-course-meta" style={{ marginTop: 4 }}>
                          <span>{product.instructorName}</span>
                        </div>
                      </div>
                      <Link
                        href={`/store/product/${product.id}`}
                        className="ios-btn-primary"
                        style={{ fontSize: 13, textAlign: 'center' }}
                      >
                        View in Store
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </AppLayout>
    </>
  );
}

export default function CustomersPage(props: Props) {
  return (
    <SnackbarProvider position="top-right" maxSnackbars={3}>
      <CustomersContent {...props} />
    </SnackbarProvider>
  );
}
