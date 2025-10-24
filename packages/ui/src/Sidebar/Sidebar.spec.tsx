import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Sidebar } from './Sidebar';

// Mock next/router
const mockPush = jest.fn();
const mockBack = jest.fn();

jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
}));

// Mock window.location
Object.defineProperty(window, 'location', () => ({
  href: 'http://demo.localhost:3000',
}));

describe('Sidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockSections = [
    {
      id: 'navigation',
      title: 'Navigation',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          href: '/dashboard',
          icon: <svg className="h-5 w-5" />,
        },
        {
          id: 'groups',
          label: 'Groups',
          icon: <svg className="h-5 w-5" />,
          children: [
            {
              id: 'all-groups',
              label: 'All Groups',
              href: '/groups',
            },
            {
              id: 'create-group',
              label: 'Create Group',
              href: '/groups/create',
            },
          ],
        },
        {
          id: 'users',
          label: 'Users',
          href: '/users',
          icon: <svg className="h-5 w-5" />,
        },
      ],
    },
  ];

  it('renders with default props', () => {
    render(<Sidebar sections={mockSections} />);
    
    expect(screen.getByText('Navigation')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Groups')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
  });

  it('toggles submenu when clicking on item with children', async () => {
    render(<Sidebar sections={mockSections} />);
    
    const groupsItem = screen.getByText('Groups');
    expect(screen.queryByText('All Groups')).not.toBeInTheDocument();
    
    fireEvent.click(groupsItem);
    
    await waitFor(() => {
      expect(screen.getByText('All Groups')).toBeInTheDocument();
      expect(screen.getByText('Create Group')).toBeInTheDocument();
    });
  });

  it('navigates to page when clicking on item without children', () => {
    const mockOnItemClick = jest.fn();
    render(<Sidebar sections={mockSections} onItemClick={mockOnItemClick} />);
    
    const dashboardItem = screen.getByText('Dashboard');
    fireEvent.click(dashboardItem);
    
    expect(mockOnItemClick).toHaveBeenCalledWith({
      id: 'dashboard',
      label: 'Dashboard',
      href: '/dashboard',
      icon: expect.any(Object),
    });
  });

  it('does not navigate when clicking on item with children', () => {
    const mockOnItemClick = jest.fn();
    render(<Sidebar sections={mockSections} onItemClick={mockOnItemClick} />);
    
    const groupsItem = screen.getByText('Groups');
    fireEvent.click(groupsItem);
    
    // Should not call onItemClick for parent items with children
    expect(mockOnItemClick).not.toHaveBeenCalled();
  });

  it('navigates when clicking on submenu items', async () => {
    const mockOnItemClick = jest.fn();
    render(<Sidebar sections={mockSections} onItemClick={mockOnItemClick} />);
    
    // First click to open submenu
    const groupsItem = screen.getByText('Groups');
    fireEvent.click(groupsItem);
    
    await waitFor(() => {
      expect(screen.getByText('All Groups')).toBeInTheDocument();
    });
    
    // Click on submenu item
    const allGroupsItem = screen.getByText('All Groups');
    fireEvent.click(allGroupsItem);
    
    expect(mockOnItemClick).toHaveBeenCalledWith({
      id: 'all-groups',
      label: 'All Groups',
      href: '/groups',
    });
  });

  it('toggles submenu open and closed', async () => {
    render(<Sidebar sections={mockSections} />);
    
    const groupsItem = screen.getByText('Groups');
    
    // First click to open
    fireEvent.click(groupsItem);
    await waitFor(() => {
      expect(screen.getByText('All Groups')).toBeInTheDocument();
    });
    
    // Second click to close
    fireEvent.click(groupsItem);
    await waitFor(() => {
      expect(screen.queryByText('All Groups')).not.toBeInTheDocument();
    });
  });

  it('shows chevron icon for items with children', () => {
    render(<Sidebar sections={mockSections} />);
    
    const groupsItem = screen.getByText('Groups');
    const chevronIcon = groupsItem.parentElement?.querySelector('svg');
    
    expect(chevronIcon).toBeInTheDocument();
  });

  it('rotates chevron when submenu is expanded', async () => {
    render(<Sidebar sections={mockSections} />);
    
    const groupsItem = screen.getByText('Groups');
    const chevronIcon = groupsItem.parentElement?.querySelector('svg');
    
    expect(chevronIcon).not.toHaveClass('rotate-180');
    
    fireEvent.click(groupsItem);
    
    await waitFor(() => {
      expect(chevronIcon).toHaveClass('rotate-180');
    });
  });

  it('handles collapsed state', () => {
    render(<Sidebar sections={mockSections} defaultCollapsed={true} />);
    
    expect(screen.queryByText('Navigation')).not.toBeInTheDocument();
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
  });

  it('shows user section when user is provided', () => {
    const mockUser = {
      name: 'John Doe',
      email: 'john@example.com',
      role: 'Admin',
    };
    
    render(<Sidebar sections={mockSections} user={mockUser} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('handles user actions', () => {
    const mockOnUserAction = jest.fn();
    const mockUser = {
      name: 'John Doe',
      email: 'john@example.com',
      role: 'Admin',
    };
    
    render(
      <Sidebar 
        sections={mockSections} 
        user={mockUser} 
        onUserAction={mockOnUserAction}
      />
    );
    
    const userMenuButton = screen.getByRole('button', { name: /profile/i });
    fireEvent.click(userMenuButton);
    
    expect(mockOnUserAction).toHaveBeenCalledWith('profile');
  });

  it('applies custom styling', () => {
    render(
      <Sidebar 
        sections={mockSections} 
        className="custom-sidebar"
        variant="compact"
      />
    );
    
    const sidebar = screen.getByRole('complementary');
    expect(sidebar).toHaveClass('custom-sidebar');
  });

  it('handles disabled items', () => {
    const sectionsWithDisabled = [
      {
        id: 'navigation',
        title: 'Navigation',
        items: [
          {
            id: 'disabled-item',
            label: 'Disabled Item',
            href: '/disabled',
            disabled: true,
          },
        ],
      },
    ];
    
    render(<Sidebar sections={sectionsWithDisabled} />);
    
    const disabledItem = screen.getByText('Disabled Item');
    expect(disabledItem.closest('button')).toBeDisabled();
  });

  it('shows badges on items', () => {
    const sectionsWithBadge = [
      {
        id: 'navigation',
        title: 'Navigation',
        items: [
          {
            id: 'notifications',
            label: 'Notifications',
            href: '/notifications',
            badge: 5,
          },
        ],
      },
    ];
    
    render(<Sidebar sections={sectionsWithBadge} />);
    
    expect(screen.getByText('5')).toBeInTheDocument();
  });
});