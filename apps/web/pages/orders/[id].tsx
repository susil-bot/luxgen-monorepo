import { useCallback, useEffect, useMemo } from 'react';
import { useAppShellConfig } from '../../lib/app-shell-config';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import {
  AppLayout,
  OrderDetailView,
  buildOrdersFromEnrollments,
  findOrderDetail,
  isLegacyOrderId,
  isStandardOrderId,
  parseLegacyOrderId,
  SnackbarProvider,
  useSnackbar } from '@luxgen/ui';
import { PageLoadingState } from '../../components/common/PageStates';
import { createHandleUserAction } from '../../lib/user-actions';
import { useLayoutUser } from '../../lib/app-layout-user';
import { useTenantScope } from '../../lib/use-tenant-scope';
import { GET_COURSES } from '../../graphql/queries/courses';
import { GET_USERS } from '../../graphql/queries/users';
import { GET_ENROLLMENTS, GET_ENROLLMENT_BY_ID, GET_ENROLLMENT } from '../../graphql/queries/enrollment';
import { getTenantPageProps } from '../../lib/tenant-page-props';
import { useAppLayoutHeader } from '../../lib/app-layout-header';
import { useActivityTimeline } from '../../lib/use-activity-timeline';
import { useOrderEnrollment } from '../../lib/use-order-enrollment';
import { useOrderActions } from '../../lib/use-order-actions';
import { isMongoObjectId } from '../../lib/mongo-id';

interface Props {
  tenant: string;
}

