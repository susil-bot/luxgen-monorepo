import React from 'react';
import { render, screen } from '@testing-library/react';
import { Kicker } from './Kicker';
import { kickerFixtures } from './fixture';

describe('Kicker', () => {
  it('renders with default props', () => {
    render(<Kicker {...kickerFixtures.default} />);
    
    expect(screen.getByText('Default kicker')).toBeInTheDocument();
  });

  it('renders with different variants', () => {
    render(<Kicker {...kickerFixtures.primary} />);
    expect(screen.getByText('Primary kicker')).toBeInTheDocument();
    
    render(<Kicker {...kickerFixtures.secondary} />);
    expect(screen.getByText('Secondary kicker')).toBeInTheDocument();
    
    render(<Kicker {...kickerFixtures.success} />);
    expect(screen.getByText('Success kicker')).toBeInTheDocument();
    
    render(<Kicker {...kickerFixtures.error} />);
    expect(screen.getByText('Error kicker')).toBeInTheDocument();
    
    render(<Kicker {...kickerFixtures.warning} />);
    expect(screen.getByText('Warning kicker')).toBeInTheDocument();
    
    render(<Kicker {...kickerFixtures.info} />);
    expect(screen.getByText('Info kicker')).toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    render(<Kicker {...kickerFixtures.small} />);
    const smallKicker = screen.getByText('Small kicker');
    expect(smallKicker).toHaveClass('kicker-small');
    
    render(<Kicker {...kickerFixtures.medium} />);
    const mediumKicker = screen.getByText('Medium kicker');
    expect(mediumKicker).toHaveClass('kicker-medium');
    
    render(<Kicker {...kickerFixtures.large} />);
    const largeKicker = screen.getByText('Large kicker');
    expect(largeKicker).toHaveClass('kicker-large');
  });

  it('renders with weight', () => {
    render(<Kicker {...kickerFixtures.withWeight} />);
    
    const kicker = screen.getByText('Bold kicker');
    expect(kicker).toHaveStyle('font-weight: bold');
  });

  it('renders with alignment', () => {
    render(<Kicker {...kickerFixtures.withAlignment} />);
    
    const kicker = screen.getByText('Centered kicker');
    expect(kicker).toHaveStyle('text-align: center');
  });

  it('renders with underline', () => {
    render(<Kicker {...kickerFixtures.withUnderline} />);
    
    const kicker = screen.getByText('Underlined kicker');
    expect(kicker).toHaveStyle('text-decoration: underline');
  });

  it('renders with icon', () => {
    render(<Kicker {...kickerFixtures.withIcon} />);
    
    expect(screen.getByText('Kicker with icon')).toBeInTheDocument();
    expect(screen.getByText('🔖')).toBeInTheDocument();
  });

  it('renders with right icon', () => {
    render(<Kicker {...kickerFixtures.withIconRight} />);
    
    expect(screen.getByText('Kicker with right icon')).toBeInTheDocument();
    expect(screen.getByText('🔖')).toBeInTheDocument();
  });

  it('renders without uppercase', () => {
    render(<Kicker {...kickerFixtures.notUppercase} />);
    
    const kicker = screen.getByText('Not uppercase kicker');
    expect(kicker).toHaveStyle('text-transform: none');
  });

  it('renders with custom theme', () => {
    render(<Kicker {...kickerFixtures.withCustomTheme} />);
    
    const kicker = screen.getByText('Custom themed kicker');
    expect(kicker).toHaveStyle('color: #8B5CF6');
  });

  it('applies custom className', () => {
    render(<Kicker {...kickerFixtures.default} className="custom-kicker" />);
    
    const kicker = screen.getByText('Default kicker');
    expect(kicker).toHaveClass('custom-kicker');
  });

  it('applies custom style', () => {
    const customStyle = { border: '2px solid red' };
    render(<Kicker {...kickerFixtures.default} style={customStyle} />);
    
    const kicker = screen.getByText('Default kicker');
    expect(kicker).toHaveStyle('border: 2px solid red');
  });

  it('renders with complex children', () => {
    render(
      <Kicker {...kickerFixtures.default}>
        <span>Complex content</span>
      </Kicker>
    );
    
    expect(screen.getByText('Complex content')).toBeInTheDocument();
  });
});
