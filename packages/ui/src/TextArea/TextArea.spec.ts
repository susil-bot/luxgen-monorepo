import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TextArea } from './TextArea';
import { textAreaFixtures } from './fixture';

describe('TextArea', () => {
  it('renders with default props', () => {
    render(<TextArea {...textAreaFixtures.default} />);
    
    const textarea = screen.getByPlaceholderText('Enter your message...');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveAttribute('rows', '4');
  });

  it('renders with label', () => {
    render(<TextArea {...textAreaFixtures.withLabel} />);
    
    expect(screen.getByText('Message')).toBeInTheDocument();
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('renders with error', () => {
    render(<TextArea {...textAreaFixtures.withError} />);
    
    expect(screen.getByText('This field is required')).toBeInTheDocument();
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass('error');
  });

  it('renders with helper text', () => {
    render(<TextArea {...textAreaFixtures.withHelperText} />);
    
    expect(screen.getByText('Please provide a detailed description')).toBeInTheDocument();
  });

  it('renders with value', () => {
    render(<TextArea {...textAreaFixtures.withValue} />);
    
    const textarea = screen.getByDisplayValue('This is a sample message with some content.');
    expect(textarea).toBeInTheDocument();
  });

  it('renders as disabled', () => {
    render(<TextArea {...textAreaFixtures.disabled} />);
    
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeDisabled();
  });

  it('renders as read-only', () => {
    render(<TextArea {...textAreaFixtures.readOnly} />);
    
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('readOnly');
  });

  it('renders with custom theme', () => {
    render(<TextArea {...textAreaFixtures.withCustomTheme} />);
    
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveStyle('font-family: Inter, system-ui, sans-serif');
  });

  it('renders with max length', () => {
    render(<TextArea {...textAreaFixtures.withMaxLength} />);
    
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('maxLength', '100');
  });

  it('renders with min length', () => {
    render(<TextArea {...textAreaFixtures.withMinLength} />);
    
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('minLength', '10');
  });

  it('calls onChange when value changes', () => {
    const mockOnChange = jest.fn();
    render(<TextArea {...textAreaFixtures.default} onChange={mockOnChange} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'New value' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('New value');
  });

  it('applies custom className', () => {
    render(<TextArea {...textAreaFixtures.default} className="custom-textarea" />);
    
    const wrapper = screen.getByRole('textbox').parentElement;
    expect(wrapper).toHaveClass('custom-textarea');
  });

  it('applies custom style', () => {
    const customStyle = { border: '2px solid red' };
    render(<TextArea {...textAreaFixtures.default} style={customStyle} />);
    
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveStyle('border: 2px solid red');
  });
});
