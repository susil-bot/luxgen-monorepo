import React from 'react';
import { render, screen } from '@testing-library/react';
import { Heading } from './Heading';
import { headingFixtures } from './fixture';

describe('Heading', () => {
  it('renders with default props', () => {
    render(<Heading {...headingFixtures.default} />);
    
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Main Heading')).toBeInTheDocument();
  });

  it('renders with different heading levels', () => {
    render(<Heading {...headingFixtures.h1} />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    
    render(<Heading {...headingFixtures.h2} />);
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    
    render(<Heading {...headingFixtures.h3} />);
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
    
    render(<Heading {...headingFixtures.h4} />);
    expect(screen.getByRole('heading', { level: 4 })).toBeInTheDocument();
    
    render(<Heading {...headingFixtures.h5} />);
    expect(screen.getByRole('heading', { level: 5 })).toBeInTheDocument();
    
    render(<Heading {...headingFixtures.h6} />);
    expect(screen.getByRole('heading', { level: 6 })).toBeInTheDocument();
  });

  it('renders with variant', () => {
    render(<Heading {...headingFixtures.withVariant} />);
    
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveStyle('color: #10B981');
  });

  it('renders with custom color', () => {
    render(<Heading {...headingFixtures.withColor} />);
    
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveStyle('color: #8B5CF6');
  });

  it('renders with alignment', () => {
    render(<Heading {...headingFixtures.withAlignment} />);
    
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveStyle('text-align: center');
  });

  it('renders with truncate', () => {
    render(<Heading {...headingFixtures.withTruncate} />);
    
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveStyle('overflow: hidden');
    expect(heading).toHaveStyle('text-overflow: ellipsis');
    expect(heading).toHaveStyle('white-space: nowrap');
  });

  it('renders with custom theme', () => {
    render(<Heading {...headingFixtures.withCustomTheme} />);
    
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveStyle('font-family: Inter, system-ui, sans-serif');
  });

  it('renders with weight', () => {
    render(<Heading {...headingFixtures.withWeight} />);
    
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveStyle('font-weight: bold');
  });

  it('renders with size', () => {
    render(<Heading {...headingFixtures.withSize} />);
    
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveClass('heading-5xl');
  });

  it('applies custom className', () => {
    render(<Heading {...headingFixtures.default} className="custom-heading" />);
    
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('custom-heading');
  });

  it('applies custom style', () => {
    const customStyle = { border: '2px solid red' };
    render(<Heading {...headingFixtures.default} style={customStyle} />);
    
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveStyle('border: 2px solid red');
  });
});
