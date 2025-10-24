import React from 'react';
import { render, screen } from '@testing-library/react';
import { PageWrapper } from './PageWrapper';
import { pageWrapperFixtures } from './fixture';
import { defaultTheme } from '../theme';

describe('PageWrapper', () => {
  it('renders with default props', () => {
    render(<PageWrapper {...pageWrapperFixtures.default} />);
    
    const pageWrapper = screen.getByText('Default PageWrapper Content');
    expect(pageWrapper).toBeInTheDocument();
    expect(pageWrapper).toHaveClass('page-wrapper');
  });

  it('renders with custom padding', () => {
    render(<PageWrapper {...pageWrapperFixtures.withCustomPadding} />);
    
    const pageWrapper = screen.getByText('PageWrapper with custom padding');
    expect(pageWrapper).toHaveStyle('padding: 2rem');
  });

  it('renders with custom theme', () => {
    render(<PageWrapper {...pageWrapperFixtures.withCustomTheme} />);
    
    const pageWrapper = screen.getByText('PageWrapper with custom theme');
    expect(pageWrapper).toHaveStyle('background-color: #F3F4F6');
    expect(pageWrapper).toHaveStyle('color: #111827');
  });

  it('renders with custom className', () => {
    render(<PageWrapper {...pageWrapperFixtures.withClassName} />);
    
    const pageWrapper = screen.getByText('PageWrapper with custom className');
    expect(pageWrapper).toHaveClass('custom-page-wrapper');
  });

  it('renders with custom style', () => {
    render(<PageWrapper {...pageWrapperFixtures.withStyle} />);
    
    const pageWrapper = screen.getByText('PageWrapper with custom style');
    expect(pageWrapper).toHaveStyle('border: 1px solid #E5E7EB');
    expect(pageWrapper).toHaveStyle('border-radius: 0.5rem');
  });

  it('applies tenant theme colors', () => {
    const baseTheme = pageWrapperFixtures.withCustomTheme.tenantTheme || defaultTheme;
    const customTheme = {
      ...baseTheme,
      colors: {
        ...baseTheme.colors,
        primary: '#FF6B6B',
      },
    };
    
    render(
      <PageWrapper 
        {...pageWrapperFixtures.withCustomTheme} 
        tenantTheme={customTheme}
      />
    );
    
    const pageWrapper = screen.getByText('PageWrapper with custom theme');
    expect(pageWrapper).toHaveStyle('font-family: Inter, system-ui, sans-serif');
  });
});
