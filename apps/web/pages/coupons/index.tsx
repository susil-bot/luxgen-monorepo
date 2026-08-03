import { useMemo, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import { AppLayout, DataListPage, EmptyState, SnackbarProvider } from '@luxgen/ui';
import type { DataListTab, SortOption } from '@luxgen/ui';
import { PageLoadingState } from '../../components/common/PageStates';
import { GET_COUPONS } from '../../graphql/queries/coupons';
import { getTenantPageProps } from '../../lib/tenant-page-props';
import { useCommercePageShell } from '../../lib/commerce-page-shell';
import { useAppTenantId } from '../../lib/app-layout-user';
import { getStoredUser } from '../../lib/session';

interface Props {
  tenant: string;
}

interface CouponRow {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  appliesTo: string;
  redemptionCount: number;
  usageLimit?: number | null;
  status: string;
}

const TABS: DataListTab[] = [
  { id: 'ALL', label: 'All' },
  { id: 'ACTIVE', label: 'Active' },
  { id: 'INACTIVE', label: 'Inactive' },
  { id: 'EXPIRED', label: 'Expired' },
];

const SORT_OPTIONS: SortOption[] = [
  { id: 'code-asc', label: 'Code A–Z' },
  { id: 'redemptions-desc', label: 'Redemptions (high)' },
  { id: 'created-desc', label: 'Newest' },
];

function formatDiscount(row: CouponRow): string {
  if (row.discountType === 'PERCENTAGE') return `${row.discountValue}% off`;
  if (row.discountType === 'FIXED_AMOUNT') return `$${(row.discountValue / 100).toFixed(2)} off`;
  if (row.discountType === 'FREE_SHIPPING') return 'Free shipping';
  return 'Buy X Get Y';
}

function statusBadge(status: string): string {
  if (status === 'ACTIVE') return 'badge badge-green';
  if (status === 'EXPIRED') return 'badge badge-red';
  return 'badge badge-blue';
}

function CouponsPageContent({ tenant }: Props) {
  const router = useRouter();
  const { appLayoutProps } = useCommercePageShell();
  const tenantId = useAppTenantId();
  const sessionUser = typeof window !== 'undefined' ? getStoredUser() : null;
  const queryTenantId = tenantId ?? sessionUser?.tenant.id;

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [sortId, setSortId] = useState('created-desc');

  const { data, loading } = useQuery(GET_COUPONS, {
    variables: {
      tenantId: queryTenantId,
      status: activeTab === 'ALL' ? undefined : activeTab,
      search: search.trim() || undefined,
    },
    skip: !queryTenantId,
    fetchPolicy: 'cache-and-network',
  });

  const rows: CouponRow[] = useMemo(() => {
    const list = (data?.coupons ?? []) as CouponRow[];
    const sorted = [...list];
    if (sortId === 'code-asc') sorted.sort((a, b) => a.code.localeCompare(b.code));
    if (sortId === 'redemptions-desc') sorted.sort((a, b) => b.redemptionCount - a.redemptionCount);
    return sorted;
  }, [data?.coupons, sortId]);

  return (
    <>
      <Head>
        <title>Coupons — {tenant}</title>
      </Head>
      <AppLayout {...appLayoutProps}>
        {loading && rows.length === 0 ? (
          <PageLoadingState label="Loading coupons…" />
        ) : (
          <DataListPage
            breadcrumb="Commerce"
            title="Coupons"
            primaryAction={{ label: 'Create coupon', onClick: () => void router.push('/coupons/create') }}
            tabs={TABS}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            searchPlaceholder="Search coupons…"
            searchQuery={search}
            onSearchChange={setSearch}
            sortOptions={SORT_OPTIONS}
            selectedSortOption={sortId}
            onSortOptionChange={setSortId}
          >
            {rows.length === 0 ? (
              <EmptyState
                title="No coupons yet"
                description="Create a percentage or fixed-amount discount to get started."
                action={{ label: 'Create coupon', onClick: () => void router.push('/coupons/create') }}
              />
            ) : (
              <ul className="divide-y px-4" style={{ borderColor: 'var(--color-separator)' }}>
                {rows.map((row) => (
                  <li
                    key={row.id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold" style={{ color: 'var(--color-label-primary)' }}>
                          {row.code}
                        </span>
                        <span className={statusBadge(row.status)}>{row.status}</span>
                        <span className="text-sm" style={{ color: 'var(--color-label-secondary)' }}>
                          {formatDiscount(row)}
                        </span>
                      </div>
                      <p className="text-sm mt-1" style={{ color: 'var(--color-label-secondary)' }}>
                        {row.appliesTo === 'ALL' ? 'Applies to all products' : `Applies to: ${row.appliesTo}`}
                        {' · '}
                        {row.redemptionCount} use{row.redemptionCount === 1 ? '' : 's'}
                        {row.usageLimit != null
                          ? ` · ${Math.max(row.usageLimit - row.redemptionCount, 0)} remaining`
                          : ''}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="ios-btn-secondary text-sm shrink-0"
                      onClick={() => void router.push(`/coupons/${row.id}/edit`)}
                    >
                      Edit
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </DataListPage>
        )}
      </AppLayout>
    </>
  );
}

export default function CouponsPage(props: Props) {
  return (
    <SnackbarProvider position="top-right" maxSnackbars={3}>
      <CouponsPageContent {...props} />
    </SnackbarProvider>
  );
}

export const getServerSideProps = getTenantPageProps;
