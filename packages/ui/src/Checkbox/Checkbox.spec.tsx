import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Checkbox } from './Checkbox';
import { checkboxFixtures } from './fixture';

describe('Checkbox', () => {
  it('renders with default props', () => {
    render(<Checkbox {...checkboxFixtures.default} />);
    
    expect(screen.getByText('Checkbox Label')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('renders as checked', () => {
    render(<Checkbox {...checkboxFixtures.checked} />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('renders with label and required indicator', () => {
    render(<Checkbox {...checkboxFixtures.withLabel} />);
    
    expect(screen.getByText('Checkbox with Label')).toBeInTheDocument();
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('renders with error', () => {
    render(<Checkbox {...checkboxFixtures.withError} />);
    
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('renders with helper text', () => {
    render(<Checkbox {...checkboxFixtures.withHelperText} />);
    
    expect(screen.getByText('Please check this box to continue')).toBeInTheDocument();
  });

  it('renders as disabled', () => {
    render(<Checkbox {...checkboxFixtures.disabled} />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeDisabled();
  });

  it('renders as disabled and checked', () => {
    render(<Checkbox {...checkboxFixtures.disabledChecked} />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeDisabled();
    expect(checkbox).toBeChecked();
  });

  it('renders as indeterminate', () => {
    render(<Checkbox {...checkboxFixtures.indeterminate} />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveProperty('indeterminate', true);
  });

  it('renders with custom theme', () => {
    render(<Checkbox {...checkboxFixtures.withCustomTheme} />);
    
    const checkboxWrapper = screen.getByText('Custom Themed Checkbox').closest('.checkbox-wrapper');
    expect(checkboxWrapper).toHaveStyle('font-family: Inter, system-ui, sans-serif');
  });

  it('renders without label', () => {
    render(<Checkbox {...checkboxFixtures.withoutLabel} />);
    
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
    expect(screen.queryByText('Checkbox Label')).not.toBeInTheDocument();
  });

  it('calls onChange when clicked', () => {
    const mockOnChange = jest.fn();
    render(<Checkbox {...checkboxFixtures.default} onChange={mockOnChange} />);
    
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    expect(mockOnChange).toHaveBeenCalledWith(true);
  });

  it('does not call onChange when disabled', () => {
    const mockOnChange = jest.fn();
    render(<Checkbox {...checkboxFixtures.disabled} onChange={mockOnChange} />);
    
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(<Checkbox {...checkboxFixtures.default} className="custom-checkbox" />);
    
    const checkboxWrapper = screen.getByText('Checkbox Label').closest('.checkbox-wrapper');
    expect(checkboxWrapper).toHaveClass('custom-checkbox');
  });

  it('applies custom style', () => {
    const customStyle = { border: '2px solid red' };
    render(<Checkbox {...checkboxFixtures.default} style={customStyle} />);
    
    const checkboxWrapper = screen.getByText('Checkbox Label').closest('.checkbox-wrapper');
    expect(checkboxWrapper).toHaveStyle('border: 2px solid red');
  });
});
