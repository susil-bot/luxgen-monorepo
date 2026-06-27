import React from 'react';

export interface Column<T> {
  key: keyof T;
  title: string;
  render?: (value: unknown, item: T) => React.ReactNode;
}

export interface TablePagination {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (p: number) => void;
}

export interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  pagination?: TablePagination;
}

export const Table = <T extends Record<string, unknown>>({
  data,
  columns,
  loading = false,
  emptyMessage = 'No data available',
  className = '',
}: TableProps<T>) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="ios-spinner" aria-label="Loading" />
      </div>
    );
  }

  if (data.length === 0) {
    return <div className="text-center py-8 text-secondary text-sm">{emptyMessage}</div>;
  }

  return (
    <div className={`ios-table-wrap ${className}`}>
      <div className="overflow-x-auto">
        <table className="ios-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={String(column.key)}>{column.title}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column) => (
                  <td key={String(column.key)}>
                    {column.render ? column.render(item[column.key], item) : String(item[column.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
