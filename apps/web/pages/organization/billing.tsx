import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { DataListPage, SnackbarProvider, EmptyState, type SortOption, type SortDirection } from '@luxgen/ui';
import { OrganizationShell } from '../../components/organization/OrganizationShell';
import { PageLoadingState } from '../../components/common/PageStates';
import { useAppTenantId } from '../../lib/app-layout-user';
import { getStoredUser } from '../../lib/session';
import { getTenantPageProps } from '../../lib/tenant-page-props';
import { getWebUrl } from '../../lib/urls';
import { GET_TENANT_BILLING, CREATE_BILLING_PORTAL, GET_PRICING_PLANS } from '../../graphql/queries/billing';
import {
  buildPastBills,
  filterBillsByTab,
  formatBillDate,
  formatMoney,
  getBillStatusTabs,
  getCurrentBillingCycle,
  getPaymentMethodLabel,
  paymentStatusBadge,
  paymentStatusLabel,
  billTypeLabel,
  exportBillsCsv,
  type PastBill,
} from '../../lib/organization-billing';
import { downloadCsv } from '../../lib/export-csv';

interface Props {
  tenant: string;
}

const BILL_SORT: SortOption[] = [
  { id: 'date', label: 'Date issued' },
  { id: 'amount', label: 'Amount' },
  { id: 'status', label: 'Payment status' },
];

const BillingIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"
    />
  </svg>
);

const WalletIcon = () => (
  <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
    />
  </svg>
);

