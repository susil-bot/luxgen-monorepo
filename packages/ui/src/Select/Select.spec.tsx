import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Select } from './Select';
import { selectFixtures } from './fixture';

describe('Select', () => {
  it('renders with default props', () => {
    render(<Select {...selectFixtures.default} />);
    
    expect(screen.getByText('Select an option...')).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<Select {...selectFixtures.withLabel} />);
    
    expect(screen.getByText('Choose Option')).toBeInTheDocument();
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('renders with error', () => {
    render(<Select {...selectFixtures.withError} />);
    
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('renders with helper text', () => {
    render(<Select {...selectFixtures.withHelperText} />);
    
    expect(screen.getByText('Please select an option from the list')).toBeInTheDocument();
  });

  it('renders as multi-select', () => {
    render(<Select {...selectFixtures.multiSelect} />);
    
    expect(screen.getByText('Select multiple options...')).toBeInTheDocument();
  });

  it('renders as searchable', () => {
    render(<Select {...selectFixtures.searchable} />);
    
    expect(screen.getByText('Search and select...')).toBeInTheDocument();
  });

  it('renders as disabled', () => {
    render(<Select {...selectFixtures.disabled} />);
    
    const selectTrigger = screen.getByText('Select an option...').parentElement;
    expect(selectTrigger).toHaveClass('disabled');
  });

  it('renders with custom theme', () => {
    render(<Select {...selectFixtures.withCustomTheme} />);
    
    const selectWrapper = screen.getByText('Select an option...').closest('.select-wrapper');
    expect(selectWrapper).toHaveStyle('font-family: Inter, system-ui, sans-serif');
  });

  it('renders with disabled options', () => {
    render(<Select {...selectFixtures.withDisabledOptions} />);
    
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2 (Disabled)')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  it('renders as clearable', () => {
    render(<Select {...selectFixtures.clearable} />);
    
    expect(screen.getByText('Option 1')).toBeInTheDocument();
  });

  it('opens dropdown when clicked', () => {
    render(<Select {...selectFixtures.default} />);
    
    const selectTrigger = screen.getByText('Select an option...');
    fireEvent.click(selectTrigger);
    
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  it('calls onChange when option is selected', () => {
    const mockOnChange = jest.fn();
    render(<Select {...selectFixtures.default} onChange={mockOnChange} />);
    
    const selectTrigger = screen.getByText('Select an option...');
    fireEvent.click(selectTrigger);
    
    const option1 = screen.getByText('Option 1');
    fireEvent.click(option1);
    
    expect(mockOnChange).toHaveBeenCalledWith('option1');
  });

  it('handles multi-select selection', () => {
    const mockOnChange = jest.fn();
    render(<Select {...selectFixtures.multiSelect} onChange={mockOnChange} />);
    
    const selectTrigger = screen.getByText('Select multiple options...');
    fireEvent.click(selectTrigger);
    
    const option1 = screen.getByText('Option 1');
    fireEvent.click(option1);
    
    expect(mockOnChange).toHaveBeenCalledWith(['option1']);
  });

  it('filters options when searching', () => {
    render(<Select {...selectFixtures.searchable} />);
    
    const selectTrigger = screen.getByText('Search and select...');
    fireEvent.click(selectTrigger);
    
    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'app' } });
    
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.queryByText('Banana')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Select {...selectFixtures.default} className="custom-select" />);
    
    const selectWrapper = screen.getByText('Select an option...').closest('.select-wrapper');
    expect(selectWrapper).toHaveClass('custom-select');
  });

  it('applies custom style', () => {
    const customStyle = { border: '2px solid red' };
    render(<Select {...selectFixtures.default} style={customStyle} />);
    
    const selectWrapper = screen.getByText('Select an option...').closest('.select-wrapper');
    expect(selectWrapper).toHaveStyle('border: 2px solid red');
  });
});
