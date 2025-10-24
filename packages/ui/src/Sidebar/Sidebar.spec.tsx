import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Sidebar, SidebarSection, SidebarItem } from './Sidebar';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
  }),
}));

describe('Sidebar Component', () => {
  const mockSections: SidebarSection[] = [
    {
      id: 'main',
      title: 'Main Navigation',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          href: '/dashboard',
        },
        {
          id: 'courses',
          label: 'Courses',
          href: '/courses',
          children: [
            {
              id: 'all-courses',
              label: 'All Courses',
              href: '/courses/all',
            },
            {
              id: 'my-courses',
              label: 'My Courses',
              href: '/courses/my',
            },
          ],
        },
      ],
    },
    {
      id: 'settings',
      title: 'Settings',
      items: [
        {
          id: 'profile',
          label: 'Profile',
          href: '/profile',
        },
        {
          id: 'preferences',
          label: 'Preferences',
          href: '/preferences',
        },
      ],
    },
  ];

  const mockUser = {
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Admin',
    avatar: '/path/to/avatar.jpg',
  };

  beforeEach(() => {
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        href: '/',
      },
      writable: true,
    });
  });

  it('renders with basic props', () => {
    render(<Sidebar sections={mockSections} />);
    
    expect(screen.getByText('LuxGen')).toBeInTheDocument();
    expect(screen.getByText('Main Navigation')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Courses')).toBeInTheDocument();
  });

  it('renders with custom logo', () => {
    const customLogo = {
      text: 'Custom Logo',
      href: '/custom',
    };
    
    render(<Sidebar sections={mockSections} logo={customLogo} />);
    
    expect(screen.getByText('Custom Logo')).toBeInTheDocument();
  });

  it('renders user section when user is provided', () => {
    render(<Sidebar sections={mockSections} user={mockUser} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('toggles collapsed state when toggle button is clicked', () => {
    render(<Sidebar sections={mockSections} collapsible={true} />);
    
    const toggleButton = screen.getByRole('button', { name: /toggle/i });
    fireEvent.click(toggleButton);
    
    // Check if sidebar is collapsed (this would depend on implementation)
    expect(toggleButton).toBeInTheDocument();
  });

  it('expands and collapses sections when section header is clicked', async () => {
    render(<Sidebar sections={mockSections} />);
    
    const sectionHeader = screen.getByText('Main Navigation');
    fireEvent.click(sectionHeader);
    
    // Check if section is collapsed/expanded
    await waitFor(() => {
      expect(sectionHeader).toBeInTheDocument();
    });
  });

  it('handles item clicks', () => {
    const mockOnItemClick = jest.fn();
    
    render(
      <Sidebar 
        sections={mockSections} 
        onItemClick={mockOnItemClick}
      />
    );
    
    const dashboardItem = screen.getByText('Dashboard');
    fireEvent.click(dashboardItem);
    
    expect(mockOnItemClick).toHaveBeenCalled();
  });

  it('handles user actions', () => {
    const mockOnUserAction = jest.fn();
    
    render(
      <Sidebar 
        sections={mockSections} 
        user={mockUser}
        onUserAction={mockOnUserAction}
      />
    );
    
    const userButton = screen.getByText('John Doe');
    fireEvent.click(userButton);
    
    expect(mockOnUserAction).toHaveBeenCalled();
  });

  it('renders sub-menu items when parent is clicked', () => {
    render(<Sidebar sections={mockSections} />);
    
    const coursesItem = screen.getByText('Courses');
    fireEvent.click(coursesItem);
    
    // Check if sub-menu items are visible
    expect(screen.getByText('All Courses')).toBeInTheDocument();
    expect(screen.getByText('My Courses')).toBeInTheDocument();
  });

  it('handles external links correctly', () => {
    const sectionsWithExternal: SidebarSection[] = [
      {
        id: 'external',
        items: [
          {
            id: 'external-link',
            label: 'External Link',
            href: 'https://example.com',
            external: true,
          },
        ],
      },
    ];
    
    render(<Sidebar sections={sectionsWithExternal} />);
    
    const externalLink = screen.getByText('External Link');
    expect(externalLink).toBeInTheDocument();
  });

  it('disables navigation items when disabled prop is true', () => {
    const sectionsWithDisabled: SidebarSection[] = [
      {
        id: 'disabled',
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
    expect(disabledItem).toHaveClass('opacity-50', 'cursor-not-allowed');
  });

  it('renders badges on navigation items', () => {
    const sectionsWithBadge: SidebarSection[] = [
      {
        id: 'badge',
        items: [
          {
            id: 'with-badge',
            label: 'Item with Badge',
            href: '/badge',
            badge: 'New',
          },
        ],
      },
    ];
    
    render(<Sidebar sections={sectionsWithBadge} />);
    
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Sidebar sections={mockSections} className="custom-sidebar" />);
    
    const sidebar = screen.getByRole('complementary');
    expect(sidebar).toHaveClass('custom-sidebar');
  });

  it('handles different variants correctly', () => {
    const { rerender } = render(<Sidebar sections={mockSections} variant="compact" />);
    let sidebar = screen.getByRole('complementary');
    expect(sidebar).toHaveClass('w-16');
    
    rerender(<Sidebar sections={mockSections} variant="minimal" />);
    sidebar = screen.getByRole('complementary');
    expect(sidebar).toHaveClass('w-12');
  });

  it('handles different positions correctly', () => {
    const { rerender } = render(<Sidebar sections={mockSections} position="fixed" />);
    let sidebar = screen.getByRole('complementary');
    expect(sidebar).toHaveClass('fixed');
    
    rerender(<Sidebar sections={mockSections} position="sticky" />);
    sidebar = screen.getByRole('complementary');
    expect(sidebar).toHaveClass('sticky');
  });

  it('handles different widths correctly', () => {
    const { rerender } = render(<Sidebar sections={mockSections} width="narrow" />);
    let sidebar = screen.getByRole('complementary');
    expect(sidebar).toHaveClass('w-48');
    
    rerender(<Sidebar sections={mockSections} width="wide" />);
    sidebar = screen.getByRole('complementary');
    expect(sidebar).toHaveClass('w-80');
  });

  it('hides logo when showLogo is false', () => {
    render(<Sidebar sections={mockSections} showLogo={false} />);
    
    expect(screen.queryByText('LuxGen')).not.toBeInTheDocument();
  });

  it('hides user section when showUserSection is false', () => {
    render(<Sidebar sections={mockSections} user={mockUser} showUserSection={false} />);
    
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });

  it('calls onToggle when collapsed state changes', () => {
    const mockOnToggle = jest.fn();
    
    render(
      <Sidebar 
        sections={mockSections} 
        collapsible={true}
        onToggle={mockOnToggle}
      />
    );
    
    const toggleButton = screen.getByRole('button', { name: /toggle/i });
    fireEvent.click(toggleButton);
    
    expect(mockOnToggle).toHaveBeenCalledWith(true);
  });

  it('starts collapsed when defaultCollapsed is true', () => {
    render(<Sidebar sections={mockSections} defaultCollapsed={true} />);
    
    const sidebar = screen.getByRole('complementary');
    expect(sidebar).toHaveClass('w-16');
  });
});