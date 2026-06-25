import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { createHandleUserAction } from '../../lib/user-actions';
import { useQuery } from '@apollo/client';
import { AppLayout, getDefaultSidebarSections, getDefaultUser, getDefaultLogo } from '@luxgen/ui';
import { TenantBanner } from '../../components/tenant/TenantBanner';
import { PlanGate } from '../../components/billing/PlanGate';
import { GET_TENANT_BILLING } from '../../graphql/queries/billing';
import { normalizePlan } from '@luxgen/billing';

interface CourseAnalyticsPageProps {
  tenant: string;
}

export default function CourseAnalyticsPage({ tenant }: CourseAnalyticsPageProps) {
  const router = useRouter();
  const [user, setUser] = useState<import('@luxgen/ui').UserMenu | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'instructor' | 'learner'>('learner');

  const { data: billingData } = useQuery(GET_TENANT_BILLING, {
    variables: { tenantId: tenant },
    errorPolicy: 'ignore',
  });
  const tenantPlan = normalizePlan(billingData?.tenantBilling?.plan?.toLowerCase?.() ?? 'free');

  // Mock analytics data
  const [analyticsData] = useState({
    totalCourses: 24,
    totalEnrollments: 3456,
    activeStudents: 2134,
    completionRate: 78,
    averageRating: 4.6,
    revenue: 45680,
    topCourses: [
      { id: '1', title: 'Advanced React Development', enrollments: 456, rating: 4.8, completionRate: 85 },
      { id: '2', title: 'TypeScript Fundamentals', enrollments: 389, rating: 4.7, completionRate: 82 },
      { id: '3', title: 'Node.js Backend Development', enrollments: 342, rating: 4.6, completionRate: 79 },
      { id: '4', title: 'UI/UX Design Principles', enrollments: 298, rating: 4.9, completionRate: 88 },
    ],
    enrollmentTrends: [
      { month: 'Jan', enrollments: 245 },
      { month: 'Feb', enrollments: 312 },
      { month: 'Mar', enrollments: 289 },
      { month: 'Apr', enrollments: 367 },
      { month: 'May', enrollments: 423 },
      { month: 'Jun', enrollments: 398 },
    ],
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setUser({
          name: `${parsed.firstName} ${parsed.lastName}`,
          email: parsed.email,
          role: parsed.role,
        });
        setUserRole(parsed.role as 'admin' | 'instructor' | 'learner');
      } catch {
        setUser(getDefaultUser());
      }
    } else {
      setUser(getDefaultUser());
    }
  }, []);

  const handleUserAction = createHandleUserAction(router);

  return (
    <>
      <Head>
        <title>Course Analytics - LuxGen</title>
      </Head>

      <AppLayout
        sidebarSections={getDefaultSidebarSections()}
        user={user}
        onUserAction={handleUserAction}
        logo={getDefaultLogo()}
        sidebarCollapsible
        responsive
      >
        <PlanGate feature="analytics" currentPlan={tenantPlan} tenant={tenant}>
          <TenantBanner tenant={tenant} />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="ios-large-title mb-1">Course Analytics</h1>
              <p className="text-secondary text-sm">Performance metrics and insights across all courses</p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="ios-metric-tile">
                <div className="text-xs text-secondary mb-1">Total Courses</div>
                <div className="text-2xl font-bold text-primary">{analyticsData.totalCourses}</div>
                <div className="text-xs text-green-500 mt-1">↑ +3 this month</div>
              </div>
              <div className="ios-metric-tile">
                <div className="text-xs text-secondary mb-1">Total Enrollments</div>
                <div className="text-2xl font-bold text-primary">{analyticsData.totalEnrollments.toLocaleString()}</div>
                <div className="text-xs text-green-500 mt-1">↑ +12% vs last month</div>
              </div>
              <div className="ios-metric-tile">
                <div className="text-xs text-secondary mb-1">Active Students</div>
                <div className="text-2xl font-bold text-primary">{analyticsData.activeStudents.toLocaleString()}</div>
                <div className="text-xs text-green-500 mt-1">↑ +8% this week</div>
              </div>
              <div className="ios-metric-tile">
                <div className="text-xs text-secondary mb-1">Completion Rate</div>
                <div className="text-2xl font-bold text-primary">{analyticsData.completionRate}%</div>
                <div className="text-xs text-green-500 mt-1">↑ +5% improvement</div>
              </div>
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Revenue Card */}
              <div className="surface p-6">
                <h3 className="text-base font-semibold text-primary mb-4">Revenue Overview</h3>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-3xl font-bold text-primary">${analyticsData.revenue.toLocaleString()}</div>
                    <p className="text-sm text-secondary mt-1">Total revenue this quarter</p>
                  </div>
                  <span className="badge badge-green">+18%</span>
                </div>
                <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--color-separator)' }}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-secondary">Average Rating</span>
                    <span className="font-medium text-primary">{analyticsData.averageRating} ★</span>
                  </div>
                </div>
              </div>

              {/* Enrollment Trends */}
              <div className="surface p-6">
                <h3 className="text-base font-semibold text-primary mb-4">Enrollment Trends</h3>
                <div className="space-y-3">
                  {analyticsData.enrollmentTrends.map((trend) => (
                    <div key={trend.month} className="flex items-center gap-3">
                      <span className="text-xs text-secondary w-8">{trend.month}</span>
                      <div
                        className="flex-1 h-2 rounded-full overflow-hidden"
                        style={{ backgroundColor: 'var(--color-fill-quaternary)' }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${(trend.enrollments / 500) * 100}%`,
                            backgroundColor: 'var(--color-blue)',
                          }}
                        />
                      </div>
                      <span className="text-xs font-medium text-primary w-12 text-right">{trend.enrollments}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Courses */}
            <div className="surface p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-primary">Top Performing Courses</h3>
                <button className="ios-btn-plain text-sm">View All</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--color-separator)' }}>
                      <th className="text-left text-xs font-medium text-secondary pb-3">Course</th>
                      <th className="text-right text-xs font-medium text-secondary pb-3">Enrollments</th>
                      <th className="text-right text-xs font-medium text-secondary pb-3">Rating</th>
                      <th className="text-right text-xs font-medium text-secondary pb-3">Completion</th>
                      <th className="text-right text-xs font-medium text-secondary pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: 'var(--color-separator)' }}>
                    {analyticsData.topCourses.map((course) => (
                      <tr key={course.id} className="hover:bg-[var(--color-fill-quaternary)] transition-colors">
                        <td className="py-4">
                          <div className="text-sm font-medium text-primary">{course.title}</div>
                        </td>
                        <td className="py-4 text-right">
                          <span className="text-sm text-primary">{course.enrollments}</span>
                        </td>
                        <td className="py-4 text-right">
                          <span className="text-sm text-primary">{course.rating} ★</span>
                        </td>
                        <td className="py-4 text-right">
                          <span className="text-sm text-primary">{course.completionRate}%</span>
                        </td>
                        <td className="py-4 text-right">
                          <span className="badge badge-green text-xs">Active</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Actions */}
            {(userRole === 'admin' || userRole === 'instructor') && (
              <div className="flex items-center justify-end gap-3 mt-6">
                <button className="ios-btn-secondary">Export Report</button>
                <button className="ios-btn-primary">Generate Insights</button>
              </div>
            )}
          </div>
        </PlanGate>
      </AppLayout>
    </>
  );
}

export const getServerSideProps = async (context: any) => {
  const { tenant } = context.query;
  return {
    props: {
      tenant: tenant || 'demo',
    },
  };
};