function OrganizationBillingContent({ tenant }: Props) {
  const tenantId = useAppTenantId();
  const sessionUser = typeof window !== 'undefined' ? getStoredUser() : null;
  const queryTenantId = tenantId ?? sessionUser?.tenant.id ?? tenant;
  const appUrl = getWebUrl();

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selected, setSelected] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [page, setPage] = useState(0);
  const [profileOpen, setProfileOpen] = useState(false);
  const pageSize = 5;

  const { data, loading } = useQuery(GET_TENANT_BILLING, {
    variables: { tenantId: queryTenantId },
    skip: !queryTenantId,
    errorPolicy: 'ignore',
  });

  const { data: plansData } = useQuery(GET_PRICING_PLANS, { errorPolicy: 'ignore' });

  const [createPortal] = useMutation(CREATE_BILLING_PORTAL);

  const billing = data?.tenantBilling;
  const cycle = getCurrentBillingCycle(billing?.currentPeriodEnd);
  const runningTotal = billing?.priceMonthly ?? 0;
  cycle.runningTotal = runningTotal;

  const allBills = useMemo(
    () =>
      billing
        ? buildPastBills({
            priceMonthly: billing.priceMonthly ?? 0,
            planName: billing.planName ?? billing.plan,
            subscriptionStatus: billing.subscriptionStatus ?? 'active',
          })
        : [],
    [billing],
  );

  const tabs = useMemo(() => getBillStatusTabs(allBills), [allBills]);

  const filtered = useMemo(() => {
    let rows = filterBillsByTab(allBills, activeTab);
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (b) =>
          b.billNumber.toLowerCase().includes(q) ||
          billTypeLabel(b.billType).toLowerCase().includes(q) ||
          paymentStatusLabel(b.paymentStatus).toLowerCase().includes(q),
      );
    }
    const dir = sortDirection === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      switch (sortOption) {
        case 'amount':
          return (a.amount - b.amount) * dir;
        case 'status':
          return paymentStatusLabel(a.paymentStatus).localeCompare(paymentStatusLabel(b.paymentStatus)) * dir;
        default:
          return (new Date(a.dateIssued).getTime() - new Date(b.dateIssued).getTime()) * dir;
      }
    });
  }, [allBills, activeTab, search, sortOption, sortDirection]);

  const pageBills = filtered.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const handlePortal = async () => {
    try {
      const { data: portalData } = await createPortal({
        variables: {
          tenantId: queryTenantId,
          returnUrl: `${appUrl}/organization/billing?tenant=${queryTenantId}`,
        },
      });
      if (portalData?.createBillingPortalSession?.url) {
        window.location.href = portalData.createBillingPortalSession.url;
      } else {
        setProfileOpen(true);
      }
    } catch {
      setProfileOpen(true);
    }
  };

  const toggleAll = () => {
    if (selected.length === pageBills.length) setSelected([]);
    else setSelected(pageBills.map((b) => b.id));
  };

  if (loading && !billing) {
    return (
      <OrganizationShell tenant={tenant} activeSection="billing" title="Billing">
        <PageLoadingState label="Loading billing…" />
      </OrganizationShell>
    );
  }

  return (
    <OrganizationShell
      tenant={tenant}
      activeSection="billing"
      title="Billing"
      subtitle="Current cycle, payment method, and past bills"
    >
      {/* Page toolbar */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-primary">
          <BillingIcon />
          <span className="text-lg font-semibold">Billing</span>
        </div>
        <button
          type="button"
          className="ios-btn-secondary text-sm flex items-center gap-2"
          onClick={() => void handlePortal()}
        >
          <BillingIcon />
          Billing profile
        </button>
      </div>

      {/* Current billing cycle */}
      <section className="ios-card p-5 mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-primary">Current billing cycle</h2>
            <p className="text-sm text-secondary mt-1">
              {formatBillDate(cycle.start.toISOString())} – {formatBillDate(cycle.end.toISOString())}{' '}
              <button type="button" className="ios-btn-plain text-sm">
                View current charges
              </button>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-secondary">Running total</p>
            <p className="text-xl font-bold text-primary">
              {formatMoney(runningTotal, cycle.currency)}{' '}
              <span className="text-sm font-normal text-secondary">{cycle.currency}</span>
            </p>
          </div>
        </div>

        <div
          className="flex items-center justify-between gap-4 p-4 rounded-xl"
          style={{ border: '1px solid var(--color-separator)', background: 'var(--color-fill-tertiary)' }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <WalletIcon />
            <span className="text-sm text-primary truncate">
              {billing ? getPaymentMethodLabel(billing.stripeConfigured, billing.plan) : 'Loading payment method…'}
            </span>
          </div>
          <button
            type="button"
            className="ios-btn-plain p-2 flex-shrink-0"
            aria-label="Edit payment method"
            onClick={() => void handlePortal()}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </button>
        </div>

        {billing && (
          <p className="text-xs text-tertiary">
            Plan: <strong className="text-secondary">{billing.planName}</strong>
            {billing.priceMonthly > 0 && ` · ${formatMoney(billing.priceMonthly)}/month`}
            {' · '}
            Status: {billing.subscriptionStatus}
          </p>
        )}
      </section>

      {/* Past bills */}
      <DataListPage
        icon={<BillingIcon />}
        breadcrumb="Organization"
        title="Past bills"
        secondaryAction={{
          label: 'Export',
          onClick: () => {
            const rows = selected.length ? filtered.filter((b) => selected.includes(b.id)) : filtered;
            downloadCsv(`${tenant}-bills.csv`, exportBillsCsv(rows));
          },
        }}
        primaryAction={{
          label: 'Manage plan',
          onClick: () => void handlePortal(),
        }}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(id) => {
          setActiveTab(id);
          setPage(0);
        }}
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search bills…"
        sortOptions={BILL_SORT}
        selectedSortOption={sortOption}
        sortDirection={sortDirection}
        onSortOptionChange={setSortOption}
        onSortDirectionChange={setSortDirection}
        onClearAll={() => {
          setSearch('');
          setActiveTab('all');
          setPage(0);
        }}
      >
        {filtered.length === 0 ? (
          <EmptyState
            title="No bills match"
            description={search ? `Nothing matches "${search}".` : 'No bills for this filter.'}
          />
        ) : (
          <>
            <div className="ios-table-wrap">
              <table className="ios-table">
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        checked={selected.length === pageBills.length && pageBills.length > 0}
                        onChange={toggleAll}
                        aria-label="Select all bills"
                      />
                    </th>
                    <th>Date issued</th>
                    <th>Bill number</th>
                    <th>Bill type</th>
                    <th>Payment status</th>
                    <th className="text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {pageBills.map((bill: PastBill) => (
                    <tr key={bill.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selected.includes(bill.id)}
                          onChange={() =>
                            setSelected((prev) =>
                              prev.includes(bill.id) ? prev.filter((id) => id !== bill.id) : [...prev, bill.id],
                            )
                          }
                          aria-label={`Select bill ${bill.billNumber}`}
                        />
                      </td>
                      <td>{formatBillDate(bill.dateIssued)}</td>
                      <td className="font-medium text-primary">{bill.billNumber}</td>
                      <td className="text-secondary">{billTypeLabel(bill.billType)}</td>
                      <td>
                        <span className={`badge ${paymentStatusBadge(bill.paymentStatus)}`}>
                          {paymentStatusLabel(bill.paymentStatus)}
                        </span>
                      </td>
                      <td className="text-right font-medium">{formatMoney(bill.amount, bill.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div
              className="flex items-center justify-center gap-3 py-4"
              style={{ borderTop: '1px solid var(--color-separator)' }}
            >
              <button
                type="button"
                className="ios-btn-secondary px-3 py-1.5 disabled:opacity-40"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                aria-label="Previous page"
              >
                ←
              </button>
              <span className="text-sm text-secondary">
                {page + 1} / {totalPages}
              </span>
              <button
                type="button"
                className="ios-btn-secondary px-3 py-1.5 disabled:opacity-40"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                aria-label="Next page"
              >
                →
              </button>
            </div>
          </>
        )}
      </DataListPage>

      {/* Plan cards (compact) */}
      {plansData?.pricingPlans?.length > 0 && (
        <section className="mt-8">
          <h2 className="text-base font-semibold text-primary mb-3">Available plans</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {plansData.pricingPlans.map(
              (plan: { id: string; name: string; priceMonthly: number; description: string }) => (
                <div
                  key={plan.id}
                  className="ios-card p-4"
                  style={{
                    borderColor: billing?.plan === plan.id ? 'var(--color-blue)' : 'var(--color-separator)',
                  }}
                >
                  <p className="font-semibold text-primary">{plan.name}</p>
                  <p className="text-lg font-bold text-primary mt-1">
                    {formatMoney(plan.priceMonthly)}
                    <span className="text-sm font-normal text-secondary">/mo</span>
                  </p>
                  <p className="text-xs text-secondary mt-2">{plan.description}</p>
                  {billing?.plan === plan.id && <span className="badge badge-blue mt-3 inline-block">Current</span>}
                </div>
              ),
            )}
          </div>
        </section>
      )}

      {profileOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          role="dialog"
          aria-modal="true"
        >
          <div className="ios-card max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-semibold text-primary">Billing profile</h3>
            <p className="text-sm text-secondary">
              Organization: <strong>{tenant}</strong>
            </p>
            {billing && (
              <ul className="text-sm text-secondary space-y-2">
                <li>Plan: {billing.planName}</li>
                <li>Status: {billing.subscriptionStatus}</li>
                <li>Payment: {getPaymentMethodLabel(billing.stripeConfigured, billing.plan)}</li>
              </ul>
            )}
            <button type="button" className="ios-btn-primary w-full" onClick={() => setProfileOpen(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </OrganizationShell>
  );
}

export default function OrganizationBillingPage(props: Props) {
  return (
    <SnackbarProvider position="top-right" maxSnackbars={3}>
      <OrganizationBillingContent {...props} />
    </SnackbarProvider>
  );
}

export const getServerSideProps = getTenantPageProps;
