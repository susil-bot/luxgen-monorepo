import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { GroupMemberList } from './GroupMemberList';

const sampleMembers = [
  {
    id: 'm1',
    user: { firstName: 'Alice', lastName: 'Wong', email: 'alice@example.com' },
    role: 'Admin',
    joinedAt: '2024-01-01',
    permissions: ['admin', 'edit'],
  },
  {
    id: 'm2',
    user: { firstName: 'Bob', lastName: 'Lee', email: 'bob@example.com' },
    role: 'Learner',
    joinedAt: '2024-02-01',
    permissions: ['view'],
  },
];

describe('GroupMemberList', () => {
  const baseProps = {
    members: sampleMembers,
    onSelectMember: jest.fn(),
    onRemoveMember: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it('renders the group members heading with count', () => {
    render(<GroupMemberList {...baseProps} />);
    expect(screen.getByText(`Group Members (${sampleMembers.length})`)).toBeInTheDocument();
  });

  it('renders member initials in avatar', () => {
    render(<GroupMemberList {...baseProps} />);
    expect(screen.getByText('AW')).toBeInTheDocument();
    expect(screen.getByText('BL')).toBeInTheDocument();
  });

  it('renders member emails', () => {
    render(<GroupMemberList {...baseProps} />);
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    expect(screen.getByText('bob@example.com')).toBeInTheDocument();
  });

  it('renders member role badges', () => {
    render(<GroupMemberList {...baseProps} />);
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('Learner')).toBeInTheDocument();
  });

  it('calls onSelectMember when checkbox is clicked', () => {
    render(<GroupMemberList {...baseProps} />);
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
    expect(baseProps.onSelectMember).toHaveBeenCalledWith('m1');
  });

  it('shows search filter when showFilters=true (default)', () => {
    render(<GroupMemberList {...baseProps} />);
    expect(screen.getByPlaceholderText('Search members...')).toBeInTheDocument();
  });

  it('hides filters when showFilters=false', () => {
    render(<GroupMemberList {...baseProps} showFilters={false} />);
    expect(screen.queryByPlaceholderText('Search members...')).not.toBeInTheDocument();
  });

  it('renders empty state when no members provided', () => {
    render(<GroupMemberList {...baseProps} members={[]} />);
    expect(screen.getByText('Group Members (0)')).toBeInTheDocument();
  });
});
