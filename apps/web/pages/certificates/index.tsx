import { useMemo, useState } from 'react';
import Head from 'next/head';
import { useQuery } from '@apollo/client';
import { AppLayout, DataListPage, EmptyState, SnackbarProvider } from '@luxgen/ui';
import type { DataListTab } from '@luxgen/ui';
import { PageLoadingState } from '../../components/common/PageStates';
import { GET_ISSUED_CERTIFICATES } from '../../graphql/queries/certificates';
import { getTenantPageProps } from '../../lib/tenant-page-props';
import { useCommercePageShell } from '../../lib/commerce-page-shell';
import { useAppTenantId } from '../../lib/app-layout-user';
import { getStoredUser } from '../../lib/session';

interface Props {
  tenant: string;
}

interface IssuedCert {
  id: string;
  courseTitle: string;
  studentName?: string | null;
  studentEmail?: string | null;
  issuedAt: string;
  verificationCode: string;
  certificateExpiresAt?: string | null;
}

const TABS: DataListTab[] = [
  { id: 'ALL', label: 'All issued' },
  { id: 'EXPIRING', label: 'Expiring soon' },
  { id: 'EXPIRED', label: 'Expired' },
];

function formatDate(value?: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function daysUntil(value?: string | null): number | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function CertificatesPageContent({ tenant }: Props) {
  const { appLayoutProps } = useCommercePageShell();
  const tenantId = useAppTenantId();
  const sessionUser = typeof window !== 'undefined' ? getStoredUser() : null;
  const queryTenantId = tenantId ?? sessionUser?.tenant.id;

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');

  const { data, loading } = useQuery(GET_ISSUED_CERTIFICATES, {
    variables: { tenantId: queryTenantId, search: search.trim() || undefined },
    skip: !queryTenantId,
    fetchPolicy: 'cache-and-network',
  });

  const rows = useMemo(() => {
    const list = (data?.issuedCertificates ?? []) as IssuedCert[];
    if (activeTab === 'ALL') return list;
    return list.filter((c) => {
      const days = daysUntil(c.certificateExpiresAt);
      if (days == null) return false;
      if (activeTab === 'EXPIRED') return days < 0;
      if (activeTab === 'EXPIRING') return days >= 0 && days <= 30;
      return true;
    });
  }, [data?.issuedCertificates, activeTab]);

  return (
    <>
      <Head>
        <title>Certificates — {tenant}</title>
      </Head>
      <AppLayout {...appLayoutProps}>
        {loading && !data ? (
          <PageLoadingState label="Loading certificates…" />
        ) : (
          <DataListPage
            breadcrumb="Learning"
            title="Issued certificates"
            tabs={TABS}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            searchPlaceholder="Search learner, course, or code…"
            searchQuery={search}
            onSearchChange={setSearch}
          >
            {rows.length === 0 ? (
              <EmptyState
                title="No issued certificates"
                description="Certificates appear when learners complete a course (or when ISSUE_CERTIFICATE automation runs)."
              />
            ) : (
              <div className="ios-table-wrap">
                <table className="ios-table">
                  <thead>
                    <tr>
                      <th>Learner</th>
                      <th>Course</th>
                      <th>Issued</th>
                      <th>Expires</th>
                      <th>Verification</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => {
                      const days = daysUntil(row.certificateExpiresAt);
                      const expiryBadge =
                        days == null
                          ? null
                          : days < 0
                            ? 'badge badge-red'
                            : days <= 30
                              ? 'badge badge-orange'
                              : 'badge badge-green';
                      return (
                        <tr key={row.id}>
                          <td>
                            <div className="font-medium" style={{ color: 'var(--color-label-primary)' }}>
                              {row.studentName || 'Learner'}
                            </div>
                            {row.studentEmail ? (
                              <div className="text-xs" style={{ color: 'var(--color-label-secondary)' }}>
                                {row.studentEmail}
                              </div>
                            ) : null}
                          </td>
                          <td>{row.courseTitle}</td>
                          <td>{formatDate(row.issuedAt)}</td>
                          <td>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span>{formatDate(row.certificateExpiresAt)}</span>
                              {expiryBadge ? (
                                <span className={expiryBadge}>
                                  {days != null && days < 0 ? 'Expired' : days != null ? `${days}d` : ''}
                                </span>
                              ) : (
                                <span className="text-xs" style={{ color: 'var(--color-label-tertiary)' }}>
                                  No expiry
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            <code className="text-xs">{row.verificationCode}</code>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </DataListPage>
        )}
      </AppLayout>
    </>
  );
}

export default function CertificatesPage(props: Props) {
  return (
    <SnackbarProvider position="top-right" maxSnackbars={3}>
      <CertificatesPageContent {...props} />
    </SnackbarProvider>
  );
}

export const getServerSideProps = getTenantPageProps;
