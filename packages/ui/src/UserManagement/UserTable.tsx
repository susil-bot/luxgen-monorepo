import React, { useState, useMemo } from 'react';
import { UserTableProps } from './types';
import { UserRow } from './UserRow';
import { DataListPage, EmptyState } from '../DataList';
import type { DataListTab, FilterChipData, SortOption } from '../DataList';

const USER_TABS: DataListTab[] = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'pending', label: 'Pending' },
  { id: 'current_store', label: 'Current store' },
  { id: 'pos_only', label: 'POS app-only' },
  { id: 'requests', label: 'Requests' },
];

const SORT_OPTIONS: SortOption[] = [
  { id: 'last_name', label: 'Last name' },
  { id: 'first_name', label: 'First name' },
  { id: 'email', label: 'Email' },
  { id: 'status', label: 'Status' },
];

const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

export const UserTable: React.FC<UserTableProps> = ({
  users,
  loading = false,
  searchQuery = '',
  onSearchChange,
  onUserSelect,
  onSelectAll,
  selectedUsers = [],
  currentPage = 1,
  rowsPerPage = 10,
  onPageChange,
  onRowsPerPageChange,
  onExport,
  onAddUser,
  onUserAction,
}) => {
  const [activeTab, setActiveTab] = useState('all');
  const [activeFilters, setActiveFilters] = useState<FilterChipData[]>([]);
  const [sortOption, setSortOption] = useState('last_name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleRemoveFilter = (id: string) => {
    setActiveFilters((prev) => prev.filter((f) => f.id !== id));
  };

  const handleClearAll = () => {
    setActiveFilters([]);
    onSearchChange?.('');
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId !== 'all') {
      const tab = USER_TABS.find((t) => t.id === tabId);
      if (tab) {
        setActiveFilters([{ id: `tab_${tabId}`, label: 'User type', value: tab.label }]);
      }
    } else {
      setActiveFilters([]);
    }
  };

  const filteredUsers = useMemo(() => {
    let result = users;
    if (activeTab === 'active') result = result.filter((u) => u.status === 'active');
    else if (activeTab === 'pending') result = result.filter((u) => u.status === 'pending');
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.username.toLowerCase().includes(q),
      );
    }
    return result;
  }, [users, activeTab, searchQuery]);

  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, filteredUsers.length);
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
  const isAllSelected = selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--color-blue)' }} />
      </div>
    );
  }

  return (
    <div className="admin-list-page max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <DataListPage
        icon={<UsersIcon />}
        breadcrumb="Users"
        title="Users"
        secondaryAction={onExport ? { label: 'Export', onClick: onExport } : undefined}
        primaryAction={onAddUser ? { label: 'Add users', onClick: onAddUser } : undefined}
        tabs={USER_TABS}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        searchQuery={searchQuery}
        onSearchChange={(q) => onSearchChange?.(q)}
        activeFilters={activeFilters}
        onRemoveFilter={handleRemoveFilter}
        onAddFilter={() => {}}
        onClearAll={handleClearAll}
        searchPlaceholder="Search users"
        sortOptions={SORT_OPTIONS}
        selectedSortOption={sortOption}
        sortDirection={sortDirection}
        onSortOptionChange={setSortOption}
        onSortDirectionChange={setSortDirection}
      >
        {paginatedUsers.length === 0 ? (
          <EmptyState title="No users found" description="Try changing the filters or search term" />
        ) : (
          <>
            <div className="ios-table-wrap">
              <table className="ios-table">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={() => onSelectAll?.()}
                        className="rounded"
                        style={{ accentColor: 'var(--color-blue)' }}
                        aria-label="Select all users"
                      />
                    </th>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Plan</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((user) => (
                    <UserRow
                      key={user.id}
                      user={user}
                      selected={selectedUsers.includes(user.id)}
                      onSelect={onUserSelect}
                      onAction={onUserAction}
                      showCheckbox
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 py-3 border-t text-sm"
              style={{ borderColor: 'var(--color-separator)', color: 'var(--color-label-secondary)' }}
            >
              <div className="flex items-center gap-2">
                <span>Rows per page:</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => onRowsPerPageChange?.(Number(e.target.value))}
                  className="border rounded px-2 py-1 text-sm"
                  style={{
                    borderColor: 'var(--color-separator-opaque)',
                    background: 'var(--color-bg-secondary)',
                    color: 'var(--color-label-primary)',
                  }}
                >
                  {[5, 10, 25, 50].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span>
                  {startIndex + 1}–{endIndex} of {filteredUsers.length}
                </span>
                <button
                  type="button"
                  onClick={() => onPageChange?.(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border disabled:opacity-40"
                  style={{
                    borderColor: 'var(--color-separator-opaque)',
                    background: 'var(--color-bg-secondary)',
                  }}
                  aria-label="Previous page"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => onPageChange?.(Math.min(currentPage + 1, totalPages))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="p-1.5 rounded-lg border disabled:opacity-40"
                  style={{
                    borderColor: 'var(--color-separator-opaque)',
                    background: 'var(--color-bg-secondary)',
                  }}
                  aria-label="Next page"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        )}
      </DataListPage>
    </div>
  );
};
