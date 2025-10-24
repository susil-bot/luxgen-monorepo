import React from 'react';
import { render, screen } from '@testing-library/react';
import { Text } from './Text';
import { textFixtures } from './fixture';

describe('Text', () => {
  it('renders with default props', () => {
    render(<Text {...textFixtures.default} />);
    
    expect(screen.getByText('Default text content')).toBeInTheDocument();
    expect(screen.getByText('Default text content').tagName).toBe('P');
  });

  it('renders with different variants', () => {
    render(<Text {...textFixtures.normal} />);
    expect(screen.getByText('Normal text content')).toBeInTheDocument();
    
    render(<Text {...textFixtures.small} />);
    expect(screen.getByText('Small text content')).toBeInTheDocument();
    
    render(<Text {...textFixtures.large} />);
    expect(screen.getByText('Large text content')).toBeInTheDocument();
    
    render(<Text {...textFixtures.lead} />);
    expect(screen.getByText('Lead text content that stands out')).toBeInTheDocument();
    
    render(<Text {...textFixtures.caption} />);
    expect(screen.getByText('Caption text content')).toBeInTheDocument();
    
    render(<Text {...textFixtures.muted} />);
    expect(screen.getByText('Muted text content')).toBeInTheDocument();
  });

  it('renders with variant color', () => {
    render(<Text {...textFixtures.withVariant} />);
    
    const text = screen.getByText('Success text content');
    expect(text).toHaveStyle('color: #10B981');
  });

  it('renders with weight', () => {
    render(<Text {...textFixtures.withWeight} />);
    
    const text = screen.getByText('Bold text content');
    expect(text).toHaveStyle('font-weight: bold');
  });

  it('renders with alignment', () => {
    render(<Text {...textFixtures.withAlignment} />);
    
    const text = screen.getByText('Centered text content');
    expect(text).toHaveStyle('text-align: center');
  });

  it('renders with custom color', () => {
    render(<Text {...textFixtures.withColor} />);
    
    const text = screen.getByText('Custom colored text content');
    expect(text).toHaveStyle('color: #8B5CF6');
  });

  it('renders with truncate', () => {
    render(<Text {...textFixtures.withTruncate} />);
    
    const text = screen.getByText('This is a very long text content that should be truncated when the container is too small');
    expect(text).toHaveStyle('overflow: hidden');
    expect(text).toHaveStyle('text-overflow: ellipsis');
    expect(text).toHaveStyle('white-space: nowrap');
  });

  it('renders as different elements', () => {
    render(<Text {...textFixtures.asSpan} />);
    expect(screen.getByText('Span text content').tagName).toBe('SPAN');
    
    render(<Text {...textFixtures.asDiv} />);
    expect(screen.getByText('Div text content').tagName).toBe('DIV');
  });

  it('renders with custom theme', () => {
    render(<Text {...textFixtures.withCustomTheme} />);
    
    const text = screen.getByText('Custom themed text content');
    expect(text).toHaveStyle('font-family: Inter, system-ui, sans-serif');
  });

  it('applies custom className', () => {
    render(<Text {...textFixtures.default} className="custom-text" />);
    
    const text = screen.getByText('Default text content');
    expect(text).toHaveClass('custom-text');
  });

  it('applies custom style', () => {
    const customStyle = { border: '2px solid red' };
    render(<Text {...textFixtures.default} style={customStyle} />);
    
    const text = screen.getByText('Default text content');
    expect(text).toHaveStyle('border: 2px solid red');
  });
});
