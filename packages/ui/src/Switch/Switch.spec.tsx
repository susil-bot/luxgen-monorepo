import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Switch } from './Switch';
import { switchFixtures } from './fixture';

describe('Switch', () => {
  it('renders with default props', () => {
    render(<Switch {...switchFixtures.default} />);
    
    expect(screen.getByText('Switch Label')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('renders as checked', () => {
    render(<Switch {...switchFixtures.checked} />);
    
    const switchInput = screen.getByRole('checkbox');
    expect(switchInput).toBeChecked();
  });

  it('renders with label and required indicator', () => {
    render(<Switch {...switchFixtures.withLabel} />);
    
    expect(screen.getByText('Switch with Label')).toBeInTheDocument();
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('renders with error', () => {
    render(<Switch {...switchFixtures.withError} />);
    
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('renders with helper text', () => {
    render(<Switch {...switchFixtures.withHelperText} />);
    
    expect(screen.getByText('Toggle this switch to enable the feature')).toBeInTheDocument();
  });

  it('renders as disabled', () => {
    render(<Switch {...switchFixtures.disabled} />);
    
    const switchInput = screen.getByRole('checkbox');
    expect(switchInput).toBeDisabled();
  });

  it('renders as disabled and checked', () => {
    render(<Switch {...switchFixtures.disabledChecked} />);
    
    const switchInput = screen.getByRole('checkbox');
    expect(switchInput).toBeDisabled();
    expect(switchInput).toBeChecked();
  });

  it('renders with small size', () => {
    render(<Switch {...switchFixtures.small} />);
    
    const switchCustom = screen.getByText('Small Switch').closest('.switch-label')?.querySelector('.switch-custom');
    expect(switchCustom).toHaveClass('sm');
  });

  it('renders with large size', () => {
    render(<Switch {...switchFixtures.large} />);
    
    const switchCustom = screen.getByText('Large Switch').closest('.switch-label')?.querySelector('.switch-custom');
    expect(switchCustom).toHaveClass('lg');
  });

  it('renders with custom theme', () => {
    render(<Switch {...switchFixtures.withCustomTheme} />);
    
    const switchWrapper = screen.getByText('Custom Themed Switch').closest('.switch-wrapper');
    expect(switchWrapper).toHaveStyle('font-family: Inter, system-ui, sans-serif');
  });

  it('renders without label', () => {
    render(<Switch {...switchFixtures.withoutLabel} />);
    
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
    expect(screen.queryByText('Switch Label')).not.toBeInTheDocument();
  });

  it('calls onChange when clicked', () => {
    const mockOnChange = jest.fn();
    render(<Switch {...switchFixtures.default} onChange={mockOnChange} />);
    
    const switchInput = screen.getByRole('checkbox');
    fireEvent.click(switchInput);
    
    expect(mockOnChange).toHaveBeenCalledWith(true);
  });

  it('does not call onChange when disabled', () => {
    const mockOnChange = jest.fn();
    render(<Switch {...switchFixtures.disabled} onChange={mockOnChange} />);
    
    const switchInput = screen.getByRole('checkbox');
    fireEvent.click(switchInput);
    
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(<Switch {...switchFixtures.default} className="custom-switch" />);
    
    const switchWrapper = screen.getByText('Switch Label').closest('.switch-wrapper');
    expect(switchWrapper).toHaveClass('custom-switch');
  });

  it('applies custom style', () => {
    const customStyle = { border: '2px solid red' };
    render(<Switch {...switchFixtures.default} style={customStyle} />);
    
    const switchWrapper = screen.getByText('Switch Label').closest('.switch-wrapper');
    expect(switchWrapper).toHaveStyle('border: 2px solid red');
  });
});
