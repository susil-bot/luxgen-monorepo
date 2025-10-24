import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NavBar, NavItem, UserMenu } from './NavBar';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
  }),
}));

describe('NavBar Component', () => {
  const mockItems: NavItem[] = [
    {
      id: 'home',
      label: 'Home',
      href: '/',
    },
    {
      id: 'about',
      label: 'About',
      href: '/about',
    },
    {
      id: 'services',
      label: 'Services',
      href: '/services',
      children: [
        {
          id: 'web-dev',
          label: 'Web Development',
          href: '/services/web-development',
        },
        {
          id: 'mobile-dev',
          label: 'Mobile Development',
          href: '/services/mobile-development',
        },
      ],
    },
  ];

  const mockUser: UserMenu = {
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Admin',
    tenant: {
      name: 'Demo Platform',
      subdomain: 'demo',
    },
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
    render(<NavBar />);
    
    expect(screen.getByText('LuxGen')).toBeInTheDocument();
  });

  it('renders with custom logo', () => {
    const customLogo = {
      text: 'Custom Logo',
      href: '/custom',
    };
    
    render(<NavBar logo={customLogo} />);
    
    expect(screen.getByText('Custom Logo')).toBeInTheDocument();
  });

  it('renders user menu when user is provided', () => {
    render(<NavBar  user={mockUser} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('opens user menu when clicked', async () => {
    const mockOnUserAction = jest.fn();
    
    render(
      <NavBar 
        user={mockUser} 
        onUserAction={mockOnUserAction}
      />
    );
    
    const userButton = screen.getByText('John Doe');
    fireEvent.click(userButton);
    
    await waitFor(() => {
      expect(screen.getByText('Profile')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });
  });

  it('calls onUserAction when user menu item is clicked', async () => {
    const mockOnUserAction = jest.fn();
    
    render(
      <NavBar 
        user={mockUser} 
        onUserAction={mockOnUserAction}
      />
    );
    
    const userButton = screen.getByText('John Doe');
    fireEvent.click(userButton);
    
    await waitFor(() => {
      const profileButton = screen.getByText('Profile');
      fireEvent.click(profileButton);
      expect(mockOnUserAction).toHaveBeenCalledWith('profile');
    });
  });

  it('renders search bar when showSearch is true', () => {
    const mockOnSearch = jest.fn();
    
    render(
      <NavBar 
        showSearch={true}
        onSearch={mockOnSearch}
        searchPlaceholder="Search..."
      />
    );
    
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('calls onSearch when search form is submitted', () => {
    const mockOnSearch = jest.fn();
    
    render(
      <NavBar 
        showSearch={true}
        onSearch={mockOnSearch}
      />
    );
    
    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'test query' } });
    fireEvent.submit(searchInput);
    
    expect(mockOnSearch).toHaveBeenCalledWith('test query');
  });

  it('renders notifications when showNotifications is true', () => {
    const mockOnNotificationClick = jest.fn();
    
    render(
      <NavBar 
        showNotifications={true}
        notificationCount={5}
        onNotificationClick={mockOnNotificationClick}
      />
    );
    
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('calls onNotificationClick when notification button is clicked', () => {
    const mockOnNotificationClick = jest.fn();
    
    render(
      <NavBar 
        showNotifications={true}
        onNotificationClick={mockOnNotificationClick}
      />
    );
    
    const notificationButton = screen.getByRole('button', { name: /notification/i });
    fireEvent.click(notificationButton);
    
    expect(mockOnNotificationClick).toHaveBeenCalled();
  });

  it('renders login/signup buttons when user is not provided', () => {
    render(<NavBar  />);
    
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });

  it('opens mobile menu when mobile menu button is clicked', () => {
    render(<NavBar  showMobileMenu={true} />);
    
    const mobileMenuButton = screen.getByRole('button', { name: /menu/i });
    fireEvent.click(mobileMenuButton);
    
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('handles external links correctly', () => {
    const itemsWithExternal: NavItem[] = [
      {
        id: 'external',
        label: 'External Link',
        href: 'https://example.com',
        external: true,
      },
    ];
    
    render(<NavBar />);
    
    const externalLink = screen.getByText('External Link');
    expect(externalLink).toBeInTheDocument();
  });

  it('disables navigation items when disabled prop is true', () => {
    const itemsWithDisabled: NavItem[] = [
      {
        id: 'disabled',
        label: 'Disabled Item',
        href: '/disabled',
        disabled: true,
      },
    ];
    
    render(<NavBar />);
    
    const disabledItem = screen.getByText('Disabled Item');
    expect(disabledItem).toHaveClass('opacity-50', 'cursor-not-allowed');
  });

  it('renders badges on navigation items', () => {
    const itemsWithBadge: NavItem[] = [
      {
        id: 'with-badge',
        label: 'Item with Badge',
        href: '/badge',
        badge: 'New',
      },
    ];
    
    render(<NavBar />);
    
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<NavBar  className="custom-navbar" />);
    
    const navbar = screen.getByRole('navigation');
    expect(navbar).toHaveClass('custom-navbar');
  });

  it('handles different variants correctly', () => {
    const { rerender } = render(<NavBar  variant="transparent" />);
    let navbar = screen.getByRole('navigation');
    expect(navbar).toHaveClass('bg-transparent');
    
    rerender(<NavBar  variant="solid" />);
    navbar = screen.getByRole('navigation');
    expect(navbar).toHaveClass('bg-gray-900');
  });

  it('handles different positions correctly', () => {
    const { rerender } = render(<NavBar  position="fixed" />);
    let navbar = screen.getByRole('navigation');
    expect(navbar).toHaveClass('fixed');
    
    rerender(<NavBar  position="sticky" />);
    navbar = screen.getByRole('navigation');
    expect(navbar).toHaveClass('sticky');
  });
});
