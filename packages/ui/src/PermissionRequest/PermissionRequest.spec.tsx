import React from 'react';
import { render, screen } from '@testing-library/react';
import { PermissionRequest } from './PermissionRequest';

const sampleRequests = [
  {
    id: 'r1',
    user: { name: 'Alice Brown', email: 'alice@example.com', initials: 'AB' },
    permission: 'Admin Access',
    resource: 'User Management',
    requestedAt: '2024-01-01T00:00:00Z',
    status: 'pending' as const,
    avatarColor: '#3B82F6',
  },
  {
    id: 'r2',
    user: { name: 'Bob Smith', email: 'bob@example.com', initials: 'BS' },
    permission: 'Read Access',
    resource: 'Reports',
    requestedAt: '2024-01-02T00:00:00Z',
    status: 'approved' as const,
    avatarColor: '#10B981',
  },
];

describe('PermissionRequest', () => {
  const baseProps = {
    requests: sampleRequests,
    onApprove: jest.fn(),
    onDeny: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it('renders the default title', () => {
    render(<PermissionRequest {...baseProps} />);
    expect(screen.getByText('Permission Requests')).toBeInTheDocument();
  });

  it('renders user names', () => {
    render(<PermissionRequest {...baseProps} />);
    expect(screen.getByText('Alice Brown')).toBeInTheDocument();
    expect(screen.getByText('Bob Smith')).toBeInTheDocument();
  });

  it('renders without crashing with empty requests', () => {
    render(<PermissionRequest requests={[]} />);
    expect(screen.getByText('Permission Requests')).toBeInTheDocument();
  });

  it('renders without crashing with minimal props', () => {
    const { container } = render(<PermissionRequest requests={sampleRequests} />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
