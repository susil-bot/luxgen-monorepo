import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataListPage } from './DataListPage';

const tabs = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'archived', label: 'Archived' },
];

describe('DataListPage', () => {
  const baseProps = {
    title: 'Products',
    tabs,
    activeTab: 'all',
    onTabChange: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it('renders the page title', () => {
    render(
      <DataListPage {...baseProps}>
        <div />
      </DataListPage>,
    );
    expect(screen.getByText('Products')).toBeInTheDocument();
  });

  it('renders tab labels', () => {
    render(
      <DataListPage {...baseProps}>
        <div />
      </DataListPage>,
    );
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Archived')).toBeInTheDocument();
  });

  it('calls onTabChange when a tab is clicked', () => {
    render(
      <DataListPage {...baseProps}>
        <div />
      </DataListPage>,
    );
    fireEvent.click(screen.getByText('Active'));
    expect(baseProps.onTabChange).toHaveBeenCalledWith('active');
  });

  it('renders children content', () => {
    render(
      <DataListPage {...baseProps}>
        <p>List content here</p>
      </DataListPage>,
    );
    expect(screen.getByText('List content here')).toBeInTheDocument();
  });

  it('renders the primary action button when provided', () => {
    const primaryAction = { label: 'Add product', onClick: jest.fn() };
    render(
      <DataListPage {...baseProps} primaryAction={primaryAction}>
        <div />
      </DataListPage>,
    );
    expect(screen.getByRole('button', { name: 'Add product' })).toBeInTheDocument();
  });

  it('calls primary action onClick when clicked', () => {
    const primaryAction = { label: 'Add product', onClick: jest.fn() };
    render(
      <DataListPage {...baseProps} primaryAction={primaryAction}>
        <div />
      </DataListPage>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Add product' }));
    expect(primaryAction.onClick).toHaveBeenCalledTimes(1);
  });

  it('opens the search bar when search toggle is clicked', () => {
    render(
      <DataListPage {...baseProps} onSearchChange={jest.fn()}>
        <div />
      </DataListPage>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Search and filter' }));
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
  });
});
