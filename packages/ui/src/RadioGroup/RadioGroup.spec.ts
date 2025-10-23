import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RadioGroup } from './RadioGroup';
import { radioGroupFixtures } from './fixture';

describe('RadioGroup', () => {
  it('renders with default props', () => {
    render(<RadioGroup {...radioGroupFixtures.default} />);
    
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
    
    const radio1 = screen.getByDisplayValue('option1');
    expect(radio1).toBeChecked();
  });

  it('renders with label and required indicator', () => {
    render(<RadioGroup {...radioGroupFixtures.withLabel} />);
    
    expect(screen.getByText('Choose Option')).toBeInTheDocument();
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('renders with error', () => {
    render(<RadioGroup {...radioGroupFixtures.withError} />);
    
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('renders with helper text', () => {
    render(<RadioGroup {...radioGroupFixtures.withHelperText} />);
    
    expect(screen.getByText('Please select one option from the list')).toBeInTheDocument();
  });

  it('renders in horizontal orientation', () => {
    render(<RadioGroup {...radioGroupFixtures.horizontal} />);
    
    const radioGroup = screen.getByText('Option 1').closest('.radio-group');
    expect(radioGroup).toHaveClass('horizontal');
  });

  it('renders as disabled', () => {
    render(<RadioGroup {...radioGroupFixtures.disabled} />);
    
    const radio1 = screen.getByDisplayValue('option1');
    const radio2 = screen.getByDisplayValue('option2');
    expect(radio1).toBeDisabled();
    expect(radio2).toBeDisabled();
  });

  it('renders with disabled options', () => {
    render(<RadioGroup {...radioGroupFixtures.withDisabledOptions} />);
    
    const radio1 = screen.getByDisplayValue('option1');
    const radio2 = screen.getByDisplayValue('option2');
    const radio3 = screen.getByDisplayValue('option3');
    
    expect(radio1).not.toBeDisabled();
    expect(radio2).toBeDisabled();
    expect(radio3).not.toBeDisabled();
  });

  it('renders with custom theme', () => {
    render(<RadioGroup {...radioGroupFixtures.withCustomTheme} />);
    
    const radioGroupWrapper = screen.getByText('Option 1').closest('.radio-group-wrapper');
    expect(radioGroupWrapper).toHaveStyle('font-family: Inter, system-ui, sans-serif');
  });

  it('renders with many options', () => {
    render(<RadioGroup {...radioGroupFixtures.manyOptions} />);
    
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
    expect(screen.getByText('Option 4')).toBeInTheDocument();
    expect(screen.getByText('Option 5')).toBeInTheDocument();
    expect(screen.getByText('Option 6')).toBeInTheDocument();
  });

  it('renders with no selection', () => {
    render(<RadioGroup {...radioGroupFixtures.noSelection} />);
    
    const radio1 = screen.getByDisplayValue('option1');
    const radio2 = screen.getByDisplayValue('option2');
    expect(radio1).not.toBeChecked();
    expect(radio2).not.toBeChecked();
  });

  it('calls onChange when option is selected', () => {
    const mockOnChange = jest.fn();
    render(<RadioGroup {...radioGroupFixtures.default} onChange={mockOnChange} />);
    
    const radio2 = screen.getByDisplayValue('option2');
    fireEvent.click(radio2);
    
    expect(mockOnChange).toHaveBeenCalledWith('option2');
  });

  it('does not call onChange when disabled', () => {
    const mockOnChange = jest.fn();
    render(<RadioGroup {...radioGroupFixtures.disabled} onChange={mockOnChange} />);
    
    const radio2 = screen.getByDisplayValue('option2');
    fireEvent.click(radio2);
    
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(<RadioGroup {...radioGroupFixtures.default} className="custom-radio-group" />);
    
    const radioGroupWrapper = screen.getByText('Option 1').closest('.radio-group-wrapper');
    expect(radioGroupWrapper).toHaveClass('custom-radio-group');
  });

  it('applies custom style', () => {
    const customStyle = { border: '2px solid red' };
    render(<RadioGroup {...radioGroupFixtures.default} style={customStyle} />);
    
    const radioGroupWrapper = screen.getByText('Option 1').closest('.radio-group-wrapper');
    expect(radioGroupWrapper).toHaveStyle('border: 2px solid red');
  });
});
