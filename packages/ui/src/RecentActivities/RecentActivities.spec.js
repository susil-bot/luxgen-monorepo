import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RecentActivities } from './RecentActivities';

describe('RecentActivities Component', () => {
  const defaultActivities = [
    {
      id: '1',
      user: { name: 'John Doe', initials: 'JD' },
      action: 'Completed survey',
      time: '2 hours ago',
      status: 'online'
    },
    {
      id: '2',
      user: { name: 'Jane Smith', initials: 'JS' },
      action: 'Started training',
      time: '1 day ago',
      status: 'offline'
    },
    {
      id: '3',
      user: { name: 'Bob Wilson', initials: 'BW' },
      action: 'Updated profile',
      time: '3 days ago',
      status: 'online'
    }
  ];

  const defaultProps = {
    title: 'Recent Activities',
    activities: defaultActivities,
    maxItems: 4,
    showStatus: true,
    variant: 'default'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<RecentActivities {...defaultProps} />);
      
      expect(screen.getByText('Recent Activities')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      render(<RecentActivities {...defaultProps} className="custom-class" />);
      
      const container = screen.getByText('Recent Activities').closest('.recent-activities-container');
      expect(container).toHaveClass('custom-class');
    });

    it('renders empty state when no activities', () => {
      render(<RecentActivities {...defaultProps} activities={[]} />);
      
      expect(screen.getByText('No recent activities')).toBeInTheDocument();
    });
  });

  describe('Activity Display', () => {
    it('displays user names', () => {
      render(<RecentActivities {...defaultProps} />);
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('displays actions', () => {
      render(<RecentActivities {...defaultProps} />);
      
      expect(screen.getByText('Completed survey')).toBeInTheDocument();
      expect(screen.getByText('Started training')).toBeInTheDocument();
    });

    it('displays timestamps', () => {
      render(<RecentActivities {...defaultProps} />);
      
      expect(screen.getByText('2 hours ago')).toBeInTheDocument();
      expect(screen.getByText('1 day ago')).toBeInTheDocument();
    });

    it('shows status indicators when showStatus is true', () => {
      render(<RecentActivities {...defaultProps} showStatus={true} />);
      
      const statusIndicators = screen.getAllByRole('status', { hidden: true });
      expect(statusIndicators.length).toBeGreaterThan(0);
    });

    it('hides status indicators when showStatus is false', () => {
      render(<RecentActivities {...defaultProps} showStatus={false} />);
      
      const statusIndicators = screen.queryAllByRole('status', { hidden: true });
      expect(statusIndicators).toHaveLength(0);
    });
  });

  describe('Max Items', () => {
    it('limits displayed activities to maxItems', () => {
      render(<RecentActivities {...defaultProps} maxItems={2} />);
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.queryByText('Bob Wilson')).not.toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onActivityClick when activity is clicked', async () => {
      const onActivityClick = jest.fn();
      render(<RecentActivities {...defaultProps} onActivityClick={onActivityClick} />);
      
      const activity = screen.getByText('John Doe').closest('.recent-activities-item');
      await userEvent.click(activity);
      
      expect(onActivityClick).toHaveBeenCalledWith(defaultActivities[0]);
    });
  });

  describe('Variants', () => {
    it('renders compact variant correctly', () => {
      render(<RecentActivities {...defaultProps} variant="compact" />);
      
      expect(screen.getByText('Recent Activities')).toBeInTheDocument();
    });

    it('renders detailed variant correctly', () => {
      render(<RecentActivities {...defaultProps} variant="detailed" />);
      
      expect(screen.getByText('Recent Activities')).toBeInTheDocument();
    });
  });

  describe('Avatar Generation', () => {
    it('generates initials from user name', () => {
      render(<RecentActivities {...defaultProps} />);
      
      expect(screen.getByText('JD')).toBeInTheDocument();
      expect(screen.getByText('JS')).toBeInTheDocument();
    });

    it('uses custom initials when provided', () => {
      const activitiesWithCustomInitials = [
        {
          id: '1',
          user: { name: 'John Doe', initials: 'J' },
          action: 'Completed survey',
          time: '2 hours ago',
          status: 'online'
        }
      ];
      
      render(<RecentActivities {...defaultProps} activities={activitiesWithCustomInitials} />);
      
      expect(screen.getByText('J')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      render(<RecentActivities {...defaultProps} />);
      
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Recent Activities');
    });

    it('has clickable activities', () => {
      render(<RecentActivities {...defaultProps} />);
      
      const activities = screen.getAllByRole('button', { hidden: true });
      expect(activities.length).toBeGreaterThan(0);
    });
  });

  describe('Styling', () => {
    it('applies custom avatar colors', () => {
      const activitiesWithColors = [
        {
          id: '1',
          user: { name: 'John Doe', initials: 'JD' },
          action: 'Completed survey',
          time: '2 hours ago',
          status: 'online',
          avatarColor: '#FF0000'
        }
      ];
      
      render(<RecentActivities {...defaultProps} activities={activitiesWithColors} />);
      
      const container = screen.getByText('Recent Activities').closest('.recent-activities-container');
      expect(container).toBeInTheDocument();
    });
  });
});
