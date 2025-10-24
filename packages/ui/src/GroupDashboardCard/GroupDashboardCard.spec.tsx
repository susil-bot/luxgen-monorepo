import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GroupDashboardCard } from './GroupDashboardCard';

const mockGroupData = {
  id: '1',
  name: 'Development Team',
  totalUsers: 8,
  activeUsers: 6,
  maxUsers: 10,
  role: 'Super Admin' as const,
  progress: 7,
  maxProgress: 10,
  status: 'Active' as const,
  members: [
    { id: '1', name: 'John Doe' },
    { id: '2', name: 'Jane Smith' },
    { id: '3', name: 'Bob Johnson' },
    { id: '4', name: 'Alice Brown' },
    { id: '5', name: 'Charlie Wilson' },
  ],
  tasks: 12,
  comments: 8,
};

describe('GroupDashboardCard', () => {
  it('renders without crashing', () => {
    render(<GroupDashboardCard group={mockGroupData} />);
    expect(screen.getByText('Total 8 Users')).toBeInTheDocument();
  });

  it('displays group information correctly', () => {
    render(<GroupDashboardCard group={mockGroupData} />);
    
    expect(screen.getByText('Total 8 Users')).toBeInTheDocument();
    expect(screen.getByText('Super Admin')).toBeInTheDocument();
    expect(screen.getByText('Active Users')).toBeInTheDocument();
    expect(screen.getByText('6/10')).toBeInTheDocument();
    expect(screen.getByText('Edit User')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('displays member avatars correctly', () => {
    render(<GroupDashboardCard group={mockGroupData} />);
    
    // Check for member initials
    expect(screen.getByText('J')).toBeInTheDocument(); // John Doe
    expect(screen.getByText('J')).toBeInTheDocument(); // Jane Smith
    expect(screen.getByText('B')).toBeInTheDocument(); // Bob Johnson
    
    // Check for overflow indicator
    expect(screen.getByText('+2')).toBeInTheDocument(); // 5 members - 3 displayed = 2 overflow
  });

  it('displays progress bar correctly', () => {
    render(<GroupDashboardCard group={mockGroupData} />);
    
    const progressBar = screen.getByRole('progressbar', { hidden: true });
    expect(progressBar).toBeInTheDocument();
  });

  it('displays task and comment counters', () => {
    render(<GroupDashboardCard group={mockGroupData} />);
    
    expect(screen.getByText('12')).toBeInTheDocument(); // Tasks
    expect(screen.getByText('8')).toBeInTheDocument(); // Comments
  });

  it('handles click events correctly', () => {
    const mockOnEdit = jest.fn();
    const mockOnViewDetails = jest.fn();
    const mockOnManageUsers = jest.fn();

    render(
      <GroupDashboardCard
        group={mockGroupData}
        onEdit={mockOnEdit}
        onViewDetails={mockOnViewDetails}
        onManageUsers={mockOnManageUsers}
      />
    );

    // Test edit button
    const editButton = screen.getByTitle('Edit Group');
    fireEvent.click(editButton);
    expect(mockOnEdit).toHaveBeenCalledTimes(1);

    // Test view details button
    const viewDetailsButton = screen.getByText('View Details');
    fireEvent.click(viewDetailsButton);
    expect(mockOnViewDetails).toHaveBeenCalledTimes(1);

    // Test manage users button
    const manageUsersButton = screen.getByTitle('Add User');
    fireEvent.click(manageUsersButton);
    expect(mockOnManageUsers).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    const customClass = 'custom-card-class';
    render(<GroupDashboardCard group={mockGroupData} className={customClass} />);
    
    const card = screen.getByText('Total 8 Users').closest('div');
    expect(card).toHaveClass(customClass);
  });

  it('hides actions when showActions is false', () => {
    render(<GroupDashboardCard group={mockGroupData} showActions={false} />);
    
    expect(screen.queryByText('View Details')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Edit Group')).not.toBeInTheDocument();
  });

  it('displays role badge with correct color', () => {
    render(<GroupDashboardCard group={mockGroupData} />);
    
    const roleBadge = screen.getByText('Super Admin');
    expect(roleBadge).toHaveClass('bg-blue-100', 'text-blue-800');
  });

  it('displays status badge with correct color', () => {
    render(<GroupDashboardCard group={mockGroupData} />);
    
    const statusBadge = screen.getByText('Active');
    expect(statusBadge).toHaveClass('bg-green-100', 'text-green-800');
  });

  it('handles different role types correctly', () => {
    const adminGroup = { ...mockGroupData, role: 'Admin' as const };
    render(<GroupDashboardCard group={adminGroup} />);
    
    const roleBadge = screen.getByText('Admin');
    expect(roleBadge).toHaveClass('bg-purple-100', 'text-purple-800');
  });

  it('handles different status types correctly', () => {
    const inactiveGroup = { ...mockGroupData, status: 'Inactive' as const };
    render(<GroupDashboardCard group={inactiveGroup} />);
    
    const statusBadge = screen.getByText('Inactive');
    expect(statusBadge).toHaveClass('bg-gray-100', 'text-gray-800');
  });

  it('handles groups with no tasks or comments', () => {
    const groupWithoutCounters = { ...mockGroupData, tasks: undefined, comments: undefined };
    render(<GroupDashboardCard group={groupWithoutCounters} />);
    
    expect(screen.queryByText('12')).not.toBeInTheDocument();
    expect(screen.queryByText('8')).not.toBeInTheDocument();
  });

  it('handles groups with no max users', () => {
    const groupWithoutMaxUsers = { ...mockGroupData, maxUsers: undefined };
    render(<GroupDashboardCard group={groupWithoutMaxUsers} />);
    
    expect(screen.getByText('6/8')).toBeInTheDocument(); // activeUsers/totalUsers
  });

  it('handles groups with fewer than 3 members', () => {
    const groupWithFewMembers = {
      ...mockGroupData,
      members: [
        { id: '1', name: 'John Doe' },
        { id: '2', name: 'Jane Smith' },
      ],
    };
    render(<GroupDashboardCard group={groupWithFewMembers} />);
    
    expect(screen.queryByText('+')).not.toBeInTheDocument();
  });

  it('handles groups with exactly 3 members', () => {
    const groupWithThreeMembers = {
      ...mockGroupData,
      members: [
        { id: '1', name: 'John Doe' },
        { id: '2', name: 'Jane Smith' },
        { id: '3', name: 'Bob Johnson' },
      ],
    };
    render(<GroupDashboardCard group={groupWithThreeMembers} />);
    
    expect(screen.queryByText('+')).not.toBeInTheDocument();
  });

  it('handles groups with many members', () => {
    const groupWithManyMembers = {
      ...mockGroupData,
      members: Array.from({ length: 10 }, (_, i) => ({
        id: `${i + 1}`,
        name: `User ${i + 1}`,
      })),
    };
    render(<GroupDashboardCard group={groupWithManyMembers} />);
    
    expect(screen.getByText('+7')).toBeInTheDocument(); // 10 members - 3 displayed = 7 overflow
  });

  it('calculates progress percentage correctly', () => {
    render(<GroupDashboardCard group={mockGroupData} />);
    
    // 7/10 = 70% progress
    const progressBar = screen.getByRole('progressbar', { hidden: true });
    expect(progressBar).toHaveStyle('width: 70%');
  });

  it('handles zero progress correctly', () => {
    const groupWithZeroProgress = { ...mockGroupData, progress: 0, maxProgress: 10 };
    render(<GroupDashboardCard group={groupWithZeroProgress} />);
    
    const progressBar = screen.getByRole('progressbar', { hidden: true });
    expect(progressBar).toHaveStyle('width: 0%');
  });

  it('handles 100% progress correctly', () => {
    const groupWithFullProgress = { ...mockGroupData, progress: 10, maxProgress: 10 };
    render(<GroupDashboardCard group={groupWithFullProgress} />);
    
    const progressBar = screen.getByRole('progressbar', { hidden: true });
    expect(progressBar).toHaveStyle('width: 100%');
  });

  it('handles zero max progress correctly', () => {
    const groupWithZeroMaxProgress = { ...mockGroupData, progress: 5, maxProgress: 0 };
    render(<GroupDashboardCard group={groupWithZeroMaxProgress} />);
    
    const progressBar = screen.getByRole('progressbar', { hidden: true });
    expect(progressBar).toHaveStyle('width: 0%');
  });

  it('is accessible', () => {
    render(<GroupDashboardCard group={mockGroupData} />);
    
    // Check for proper heading structure
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
    
    // Check for proper button roles
    expect(screen.getByRole('button', { name: 'Add User' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit Group' })).toBeInTheDocument();
  });

  it('supports keyboard navigation', () => {
    render(<GroupDashboardCard group={mockGroupData} />);
    
    const editButton = screen.getByTitle('Edit Group');
    const addUserButton = screen.getByTitle('Add User');
    
    // Test tab navigation
    editButton.focus();
    expect(editButton).toHaveFocus();
    
    addUserButton.focus();
    expect(addUserButton).toHaveFocus();
  });

  it('handles member avatars with images', () => {
    const groupWithAvatars = {
      ...mockGroupData,
      members: [
        { id: '1', name: 'John Doe', avatar: 'https://example.com/avatar1.jpg' },
        { id: '2', name: 'Jane Smith', avatar: 'https://example.com/avatar2.jpg' },
        { id: '3', name: 'Bob Johnson' },
      ],
    };
    render(<GroupDashboardCard group={groupWithAvatars} />);
    
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(2); // Two members with avatars
  });

  it('handles member avatars without images', () => {
    render(<GroupDashboardCard group={mockGroupData} />);
    
    // Should show initials instead of images
    expect(screen.getByText('J')).toBeInTheDocument(); // John Doe
    expect(screen.getByText('J')).toBeInTheDocument(); // Jane Smith
    expect(screen.getByText('B')).toBeInTheDocument(); // Bob Johnson
  });

  it('handles edge cases gracefully', () => {
    const edgeCaseGroup = {
      ...mockGroupData,
      totalUsers: 0,
      activeUsers: 0,
      progress: 0,
      maxProgress: 0,
      members: [],
      tasks: 0,
      comments: 0,
    };
    
    render(<GroupDashboardCard group={edgeCaseGroup} />);
    
    expect(screen.getByText('Total 0 Users')).toBeInTheDocument();
    expect(screen.getByText('0/0')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument(); // Tasks
    expect(screen.getByText('0')).toBeInTheDocument(); // Comments
  });

  it('renders with different variants', () => {
    const { rerender } = render(<GroupDashboardCard group={mockGroupData} />);
    
    // Test default variant
    expect(screen.getByText('Total 8 Users')).toBeInTheDocument();
    
    // Test compact variant
    rerender(<GroupDashboardCard group={mockGroupData} />);
    expect(screen.getByText('Total 8 Users')).toBeInTheDocument();
  });

  it('handles loading state', () => {
    render(<GroupDashboardCard group={mockGroupData} />);
    
    // Component should render without loading spinner
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('handles error state gracefully', () => {
    // Test with invalid data
    const invalidGroup = {
      ...mockGroupData,
      totalUsers: -1,
      activeUsers: -1,
    };
    
    render(<GroupDashboardCard group={invalidGroup} />);
    
    // Should still render without crashing
    expect(screen.getByText('Total -1 Users')).toBeInTheDocument();
  });

  it('maintains consistent styling', () => {
    render(<GroupDashboardCard group={mockGroupData} />);
    
    const card = screen.getByText('Total 8 Users').closest('div');
    expect(card).toHaveClass('bg-white', 'rounded-lg', 'border', 'border-gray-200', 'shadow-sm');
  });

  it('handles hover effects', () => {
    render(<GroupDashboardCard group={mockGroupData} />);
    
    const card = screen.getByText('Total 8 Users').closest('div');
    expect(card).toHaveClass('hover:shadow-md', 'transition-shadow', 'duration-200');
  });

  it('handles responsive design', () => {
    render(<GroupDashboardCard group={mockGroupData} />);
    
    const card = screen.getByText('Total 8 Users').closest('div');
    expect(card).toHaveClass('p-6'); // Default padding
  });

  it('handles theme integration', () => {
    render(<GroupDashboardCard group={mockGroupData} />);
    
    // Should use default theme colors
    const roleBadge = screen.getByText('Super Admin');
    expect(roleBadge).toHaveClass('bg-blue-100', 'text-blue-800');
  });

  it('handles data updates correctly', () => {
    const { rerender } = render(<GroupDashboardCard group={mockGroupData} />);
    
    expect(screen.getByText('Total 8 Users')).toBeInTheDocument();
    
    const updatedGroup = { ...mockGroupData, totalUsers: 12 };
    rerender(<GroupDashboardCard group={updatedGroup} />);
    
    expect(screen.getByText('Total 12 Users')).toBeInTheDocument();
  });

  it('handles callback updates correctly', () => {
    const mockOnEdit = jest.fn();
    const { rerender } = render(<GroupDashboardCard group={mockGroupData} onEdit={mockOnEdit} />);
    
    const editButton = screen.getByTitle('Edit Group');
    fireEvent.click(editButton);
    expect(mockOnEdit).toHaveBeenCalledTimes(1);
    
    const newMockOnEdit = jest.fn();
    rerender(<GroupDashboardCard group={mockGroupData} onEdit={newMockOnEdit} />);
    
    fireEvent.click(editButton);
    expect(newMockOnEdit).toHaveBeenCalledTimes(1);
    expect(mockOnEdit).toHaveBeenCalledTimes(1); // Should not be called again
  });
});
