import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from '@apollo/client';
import {
  AppLayout,
  getDefaultLogo,
  getDefaultSidebarSections,
  SnackbarProvider,
  useSnackbar,
  DataListPage,
  EmptyState,
} from '@luxgen/ui';
import type { DataListTab, FilterChipData, SortOption } from '@luxgen/ui';
import { PageLoadingState, PageEmptyState } from '../../components/common/PageStates';
import { createHandleUserAction } from '../../lib/user-actions';
import { useLayoutUser } from '../../lib/app-layout-user';
import { useTenantScope } from '../../lib/use-tenant-scope';
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

const PRODUCT_TABS: DataListTab[] = [
  { id: 'ALL', label: 'All' },
  { id: 'PUBLISHED', label: 'Active' },
  { id: 'DRAFT', label: 'Draft' },
  { id: 'COMPLETED', label: 'Completed' },
  { id: 'CANCELLED', label: 'Archived' },
];

const SORT_OPTIONS: SortOption[] = [
  { id: 'updatedAt-desc', label: 'Updated (newest)' },
  { id: 'updatedAt-asc', label: 'Updated (oldest)' },
  { id: 'title-asc', label: 'Title A–Z' },
  { id: 'inventory-desc', label: 'Inventory (high)' },
];

const ProductsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
    />
  </svg>
);

function ProductsPage({ tenant }: ProductsPageProps) {
  const router = useRouter();
  const handleUserAction = createHandleUserAction(router);
  const layoutUser = useLayoutUser();
  const { queryTenantId } = useTenantScope(tenant);
  const { showSuccess, showError } = useSnackbar();
  const headerProps = useAppLayoutHeader();

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [activeFilters, setActiveFilters] = useState<FilterChipData[]>([]);
  const [sortId, setSortId] = useState('updatedAt-desc');
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  const { data, loading, error, refetch } = useQuery(GET_COURSES, {
    variables: { tenantId: queryTenantId },
    skip: !queryTenantId,
    fetchPolicy: 'cache-first',
  });

  const [updateCourse] = useMutation(UPDATE_COURSE);

  useEffect(() => {
    const q = router.query.search;
    if (typeof q === 'string') setSearch(q);
  }, [router.query.search]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId !== 'ALL') {
      const tab = PRODUCT_TABS.find((t) => t.id === tabId);
      if (tab) setActiveFilters([{ id: `status_${tabId}`, label: 'Status', value: tab.label }]);
    } else {
      setActiveFilters([]);
    }
  };

  const handleSortChange = (optionId: string) => setSortId(optionId);

  const handleClearAll = () => {
    setActiveFilters([]);
    setSearch('');
    setActiveTab('ALL');
  };

  const products = useMemo(() => {
    const raw: GraphQLCourseProduct[] = data?.courses ?? [];
    let rows = raw.map(courseToProductRow);

    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (p) =>
          p.title.toLowerCase().includes(q) || p.vendor.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q),
      );
    }

    if (activeTab !== 'ALL') {
      rows = rows.filter((p) => p.status === (activeTab as ProductStatus));
    }

    const [sortBy, sortDir] = sortId.split('-') as [SortKey, 'asc' | 'desc'];
    const dir = sortDir === 'asc' ? 1 : -1;
    rows.sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title) * dir;
      if (sortBy === 'status') return a.status.localeCompare(b.status) * dir;
      if (sortBy === 'inventory') return (a.inventory - b.inventory) * dir;
      return (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()) * dir;
    });

    return rows;
  }, [data, search, activeTab, sortId]);

  const tabsWithCounts: DataListTab[] = useMemo(() => {
    const raw: GraphQLCourseProduct[] = data?.courses ?? [];
    const all = raw.map(courseToProductRow);
    return PRODUCT_TABS.map((tab) => ({
      ...tab,
      count: tab.id === 'ALL' ? all.length : all.filter((p) => p.status === tab.id).length,
    }));
  }, [data]);

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
      await Promise.all(selected.map((id) => updateCourse({ variables: { id, input: { status } } })));
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
        <div className="admin-list-page max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <DataListPage
            icon={<ProductsIcon />}
            breadcrumb="Products"
            title="Products"
            primaryAction={{ label: '+ Add product', onClick: () => void router.push('/products/create') }}
            tabs={tabsWithCounts}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            searchQuery={search}
            onSearchChange={setSearch}
            activeFilters={activeFilters}
            onRemoveFilter={(id) => setActiveFilters((prev) => prev.filter((f) => f.id !== id))}
            onAddFilter={() => {}}
            onClearAll={handleClearAll}
            searchPlaceholder="Search title, vendor, SKU…"
            sortOptions={SORT_OPTIONS}
            selectedSortOption={sortId}
            sortDirection={sortId.endsWith('-asc') ? 'asc' : 'desc'}
            onSortOptionChange={handleSortChange}
            onSortDirectionChange={() => {}}
          >
            {/* Bulk action bar */}
            {selected.length > 0 && (
              <div
                className="flex flex-wrap items-center gap-3 px-4 py-2.5 border-b"
                style={{ borderColor: 'var(--color-separator)', background: 'var(--color-bg-tertiary)' }}
              >
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

            {error && !data ? (
              <PageEmptyState icon="⚠️" title="Could not load products" subtitle={error.message} />
            ) : products.length === 0 ? (
              <EmptyState
                title="No products found"
                description={
                  search || activeTab !== 'ALL'
                    ? 'Try changing the filters or search term'
                    : 'Create a course to list it here.'
                }
                action={
                  !search && activeTab === 'ALL'
                    ? { label: 'Add product', onClick: () => void router.push('/products/create') }
                    : undefined
                }
              />
            ) : (
              <div className="ios-table-wrap">
                <table className="ios-table">
                  <thead>
                    <tr>
                      <th style={{ width: 40 }}>
                        <input
                          type="checkbox"
                          checked={selected.length === products.length && products.length > 0}
                          onChange={toggleAll}
                          aria-label="Select all products"
                          style={{ accentColor: 'var(--color-blue)' }}
                        />
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
                          <input
                            type="checkbox"
                            checked={selected.includes(p.id)}
                            onChange={() => toggleOne(p.id)}
                            style={{ accentColor: 'var(--color-blue)' }}
                          />
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
            )}
          </DataListPage>
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
