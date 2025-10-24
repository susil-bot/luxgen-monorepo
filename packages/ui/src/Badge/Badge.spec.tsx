import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Badge } from './Badge';
import { badgeFixtures } from './fixture';

describe('Badge', () => {
  it('renders with default props', () => {
    render(<Badge {...badgeFixtures.default} />);
    
    expect(screen.getByText('Default badge')).toBeInTheDocument();
  });

  it('renders with different variants', () => {
    render(<Badge {...badgeFixtures.primary} />);
    expect(screen.getByText('Primary badge')).toBeInTheDocument();
    
    render(<Badge {...badgeFixtures.secondary} />);
    expect(screen.getByText('Secondary badge')).toBeInTheDocument();
    
    render(<Badge {...badgeFixtures.success} />);
    expect(screen.getByText('Success badge')).toBeInTheDocument();
    
    render(<Badge {...badgeFixtures.error} />);
    expect(screen.getByText('Error badge')).toBeInTheDocument();
    
    render(<Badge {...badgeFixtures.warning} />);
    expect(screen.getByText('Warning badge')).toBeInTheDocument();
    
    render(<Badge {...badgeFixtures.info} />);
    expect(screen.getByText('Info badge')).toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    render(<Badge {...badgeFixtures.small} />);
    const smallBadge = screen.getByText('Small badge');
    expect(smallBadge).toHaveClass('badge-small');
    
    render(<Badge {...badgeFixtures.medium} />);
    const mediumBadge = screen.getByText('Medium badge');
    expect(mediumBadge).toHaveClass('badge-medium');
    
    render(<Badge {...badgeFixtures.large} />);
    const largeBadge = screen.getByText('Large badge');
    expect(largeBadge).toHaveClass('badge-large');
  });

  it('renders with different shapes', () => {
    render(<Badge {...badgeFixtures.rounded} />);
    const roundedBadge = screen.getByText('Rounded badge');
    expect(roundedBadge).toHaveClass('badge-rounded');
    
    render(<Badge {...badgeFixtures.pill} />);
    const pillBadge = screen.getByText('Pill badge');
    expect(pillBadge).toHaveClass('badge-pill');
    
    render(<Badge {...badgeFixtures.square} />);
    const squareBadge = screen.getByText('Square badge');
    expect(squareBadge).toHaveClass('badge-square');
  });

  it('renders as dot', () => {
    render(<Badge {...badgeFixtures.dot} />);
    
    const dotBadge = screen.getByRole('generic');
    expect(dotBadge).toHaveStyle('width: 0.5rem');
    expect(dotBadge).toHaveStyle('height: 0.5rem');
    expect(dotBadge).toHaveStyle('border-radius: 50%');
  });

  it('renders with close button when closable', () => {
    render(<Badge {...badgeFixtures.closable} />);
    
    expect(screen.getByText('Closable badge')).toBeInTheDocument();
    expect(screen.getByLabelText('Close badge')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = jest.fn();
    render(<Badge {...badgeFixtures.closable} onClose={onClose} />);
    
    const closeButton = screen.getByLabelText('Close badge');
    fireEvent.click(closeButton);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders with icon', () => {
    render(<Badge {...badgeFixtures.withIcon} />);
    
    expect(screen.getByText('Badge with icon')).toBeInTheDocument();
    expect(screen.getByText('🔖')).toBeInTheDocument();
  });

  it('renders with max width', () => {
    render(<Badge {...badgeFixtures.withMaxWidth} />);
    
    const badge = screen.getByText('Badge with max width');
    expect(badge).toHaveStyle('max-width: 200px');
  });

  it('renders with custom theme', () => {
    render(<Badge {...badgeFixtures.withCustomTheme} />);
    
    const badge = screen.getByText('Custom themed badge');
    expect(badge).toHaveStyle('color: #8B5CF6');
  });

  it('applies custom className', () => {
    render(<Badge {...badgeFixtures.default} className="custom-badge" />);
    
    const badge = screen.getByText('Default badge');
    expect(badge).toHaveClass('custom-badge');
  });

  it('applies custom style', () => {
    const customStyle = { border: '2px solid red' };
    render(<Badge {...badgeFixtures.default} style={customStyle} />);
    
    const badge = screen.getByText('Default badge');
    expect(badge).toHaveStyle('border: 2px solid red');
  });

  it('renders with complex children', () => {
    render(
      <Badge {...badgeFixtures.default}>
        <span>Complex content</span>
      </Badge>
    );
    
    expect(screen.getByText('Complex content')).toBeInTheDocument();
  });
});
