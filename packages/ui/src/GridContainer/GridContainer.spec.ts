import React from 'react';
import { render, screen } from '@testing-library/react';
import { GridContainer } from './GridContainer';
import { gridContainerFixtures } from './fixture';

describe('GridContainer', () => {
  it('renders with default props', () => {
    render(<GridContainer {...gridContainerFixtures.default} />);
    
    const gridContainer = screen.getByText('Grid Item 1').parentElement;
    expect(gridContainer).toBeInTheDocument();
    expect(gridContainer).toHaveClass('grid-container');
    expect(gridContainer).toHaveStyle('display: grid');
    expect(gridContainer).toHaveStyle('grid-template-columns: repeat(3, 1fr)');
    expect(gridContainer).toHaveStyle('gap: 1rem');
  });

  it('renders with two columns', () => {
    render(<GridContainer {...gridContainerFixtures.twoColumns} />);
    
    const gridContainer = screen.getByText('Grid Item 1').parentElement;
    expect(gridContainer).toHaveStyle('grid-template-columns: repeat(2, 1fr)');
    expect(gridContainer).toHaveStyle('gap: 1.5rem');
  });

  it('renders with four columns', () => {
    render(<GridContainer {...gridContainerFixtures.fourColumns} />);
    
    const gridContainer = screen.getByText('Grid Item 1').parentElement;
    expect(gridContainer).toHaveStyle('grid-template-columns: repeat(4, 1fr)');
    expect(gridContainer).toHaveStyle('gap: 0.5rem');
  });

  it('renders with custom theme', () => {
    render(<GridContainer {...gridContainerFixtures.withCustomTheme} />);
    
    const gridContainer = screen.getByText('Grid Item 1').parentElement;
    expect(gridContainer).toHaveStyle('font-family: Inter, system-ui, sans-serif');
  });

  it('renders with single column', () => {
    render(<GridContainer {...gridContainerFixtures.singleColumn} />);
    
    const gridContainer = screen.getByText('Grid Item 1').parentElement;
    expect(gridContainer).toHaveStyle('grid-template-columns: repeat(1, 1fr)');
  });

  it('applies custom className', () => {
    render(<GridContainer {...gridContainerFixtures.default} className="custom-grid" />);
    
    const gridContainer = screen.getByText('Grid Item 1').parentElement;
    expect(gridContainer).toHaveClass('custom-grid');
  });

  it('applies custom style', () => {
    const customStyle = { border: '2px solid red' };
    render(<GridContainer {...gridContainerFixtures.default} style={customStyle} />);
    
    const gridContainer = screen.getByText('Grid Item 1').parentElement;
    expect(gridContainer).toHaveStyle('border: 2px solid red');
  });

  it('renders all children', () => {
    render(<GridContainer {...gridContainerFixtures.default} />);
    
    expect(screen.getByText('Grid Item 1')).toBeInTheDocument();
    expect(screen.getByText('Grid Item 2')).toBeInTheDocument();
    expect(screen.getByText('Grid Item 3')).toBeInTheDocument();
  });
});
