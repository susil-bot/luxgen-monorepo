import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { UserManagement } from './UserManagement';
import type { User } from './types';

const sampleUsers: User[] = [
  {
    id: 'u1',
    name: 'Jane Smith',
    username: 'janesmith',
    email: 'jane@example.com',
    avatar: '',
    role: 'Admin',
    plan: 'Pro',
    status: 'active',
    lastLogin: '2024-01-01',
  },
  {
    id: 'u2',
    name: 'Bob Lee',
    username: 'boblee',
    email: 'bob@example.com',
    avatar: '',
    role: 'User',
    plan: 'Free',
    status: 'pending',
    lastLogin: '2024-01-02',
  },
];

describe('UserManagement', () => {
  const baseProps = {
    users: sampleUsers,
    onSearchChange: jest.fn(),
    onAddUser: jest.fn(),
    onUserAction: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it('renders user names in the table', () => {
    render(<UserManagement {...baseProps} />);
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Lee')).toBeInTheDocument();
  });

  it('renders user emails', () => {
    render(<UserManagement {...baseProps} />);
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByText('bob@example.com')).toBeInTheDocument();
  });

  it('shows the Add user button when onAddUser is provided', () => {
    render(<UserManagement {...baseProps} />);
    expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument();
  });

  it('calls onAddUser when add user button is clicked', () => {
    render(<UserManagement {...baseProps} />);
    fireEvent.click(screen.getByRole('button', { name: /add user/i }));
    expect(baseProps.onAddUser).toHaveBeenCalledTimes(1);
  });

  it('calls onSearchChange when search input changes', () => {
    render(<UserManagement {...baseProps} />);
    fireEvent.click(screen.getByRole('button', { name: 'Search and filter' }));
    const search = screen.getByRole('searchbox');
    fireEvent.change(search, { target: { value: 'jane' } });
    expect(baseProps.onSearchChange).toHaveBeenCalledWith('jane');
  });

  it('shows empty state when users list is empty', () => {
    render(<UserManagement {...baseProps} users={[]} />);
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
  });

  it('renders tab navigation', () => {
    render(<UserManagement {...baseProps} />);
    expect(screen.getByRole('tab', { name: 'All' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Active' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Pending' })).toBeInTheDocument();
  });
});
