import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NotFound } from './NotFound';

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
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://demo.localhost:3000',
  },
  writable: true,
});

describe('NotFound', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default props', () => {
    render(<NotFound />);
    
    expect(screen.getByText('Page Not Found')).toBeInTheDocument();
    expect(screen.getByText('The page you are looking for does not exist or has been moved.')).toBeInTheDocument();
    expect(screen.getByText('Go Back')).toBeInTheDocument();
    expect(screen.getByText('Go Home')).toBeInTheDocument();
  });

  it('renders with custom title and description', () => {
    render(
      <NotFound
        title="Custom 404"
        description="Custom error message"
      />
    );
    
    expect(screen.getByText('Custom 404')).toBeInTheDocument();
    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('renders search form when showSearch is true', () => {
    render(<NotFound showSearch={true} />);
    
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
  });

  it('does not render search form when showSearch is false', () => {
    render(<NotFound showSearch={false} />);
    
    expect(screen.queryByPlaceholderText('Search...')).not.toBeInTheDocument();
  });

  it('does not render navigation buttons when showNavigation is false', () => {
    render(<NotFound showNavigation={false} />);
    
    expect(screen.queryByText('Go Back')).not.toBeInTheDocument();
    expect(screen.queryByText('Go Home')).not.toBeInTheDocument();
  });

  it('calls onGoHome when Go Home button is clicked', () => {
    const mockOnGoHome = jest.fn();
    render(<NotFound onGoHome={mockOnGoHome} />);
    
    fireEvent.click(screen.getByText('Go Home'));
    expect(mockOnGoHome).toHaveBeenCalledTimes(1);
  });

  it('calls onGoBack when Go Back button is clicked', () => {
    const mockOnGoBack = jest.fn();
    render(<NotFound onGoBack={mockOnGoBack} />);
    
    fireEvent.click(screen.getByText('Go Back'));
    expect(mockOnGoBack).toHaveBeenCalledTimes(1);
  });

  it('calls window.location.href when no onGoHome is provided', () => {
    delete (window as any).location;
    (window as any).location = { href: 'http://demo.localhost:3000' };
    
    render(<NotFound />);
    
    fireEvent.click(screen.getByText('Go Home'));
    expect(window.location.href).toBe('http://demo.localhost:3000');
  });

  it('calls window.history.back when no onGoBack is provided', () => {
    const mockHistoryBack = jest.fn();
    Object.defineProperty(window, 'history', {
      value: { back: mockHistoryBack },
      writable: true,
    });
    
    render(<NotFound />);
    
    fireEvent.click(screen.getByText('Go Back'));
    expect(mockHistoryBack).toHaveBeenCalledTimes(1);
  });

  it('calls onSearch when search form is submitted', async () => {
    const mockOnSearch = jest.fn();
    render(<NotFound onSearch={mockOnSearch} showSearch={true} />);
    
    const searchInput = screen.getByPlaceholderText('Search...');
    const searchButton = screen.getByText('Search');
    
    fireEvent.change(searchInput, { target: { value: 'test query' } });
    fireEvent.click(searchButton);
    
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('test query');
    });
  });

  it('renders custom actions when provided', () => {
    const customActions = (
      <div data-testid="custom-actions">
        <button>Custom Action</button>
      </div>
    );
    
    render(<NotFound customActions={customActions} />);
    
    expect(screen.getByTestId('custom-actions')).toBeInTheDocument();
    expect(screen.getByText('Custom Action')).toBeInTheDocument();
  });

  it('renders minimal variant correctly', () => {
    render(<NotFound variant="minimal" />);
    
    expect(screen.getByText('Page Not Found')).toBeInTheDocument();
    expect(screen.getByText('Go Back')).toBeInTheDocument();
    expect(screen.getByText('Go Home')).toBeInTheDocument();
  });

  it('renders detailed variant correctly', () => {
    render(<NotFound variant="detailed" />);
    
    expect(screen.getByText('Page Not Found')).toBeInTheDocument();
    expect(screen.getByText('The page you are looking for does not exist or has been moved.')).toBeInTheDocument();
    expect(screen.getByText('Go Back')).toBeInTheDocument();
    expect(screen.getByText('Go Home')).toBeInTheDocument();
  });

  it('does not render illustration when showIllustration is false', () => {
    render(<NotFound showIllustration={false} />);
    
    // The illustration is rendered as a 404 number with an SVG overlay
    // When showIllustration is false, this should not be present
    expect(screen.queryByText('404')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<NotFound className="custom-class" />);
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('handles search form submission with empty query', async () => {
    const mockOnSearch = jest.fn();
    render(<NotFound onSearch={mockOnSearch} showSearch={true} />);
    
    const searchInput = screen.getByPlaceholderText('Search...');
    const searchButton = screen.getByText('Search');
    
    fireEvent.change(searchInput, { target: { value: '   ' } });
    fireEvent.click(searchButton);
    
    await waitFor(() => {
      expect(mockOnSearch).not.toHaveBeenCalled();
    });
  });

  it('renders with custom search placeholder', () => {
    render(<NotFound showSearch={true} searchPlaceholder="Custom search..." />);
    
    expect(screen.getByPlaceholderText('Custom search...')).toBeInTheDocument();
  });

  it('applies tenant theme colors', () => {
    const customTheme = {
      colors: {
        primary: '#FF0000',
        secondary: '#00FF00',
        accent: '#0000FF',
        background: '#FFFFFF',
        backgroundSecondary: '#F5F5F5',
        surface: '#FFFFFF',
        text: '#000000',
        textSecondary: '#666666',
        border: '#CCCCCC',
        error: '#FF0000',
        warning: '#FFA500',
        success: '#00FF00',
        info: '#0000FF',
      },
      fonts: {
        primary: 'Arial, sans-serif',
        secondary: 'Arial, sans-serif',
        mono: 'monospace',
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
      },
      shadows: {
        sm: '0 1px 2px rgba(0,0,0,0.1)',
        md: '0 4px 6px rgba(0,0,0,0.1)',
        lg: '0 10px 15px rgba(0,0,0,0.1)',
      },
    };
    
    const { container } = render(<NotFound tenantTheme={customTheme} />);
    
    const notFoundElement = container.firstChild as HTMLElement;
    expect(notFoundElement).toHaveStyle({
      backgroundColor: '#FFFFFF',
      color: '#000000',
    });
  });
});
