import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Card } from './Card';
import { cardFixtures } from './fixture';

describe('Card', () => {
  it('renders with default props', () => {
    render(<Card {...cardFixtures.default} />);
    
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders with title', () => {
    render(<Card {...cardFixtures.withTitle} />);
    
    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders with description', () => {
    render(<Card {...cardFixtures.withDescription} />);
    
    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card description')).toBeInTheDocument();
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders with icon', () => {
    render(<Card {...cardFixtures.withIcon} />);
    
    expect(screen.getByText('🔖')).toBeInTheDocument();
    expect(screen.getByText('Card Title')).toBeInTheDocument();
  });

  it('renders with different variants', () => {
    render(<Card {...cardFixtures.elevated} />);
    const elevatedCard = screen.getByText('Elevated Card').closest('.card');
    expect(elevatedCard).toHaveClass('card-elevated');
    
    render(<Card {...cardFixtures.outlined} />);
    const outlinedCard = screen.getByText('Outlined Card').closest('.card');
    expect(outlinedCard).toHaveClass('card-outlined');
    
    render(<Card {...cardFixtures.filled} />);
    const filledCard = screen.getByText('Filled Card').closest('.card');
    expect(filledCard).toHaveClass('card-filled');
  });

  it('renders with different sizes', () => {
    render(<Card {...cardFixtures.small} />);
    const smallCard = screen.getByText('Small Card').closest('.card');
    expect(smallCard).toHaveClass('card-small');
    
    render(<Card {...cardFixtures.medium} />);
    const mediumCard = screen.getByText('Medium Card').closest('.card');
    expect(mediumCard).toHaveClass('card-medium');
    
    render(<Card {...cardFixtures.large} />);
    const largeCard = screen.getByText('Large Card').closest('.card');
    expect(largeCard).toHaveClass('card-large');
  });

  it('renders as clickable', () => {
    render(<Card {...cardFixtures.clickable} />);
    
    const card = screen.getByText('Clickable Card').closest('.card');
    expect(card).toHaveClass('card-clickable');
  });

  it('calls onClick when clicked', () => {
    const onClick = jest.fn();
    render(<Card {...cardFixtures.clickable} onClick={onClick} />);
    
    const card = screen.getByText('Clickable Card').closest('.card');
    fireEvent.click(card!);
    
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders with hover effect', () => {
    render(<Card {...cardFixtures.withHover} />);
    
    const card = screen.getByText('Hover Card').closest('.card');
    expect(card).toHaveClass('card-hover');
  });

  it('renders with image', () => {
    render(<Card {...cardFixtures.withImage} />);
    
    const image = screen.getByAltText('Placeholder image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://via.placeholder.com/300x200');
  });

  it('renders with header', () => {
    render(<Card {...cardFixtures.withHeader} />);
    
    expect(screen.getByText('Custom header')).toBeInTheDocument();
  });

  it('renders with footer', () => {
    render(<Card {...cardFixtures.withFooter} />);
    
    expect(screen.getByText('Custom footer')).toBeInTheDocument();
  });

  it('renders with custom theme', () => {
    render(<Card {...cardFixtures.withCustomTheme} />);
    
    expect(screen.getByText('Custom Themed Card')).toBeInTheDocument();
  });

  it('renders with all features', () => {
    render(<Card {...cardFixtures.withAllFeatures} />);
    
    expect(screen.getByText('Feature Rich Card')).toBeInTheDocument();
    expect(screen.getByText('This card has all the features')).toBeInTheDocument();
    expect(screen.getByText('⭐')).toBeInTheDocument();
    expect(screen.getByText('Custom header content')).toBeInTheDocument();
    expect(screen.getByText('Custom footer content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Card {...cardFixtures.default} className="custom-card" />);
    
    const card = screen.getByText('Card content').closest('.card');
    expect(card).toHaveClass('custom-card');
  });

  it('applies custom style', () => {
    const customStyle = { border: '2px solid red' };
    render(<Card {...cardFixtures.default} style={customStyle} />);
    
    const card = screen.getByText('Card content').closest('.card');
    expect(card).toHaveStyle('border: 2px solid red');
  });

  it('renders with complex children', () => {
    render(
      <Card {...cardFixtures.default}>
        <div>
          <h3>Complex Content</h3>
          <p>This is complex card content</p>
          <button>Action Button</button>
        </div>
      </Card>
    );
    
    expect(screen.getByText('Complex Content')).toBeInTheDocument();
    expect(screen.getByText('This is complex card content')).toBeInTheDocument();
    expect(screen.getByText('Action Button')).toBeInTheDocument();
  });
});
