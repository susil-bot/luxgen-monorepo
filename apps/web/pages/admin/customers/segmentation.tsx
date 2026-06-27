import { useState } from 'react';
import { useAppShellConfig } from '../../../lib/app-shell-config';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import { AppLayout, SnackbarProvider } from '@luxgen/ui';
import { PageLoadingState } from '../../../components/common/PageStates';
import { createHandleUserAction } from '../../../lib/user-actions';
import { useLayoutUser, useAppTenantId } from '../../../lib/app-layout-user';
import { getTenantPageProps } from '../../../lib/tenant-page-props';
import { useAppLayoutHeader } from '../../../lib/app-layout-header';
import { isMongoObjectId } from '../../../lib/mongo-id';
import { GET_CUSTOMER_SEGMENTS, GET_CUSTOMERS_IN_SEGMENT } from '../../../graphql/queries/learner';

interface Props {
  tenant: string;
}

type SegmentId = 'ALL' | 'ACTIVE_LEARNERS' | 'AT_RISK' | 'HIGH_VALUE' | 'INACTIVE';

function formatDate(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString();
}

function formatMoney(cents: number): string {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(cents / 100);
}

function CustomerSegmentationContent({ tenant }: Props) {
  const { sidebarSections, logo } = useAppShellConfig();
  const router = useRouter();
  const handleUserAction = createHandleUserAction(router);
  const layoutUser = useLayoutUser();
  const tenantId = useAppTenantId();
  const headerProps = useAppLayoutHeader();
  const [selectedSegment, setSelectedSegment] = useState<SegmentId>('ALL');

  const { data: segmentData, loading: segmentsLoading } = useQuery(GET_CUSTOMER_SEGMENTS, {
    variables: { tenantId },
    skip: !isMongoObjectId(tenantId),
    fetchPolicy: 'cache-and-network' });

  const { data: membersData, loading: membersLoading } = useQuery(GET_CUSTOMERS_IN_SEGMENT, {
    variables: { tenantId, segment: selectedSegment },
    skip: !isMongoObjectId(tenantId),
    fetchPolicy: 'cache-and-network' });

  const segments = segmentData?.customerSegments ?? [];
  const members = membersData?.customersInSegment ?? [];
  const loading = (segmentsLoading || membersLoading) && segments.length === 0;

  return (
    <>
      <Head>
        <title>Segmentation — Customers — {tenant}</title>
      </Head>
      <AppLayout
        sidebarSections={sidebarSections}
        user={layoutUser ?? undefined}
        logo={logo}
        onUserAction={handleUserAction}
        {...headerProps}
        responsive
      >
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-primary">Segmentation</h1>
            <p className="text-secondary mt-2">
              Customer segments derived from enrollment activity, progress, and purchase history.
            </p>
          </div>

          {loading ? (
            <PageLoadingState label="Loading customer segments…" />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {segments.map((segment) => (
                  <button
                    key={segment.segment}
                    type="button"
                    onClick={() => setSelectedSegment(segment.segment as SegmentId)}
                    className={`text-left p-4 rounded-xl border transition-colors ${
                      selectedSegment === segment.segment
                        ? 'border-[var(--color-tint)] bg-[var(--color-fill-tertiary)]'
                        : 'border-[var(--color-separator)] bg-[var(--color-bg-elevated)]'
                    }`}
                  >
                    <div className="font-semibold text-primary">{segment.label}</div>
                    <div className="text-2xl font-bold text-primary mt-2">{segment.customerCount}</div>
                    <div className="text-sm text-secondary mt-1">
                      {segment.orderCount} orders · {segment.avgProgressPercent}% avg progress
                    </div>
                  </button>
                ))}
              </div>

              <div className="rounded-xl border border-[var(--color-separator)] overflow-hidden">
                <div className="px-4 py-3 border-b border-[var(--color-separator)] bg-[var(--color-fill-tertiary)]">
                  <h2 className="font-semibold text-primary">
                    {segments.find((s) => s.segment === selectedSegment)?.label ?? selectedSegment}
                  </h2>
                </div>
                {members.length === 0 ? (
                  <p className="px-4 py-8 text-secondary">No customers in this segment.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-secondary border-b border-[var(--color-separator)]">
                          <th className="px-4 py-3 font-medium">Customer</th>
                          <th className="px-4 py-3 font-medium">Orders</th>
                          <th className="px-4 py-3 font-medium">Last order</th>
                          <th className="px-4 py-3 font-medium">Paid</th>
                          <th className="px-4 py-3 font-medium">Progress</th>
                          <th className="px-4 py-3 font-medium">Segment</th>
                        </tr>
                      </thead>
                      <tbody>
                        {members.map((member) => (
                          <tr
                            key={member.customerId}
                            className="border-b border-[var(--color-separator)] last:border-0"
                          >
                            <td className="px-4 py-3">
                              <Link
                                href={`/admin/customers/${member.customerId}`}
                                className="font-medium text-primary hover:underline"
                              >
                                {member.customerName}
                              </Link>
                              <div className="text-secondary text-xs">{member.customerEmail}</div>
                            </td>
                            <td className="px-4 py-3 text-primary">{member.orderCount}</td>
                            <td className="px-4 py-3 text-primary">{formatDate(member.lastOrderAt)}</td>
                            <td className="px-4 py-3 text-primary">{formatMoney(member.totalPaidCents)}</td>
                            <td className="px-4 py-3 text-primary">{member.avgProgressPercent}%</td>
                            <td className="px-4 py-3 text-secondary">{member.segment}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </AppLayout>
    </>
  );
}

export default function CustomerSegmentationPage(props: Props) {
  return (
    <SnackbarProvider position="top-right" maxSnackbars={3}>
      <CustomerSegmentationContent {...props} />
    </SnackbarProvider>
  );
}
