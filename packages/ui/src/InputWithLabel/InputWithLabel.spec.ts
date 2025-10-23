import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { InputWithLabel } from './InputWithLabel';
import { inputWithLabelFixtures } from './fixture';

describe('InputWithLabel', () => {
  it('renders with default props', () => {
    render(<InputWithLabel {...inputWithLabelFixtures.default} />);
    
    expect(screen.getByText('Input Label')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter text...')).toBeInTheDocument();
  });

  it('renders with value', () => {
    render(<InputWithLabel {...inputWithLabelFixtures.withValue} />);
    
    const input = screen.getByDisplayValue('Sample text');
    expect(input).toBeInTheDocument();
  });

  it('renders with error', () => {
    render(<InputWithLabel {...inputWithLabelFixtures.withError} />);
    
    expect(screen.getByText('This field is required')).toBeInTheDocument();
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('error');
  });

  it('renders with helper text', () => {
    render(<InputWithLabel {...inputWithLabelFixtures.withHelperText} />);
    
    expect(screen.getByText('Please enter your text here')).toBeInTheDocument();
  });

  it('renders as required', () => {
    render(<InputWithLabel {...inputWithLabelFixtures.required} />);
    
    expect(screen.getByText('*')).toBeInTheDocument();
    const input = screen.getByRole('textbox');
    expect(input).toBeRequired();
  });

  it('renders as disabled', () => {
    render(<InputWithLabel {...inputWithLabelFixtures.disabled} />);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('renders with email type', () => {
    render(<InputWithLabel {...inputWithLabelFixtures.email} />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('renders with password type', () => {
    render(<InputWithLabel {...inputWithLabelFixtures.password} />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'password');
  });

  it('renders with small size', () => {
    render(<InputWithLabel {...inputWithLabelFixtures.small} />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('sm');
  });

  it('renders with large size', () => {
    render(<InputWithLabel {...inputWithLabelFixtures.large} />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('lg');
  });

  it('renders with custom theme', () => {
    render(<InputWithLabel {...inputWithLabelFixtures.withCustomTheme} />);
    
    const inputWrapper = screen.getByText('Custom Themed Input').closest('.input-with-label-wrapper');
    expect(inputWrapper).toHaveStyle('font-family: Inter, system-ui, sans-serif');
  });

  it('calls onChange when value changes', () => {
    const mockOnChange = jest.fn();
    render(<InputWithLabel {...inputWithLabelFixtures.default} onChange={mockOnChange} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'New value' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('New value');
  });

  it('applies custom className', () => {
    render(<InputWithLabel {...inputWithLabelFixtures.default} className="custom-input" />);
    
    const inputWrapper = screen.getByText('Input Label').closest('.input-with-label-wrapper');
    expect(inputWrapper).toHaveClass('custom-input');
  });

  it('applies custom style', () => {
    const customStyle = { border: '2px solid red' };
    render(<InputWithLabel {...inputWithLabelFixtures.default} style={customStyle} />);
    
    const inputWrapper = screen.getByText('Input Label').closest('.input-with-label-wrapper');
    expect(inputWrapper).toHaveStyle('border: 2px solid red');
  });
});
