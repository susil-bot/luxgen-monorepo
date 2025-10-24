import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Form } from './Form';
import { formFixtures } from './fixture';

describe('Form', () => {
  it('renders with default props', () => {
    render(<Form {...formFixtures.default} />);
    
    expect(screen.getByRole('form')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });

  it('renders with validation', () => {
    render(<Form {...formFixtures.withValidation} />);
    
    const nameInput = screen.getByLabelText('Name *');
    const emailInput = screen.getByLabelText('Email *');
    expect(nameInput).toBeRequired();
    expect(emailInput).toBeRequired();
  });

  it('renders with file upload', () => {
    render(<Form {...formFixtures.withFileUpload} />);
    
    const fileInput = screen.getByLabelText('Upload File');
    expect(fileInput).toHaveAttribute('type', 'file');
  });

  it('renders with custom theme', () => {
    render(<Form {...formFixtures.withCustomTheme} />);
    
    const form = screen.getByRole('form');
    expect(form).toHaveStyle('font-family: Inter, system-ui, sans-serif');
  });

  it('renders with no validation', () => {
    render(<Form {...formFixtures.withNoValidation} />);
    
    const form = screen.getByRole('form');
    expect(form).toHaveAttribute('novalidate');
  });

  it('renders with GET method', () => {
    render(<Form {...formFixtures.withGetMethod} />);
    
    const form = screen.getByRole('form');
    expect(form).toHaveAttribute('method', 'GET');
  });

  it('calls onSubmit when form is submitted', () => {
    const mockOnSubmit = jest.fn();
    render(<Form {...formFixtures.default} onSubmit={mockOnSubmit} />);
    
    const form = screen.getByRole('form');
    fireEvent.submit(form);
    
    expect(mockOnSubmit).toHaveBeenCalled();
  });

  it('prevents default form submission when onSubmit is provided', () => {
    const mockOnSubmit = jest.fn();
    render(<Form {...formFixtures.default} onSubmit={mockOnSubmit} />);
    
    const form = screen.getByRole('form');
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    const preventDefaultSpy = jest.spyOn(submitEvent, 'preventDefault');
    
    fireEvent(form, submitEvent);
    
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(<Form {...formFixtures.default} className="custom-form" />);
    
    const form = screen.getByRole('form');
    expect(form).toHaveClass('custom-form');
  });

  it('applies custom style', () => {
    const customStyle = { border: '2px solid red' };
    render(<Form {...formFixtures.default} style={customStyle} />);
    
    const form = screen.getByRole('form');
    expect(form).toHaveStyle('border: 2px solid red');
  });

  it('renders with correct method attribute', () => {
    render(<Form {...formFixtures.default} method="PUT" />);
    
    const form = screen.getByRole('form');
    expect(form).toHaveAttribute('method', 'PUT');
  });

  it('renders with correct action attribute', () => {
    render(<Form {...formFixtures.default} action="/custom-action" />);
    
    const form = screen.getByRole('form');
    expect(form).toHaveAttribute('action', '/custom-action');
  });

  it('renders with correct encType attribute', () => {
    render(<Form {...formFixtures.default} encType="multipart/form-data" />);
    
    const form = screen.getByRole('form');
    expect(form).toHaveAttribute('enctype', 'multipart/form-data');
  });
});