function OrderDetailPageContent({ tenant }: Props) {
  const { sidebarSections, logo } = useAppShellConfig();
  const router = useRouter();
  const handleUserAction = createHandleUserAction(router);
  const layoutUser = useLayoutUser();
  const { queryTenantId } = useTenantScope(tenant);
  const { showSuccess, showError } = useSnackbar();
  const headerProps = useAppLayoutHeader();

  const rawId = router.query.id;
  const orderId = typeof rawId === 'string' ? decodeURIComponent(rawId) : '';

  const legacyParts = parseLegacyOrderId(orderId);
  const legacyCourseId = legacyParts?.courseId;
  const legacyStudentId = legacyParts?.studentId;

  const { data: legacyEnrollmentData } = useQuery(GET_ENROLLMENT, {
    variables: { courseId: legacyCourseId, studentId: legacyStudentId },
    skip: !legacyCourseId || !legacyStudentId,
    fetchPolicy: 'cache-and-network' });

  const { data: enrollmentByIdData } = useQuery(GET_ENROLLMENT_BY_ID, {
    variables: { id: orderId },
    skip: !isStandardOrderId(orderId),
    fetchPolicy: 'cache-and-network' });

  const { data: coursesData, loading: coursesLoading } = useQuery(GET_COURSES, {
    variables: { tenantId: queryTenantId },
    skip: !queryTenantId,
    fetchPolicy: 'cache-and-network' });

  const { data: usersData, loading: usersLoading } = useQuery(GET_USERS, {
    variables: { tenantId: queryTenantId },
    skip: !queryTenantId,
    fetchPolicy: 'cache-and-network' });

  const { data: enrollmentsData, loading: enrollmentsLoading } = useQuery(GET_ENROLLMENTS, {
    variables: { tenantId: queryTenantId },
    skip: !isMongoObjectId(queryTenantId),
    fetchPolicy: 'cache-and-network' });

  const baseOrder = useMemo(() => {
    const orders = buildOrdersFromEnrollments(coursesData?.courses, usersData?.users, enrollmentsData?.enrollments);
    return findOrderDetail(orders, orderId, coursesData?.courses);
  }, [coursesData, usersData, enrollmentsData, orderId]);

  const {
    order: orderWithEnrollment,
    notes,
    onNotesChange,
    savingNotes,
    timelineSubjectId } = useOrderEnrollment(baseOrder, queryTenantId);

  const order = orderWithEnrollment ?? baseOrder;
  const loading =
    !orderId ||
    ((coursesLoading || usersLoading || enrollmentsLoading) && !order && !enrollmentByIdData?.enrollmentById);

  useEffect(() => {
    if (!isLegacyOrderId(orderId)) return;
    const canonicalId = order?.id && isStandardOrderId(order.id) ? order.id : legacyEnrollmentData?.enrollment?.id;
    if (canonicalId && canonicalId !== orderId) {
      void router.replace(`/orders/${canonicalId}`, undefined, { shallow: false });
    }
  }, [orderId, order?.id, legacyEnrollmentData?.enrollment?.id, router]);

  // Resolve order from enrollmentById when not in list yet
  const resolvedOrder = useMemo(() => {
    if (order) return order;
    const en = enrollmentByIdData?.enrollmentById;
    if (!en) return null;
    const orders = buildOrdersFromEnrollments(
      coursesData?.courses,
      usersData?.users,
      enrollmentsData?.enrollments ?? [en],
    );
    return findOrderDetail(orders, en.id, coursesData?.courses);
  }, [order, enrollmentByIdData, coursesData, usersData, enrollmentsData]);

  const displayOrder = resolvedOrder ?? order;
  const timelineId = timelineSubjectId || displayOrder?.subjectId || orderId;

  const staffInitials =
    layoutUser?.name
      ?.split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2) ?? 'ST';

  const mentionOptions = useMemo(
    () =>
      (usersData?.users ?? [])
        .filter((u: { role: string }) => u.role !== 'STUDENT' && u.role !== 'student')
        .map((u: { email?: string; firstName?: string }) =>
          (u.email?.split('@')[0] || u.firstName || 'staff').toLowerCase(),
        ),
    [usersData],
  );

  const timeline = useActivityTimeline(
    isMongoObjectId(queryTenantId) ? queryTenantId : undefined,
    'ORDER',
    isLegacyOrderId(timelineId) ? timelineId : (displayOrder?.subjectId ?? timelineId),
    staffInitials,
    mentionOptions,
  );

  const { refund, cancel, refunding, cancelling } = useOrderActions(displayOrder, queryTenantId);

  const handleRefund = useCallback(async () => {
    if (!window.confirm('Refund this order? Payment will be marked as refunded.')) return;
    try {
      await refund();
      showSuccess('Order refunded');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to refund order');
    }
  }, [refund, showError, showSuccess]);

  const handleCancel = useCallback(async () => {
    if (!window.confirm('Cancel this order? The customer will be unenrolled from the course.')) return;
    try {
      await cancel();
      showSuccess('Order cancelled');
      void router.push('/orders');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to cancel order');
    }
  }, [cancel, router, showError, showSuccess]);

  return (
    <>
      <Head>
        <title>
          {displayOrder ? `${displayOrder.orderNumber} — Orders` : 'Order'} — {tenant}
        </title>
      </Head>

      <AppLayout
        sidebarSections={sidebarSections}
        user={layoutUser ?? undefined}
        logo={logo}
        onUserAction={handleUserAction}
        {...headerProps}
        responsive
      >
        {loading ? (
          <PageLoadingState label="Loading order…" />
        ) : !displayOrder ? (
          <div className="max-w-2xl mx-auto px-4 py-16 text-center">
            <p className="text-secondary">Order not found</p>
            <Link href="/orders" className="ios-btn-primary mt-4 inline-block">
              Back to orders
            </Link>
          </div>
        ) : (
          <OrderDetailView
            order={displayOrder}
            editHref={`/orders/${orderId}/edit`}
            onRefund={handleRefund}
            onCancel={handleCancel}
            refunding={refunding}
            cancelling={cancelling}
            timeline={timeline}
            notes={notes}
            onNotesChange={onNotesChange}
            savingNotes={savingNotes}
          />
        )}
      </AppLayout>
    </>
  );
}

export default function OrderDetailPage(props: Props) {
  return (
    <SnackbarProvider position="top-right" maxSnackbars={3}>
      <OrderDetailPageContent {...props} />
    </SnackbarProvider>
  );
}
