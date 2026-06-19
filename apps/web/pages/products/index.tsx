import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from '@apollo/client';
import { AppLayout, getDefaultLogo, getDefaultSidebarSections, SnackbarProvider, useSnackbar } from '@luxgen/ui';
import { PageLoadingState, PageEmptyState } from '../../components/common/PageStates';
import { createHandleUserAction } from '../../lib/user-actions';
import { useLayoutUser, useAppTenantId } from '../../lib/app-layout-user';
import { getStoredUser } from '../../lib/session';
import { GET_COURSES, UPDATE_COURSE } from '../../graphql/queries/courses';
import {
  courseToProductRow,
  formatProductDate,
  statusBadgeClass,
  type GraphQLCourseProduct,
  type ProductStatus,
} from '../../lib/product-display';
import { getTenantPageProps } from '../../lib/tenant-page-props';
import { useAppLayoutHeader } from '../../lib/app-layout-header';

interface ProductsPageProps {
  tenant: string;
}

type SortKey = 'title' | 'updatedAt' | 'inventory' | 'status';
type StatusFilter = 'ALL' | ProductStatus;

function ProductsPage({ tenant }: ProductsPageProps) {
  const router = useRouter();
  const handleUserAction = createHandleUserAction(router);
  const layoutUser = useLayoutUser();
  const tenantId = useAppTenantId();
  const sessionUser = typeof window !== 'undefined' ? getStoredUser() : null;
  const queryTenantId = tenantId ?? sessionUser?.tenant.id ?? tenant;
  const { showSuccess, showError } = useSnackbar();
  const headerProps = useAppLayoutHeader();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<SortKey>('updatedAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  const { data, loading, error, refetch } = useQuery(GET_COURSES, {
    variables: { tenantId: queryTenantId },
    skip: !queryTenantId,
    fetchPolicy: 'cache-and-network',
  });

  const [updateCourse] = useMutation(UPDATE_COURSE);

  useEffect(() => {
    const q = router.query.search;
    if (typeof q === 'string') setSearch(q);
  }, [router.query.search]);

  const products = useMemo(() => {
    const raw: GraphQLCourseProduct[] = data?.courses ?? [];
    let rows = raw.map(courseToProductRow);

    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.vendor.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q),
      );
    }

    if (statusFilter !== 'ALL') {
      rows = rows.filter((p) => p.status === statusFilter);
    }

    if (typeFilter !== 'ALL') {
      rows = rows.filter((p) => p.productType === typeFilter);
    }

    rows.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortBy === 'title') return a.title.localeCompare(b.title) * dir;
      if (sortBy === 'status') return a.status.localeCompare(b.status) * dir;
      if (sortBy === 'inventory') return (a.inventory - b.inventory) * dir;
      return (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()) * dir;
    });

    return rows;
  }, [data, search, statusFilter, typeFilter, sortBy, sortDir]);

  const toggleAll = () => {
    if (selected.length === products.length) setSelected([]);
    else setSelected(products.map((p) => p.id));
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const bulkSetStatus = async (status: 'DRAFT' | 'PUBLISHED') => {
    if (selected.length === 0) return;
    setBulkLoading(true);
    try {
      await Promise.all(
        selected.map((id) => updateCourse({ variables: { id, input: { status } } })),
      );
      await refetch();
      showSuccess(`${selected.length} product${selected.length === 1 ? '' : 's'} updated`);
      setSelected([]);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Bulk update failed');
    } finally {
      setBulkLoading(false);
    }
  };

  if (loading && !data) {
    return <PageLoadingState label="Loading products…" />;
  }

  return (
    <>
      <Head>
        <title>Products — {tenant}</title>
      </Head>

      <AppLayout
        sidebarSections={getDefaultSidebarSections()}
        user={layoutUser ?? undefined}
        logo={getDefaultLogo()}
        onUserAction={handleUserAction}
        {...headerProps}
        responsive
      >
        <div className="split-page admin-list-page max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="ios-large-title">Products</h1>
              <p className="mt-1 text-secondary text-sm">Courses as catalog products — search, filter, bulk actions</p>
            </div>
            <Link href="/products/create" className="ios-btn-primary">
              + Add product
            </Link>
          </div>

          <div className="ios-card p-4 flex flex-col lg:flex-row gap-3">
            <input
              type="search"
              placeholder="Search title, vendor, SKU…"
              className="ios-input flex-1"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select className="ios-input lg:w-40" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}>
              <option value="ALL">All statuses</option>
              <option value="PUBLISHED">Active</option>
              <option value="DRAFT">Draft</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Archived</option>
            </select>
            <select className="ios-input lg:w-36" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="ALL">All types</option>
              <option value="Course">Course</option>
            </select>
            <select
              className="ios-input lg:w-44"
              value={`${sortBy}-${sortDir}`}
              onChange={(e) => {
                const [k, d] = e.target.value.split('-') as [SortKey, 'asc' | 'desc'];
                setSortBy(k);
                setSortDir(d);
              }}
            >
              <option value="updatedAt-desc">Updated (newest)</option>
              <option value="updatedAt-asc">Updated (oldest)</option>
              <option value="title-asc">Title A–Z</option>
              <option value="inventory-desc">Inventory (high)</option>
            </select>
          </div>

          {selected.length > 0 && (
            <div className="ios-card p-3 flex flex-wrap items-center gap-3">
              <span className="text-sm text-secondary">{selected.length} selected</span>
              <button
                type="button"
                className="ios-btn-secondary text-sm"
                disabled={bulkLoading}
                onClick={() => void bulkSetStatus('DRAFT')}
              >
                Set draft
              </button>
              <button
                type="button"
                className="ios-btn-secondary text-sm"
                disabled={bulkLoading}
                onClick={() => void bulkSetStatus('PUBLISHED')}
              >
                Publish
              </button>
              <button type="button" className="ios-btn-plain text-sm" onClick={() => setSelected([])}>
                Clear
              </button>
            </div>
          )}

          {error && !data && (
            <PageEmptyState icon="⚠️" title="Could not load products" subtitle={error.message} />
          )}

          {!error && products.length === 0 && (
            <PageEmptyState
              icon="📦"
              title="No products yet"
              subtitle="Create a course to list it here."
              action={
                <Link href="/products/create" className="ios-btn-primary mt-4 inline-block">
                  Add product
                </Link>
              }
            />
          )}

          {products.length > 0 && (
            <div className="ios-card overflow-hidden">
              <div className="ios-table-wrap">
                <table className="ios-table">
                  <thead>
                    <tr>
                      <th>
                        <input type="checkbox" checked={selected.length === products.length} onChange={toggleAll} />
                      </th>
                      <th>Product</th>
                      <th>Status</th>
                      <th>Inventory</th>
                      <th>Type</th>
                      <th>Vendor</th>
                      <th>SKU</th>
                      <th>Price</th>
                      <th>Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <input type="checkbox" checked={selected.includes(p.id)} onChange={() => toggleOne(p.id)} />
                        </td>
                        <td>
                          <button
                            type="button"
                            className="ios-btn-plain text-left font-medium p-0"
                            onClick={() => void router.push(`/products/${p.id}/edit`)}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="ios-avatar ios-avatar-sm"
                                style={{ background: 'var(--color-fill-secondary)' }}
                              >
                                📘
                              </div>
                              {p.title}
                            </div>
                          </button>
                        </td>
                        <td>
                          <span className={`badge ${statusBadgeClass(p.status)}`}>{p.status}</span>
                        </td>
                        <td>{p.inventory}</td>
                        <td>{p.productType}</td>
                        <td>{p.vendor}</td>
                        <td className="text-secondary text-sm">{p.sku}</td>
                        <td>{p.price}</td>
                        <td className="text-secondary text-sm">{formatProductDate(p.updatedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </AppLayout>
    </>
  );
}

function ProductsPageWithSnackbar(props: ProductsPageProps) {
  return (
    <SnackbarProvider position="top-right" maxSnackbars={3}>
      <ProductsPage {...props} />
    </SnackbarProvider>
  );
}

export default ProductsPageWithSnackbar;

export const getServerSideProps = getTenantPageProps;
