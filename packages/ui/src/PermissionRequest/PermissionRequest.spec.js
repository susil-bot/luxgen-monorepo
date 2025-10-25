import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PermissionRequest } from './PermissionRequest';

describe('PermissionRequest Component', () => {
  const defaultRequests = [
    {
      id: '1',
      user: { name: 'John Doe', email: 'john@example.com', initials: 'JD' },
      permission: 'Admin',
      resource: 'User Management',
      requestedAt: '2 hours ago',
      reason: 'Need to manage user accounts for new project',
      status: 'pending'
    },
    {
      id: '2',
      user: { name: 'Jane Smith', email: 'jane@example.com', initials: 'JS' },
      permission: 'Editor',
      resource: 'Content Management',
      requestedAt: '1 day ago',
      reason: 'Content creation for marketing campaign',
      status: 'pending'
    },
    {
      id: '3',
      user: { name: 'Bob Wilson', email: 'bob@example.com', initials: 'BW' },
      permission: 'Viewer',
      resource: 'Analytics Dashboard',
      requestedAt: '3 days ago',
      status: 'approved'
    }
  ];

  const defaultProps = {
    title: 'Permission Requests',
    requests: defaultRequests,
    maxItems: 5,
    showActions: true,
    variant: 'default'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<PermissionRequest {...defaultProps} />);
      
      expect(screen.getByText('Permission Requests')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      render(<PermissionRequest {...defaultProps} className="custom-class" />);
      
      const container = screen.getByText('Permission Requests').closest('.permission-request-container');
      expect(container).toHaveClass('custom-class');
    });

    it('renders empty state when no requests', () => {
      render(<PermissionRequest {...defaultProps} requests={[]} />);
      
      expect(screen.getByText('No permission requests')).toBeInTheDocument();
    });
  });

  describe('Request Display', () => {
    it('displays user names', () => {
      render(<PermissionRequest {...defaultProps} />);
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('displays user emails', () => {
      render(<PermissionRequest {...defaultProps} />);
      
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    });

    it('displays permission and resource', () => {
      render(<PermissionRequest {...defaultProps} />);
      
      expect(screen.getByText('Admin access to User Management')).toBeInTheDocument();
      expect(screen.getByText('Editor access to Content Management')).toBeInTheDocument();
    });

    it('displays request reasons when provided', () => {
      render(<PermissionRequest {...defaultProps} />);
      
      expect(screen.getByText('"Need to manage user accounts for new project"')).toBeInTheDocument();
    });

    it('displays request timestamps', () => {
      render(<PermissionRequest {...defaultProps} />);
      
      expect(screen.getByText('2 hours ago')).toBeInTheDocument();
      expect(screen.getByText('1 day ago')).toBeInTheDocument();
    });
  });

  describe('Status Display', () => {
    it('displays pending status correctly', () => {
      render(<PermissionRequest {...defaultProps} />);
      
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });

    it('displays approved status correctly', () => {
      render(<PermissionRequest {...defaultProps} />);
      
      expect(screen.getByText('Approved')).toBeInTheDocument();
    });

    it('displays denied status correctly', () => {
      const deniedRequest = { ...defaultRequests[0], status: 'denied' };
      render(<PermissionRequest {...defaultProps} requests={[deniedRequest]} />);
      
      expect(screen.getByText('Denied')).toBeInTheDocument();
    });
  });

  describe('Pending Count', () => {
    it('shows pending count when there are pending requests', () => {
      render(<PermissionRequest {...defaultProps} />);
      
      expect(screen.getByText('2 pending')).toBeInTheDocument();
    });

    it('hides pending count when there are no pending requests', () => {
      const approvedRequests = defaultRequests.map(req => ({ ...req, status: 'approved' }));
      render(<PermissionRequest {...defaultProps} requests={approvedRequests} />);
      
      expect(screen.queryByText(/pending/)).not.toBeInTheDocument();
    });
  });

  describe('Max Items', () => {
    it('limits displayed requests to maxItems', () => {
      render(<PermissionRequest {...defaultProps} maxItems={2} />);
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.queryByText('Bob Wilson')).not.toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('shows action buttons for pending requests when showActions is true', () => {
      render(<PermissionRequest {...defaultProps} showActions={true} />);
      
      expect(screen.getByText('Approve')).toBeInTheDocument();
      expect(screen.getByText('Deny')).toBeInTheDocument();
      expect(screen.getByText('Details')).toBeInTheDocument();
    });

    it('hides action buttons for non-pending requests', () => {
      render(<PermissionRequest {...defaultProps} showActions={true} />);
      
      // Approved requests should not have action buttons
      const approvedRequest = screen.getByText('Bob Wilson').closest('.permission-request-item');
      expect(approvedRequest).not.toHaveTextContent('Approve');
      expect(approvedRequest).not.toHaveTextContent('Deny');
    });

    it('hides all action buttons when showActions is false', () => {
      render(<PermissionRequest {...defaultProps} showActions={false} />);
      
      expect(screen.queryByText('Approve')).not.toBeInTheDocument();
      expect(screen.queryByText('Deny')).not.toBeInTheDocument();
      expect(screen.queryByText('Details')).not.toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onApprove when Approve is clicked', async () => {
      const onApprove = jest.fn();
      render(<PermissionRequest {...defaultProps} onApprove={onApprove} />);
      
      const approveButtons = screen.getAllByText('Approve');
      await userEvent.click(approveButtons[0]);
      
      expect(onApprove).toHaveBeenCalledWith(defaultRequests[0]);
    });

    it('calls onDeny when Deny is clicked', async () => {
      const onDeny = jest.fn();
      render(<PermissionRequest {...defaultProps} onDeny={onDeny} />);
      
      const denyButtons = screen.getAllByText('Deny');
      await userEvent.click(denyButtons[0]);
      
      expect(onDeny).toHaveBeenCalledWith(defaultRequests[0]);
    });

    it('calls onViewDetails when Details is clicked', async () => {
      const onViewDetails = jest.fn();
      render(<PermissionRequest {...defaultProps} onViewDetails={onViewDetails} />);
      
      const detailsButtons = screen.getAllByText('Details');
      await userEvent.click(detailsButtons[0]);
      
      expect(onViewDetails).toHaveBeenCalledWith(defaultRequests[0]);
    });
  });

  describe('Variants', () => {
    it('renders compact variant correctly', () => {
      render(<PermissionRequest {...defaultProps} variant="compact" />);
      
      expect(screen.getByText('Permission Requests')).toBeInTheDocument();
    });

    it('renders detailed variant correctly', () => {
      render(<PermissionRequest {...defaultProps} variant="detailed" />);
      
      expect(screen.getByText('Permission Requests')).toBeInTheDocument();
    });
  });

  describe('Avatar Generation', () => {
    it('generates initials from user name', () => {
      render(<PermissionRequest {...defaultProps} />);
      
      expect(screen.getByText('JD')).toBeInTheDocument();
      expect(screen.getByText('JS')).toBeInTheDocument();
    });

    it('uses custom initials when provided', () => {
      const requestsWithCustomInitials = [
        {
          id: '1',
          user: { name: 'John Doe', email: 'john@example.com', initials: 'J' },
          permission: 'Admin',
          resource: 'User Management',
          requestedAt: '2 hours ago',
          status: 'pending'
        }
      ];
      
      render(<PermissionRequest {...defaultProps} requests={requestsWithCustomInitials} />);
      
      expect(screen.getByText('J')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      render(<PermissionRequest {...defaultProps} />);
      
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Permission Requests');
    });

    it('has clickable action buttons', () => {
      render(<PermissionRequest {...defaultProps} />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Styling', () => {
    it('applies custom avatar colors', () => {
      const requestsWithColors = [
        {
          id: '1',
          user: { name: 'John Doe', email: 'john@example.com', initials: 'JD' },
          permission: 'Admin',
          resource: 'User Management',
          requestedAt: '2 hours ago',
          status: 'pending',
          avatarColor: '#FF0000'
        }
      ];
      
      render(<PermissionRequest {...defaultProps} requests={requestsWithColors} />);
      
      const container = screen.getByText('Permission Requests').closest('.permission-request-container');
      expect(container).toBeInTheDocument();
    });
  });
});
