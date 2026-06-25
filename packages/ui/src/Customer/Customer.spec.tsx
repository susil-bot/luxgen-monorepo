import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CustomerCreateForm } from './CustomerCreateForm';
import { CustomerEditForm } from './CustomerEditForm';

describe('CustomerCreateForm', () => {
  const baseProps = {
    firstName: '',
    lastName: '',
    email: '',
    onFirstNameChange: jest.fn(),
    onLastNameChange: jest.fn(),
    onEmailChange: jest.fn(),
    onSave: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it('renders first name, last name, and email fields', () => {
    render(<CustomerCreateForm {...baseProps} />);
    expect(screen.getByLabelText('First name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('shows "New customer" title when name is empty', () => {
    render(<CustomerCreateForm {...baseProps} />);
    expect(screen.getByText('New customer')).toBeInTheDocument();
  });

  it('shows composed name as title when first and last name are set', () => {
    render(<CustomerCreateForm {...baseProps} firstName="Jane" lastName="Smith" />);
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('calls onFirstNameChange when first name input changes', () => {
    render(<CustomerCreateForm {...baseProps} />);
    fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'Jane' } });
    expect(baseProps.onFirstNameChange).toHaveBeenCalledWith('Jane');
  });

  it('calls onLastNameChange when last name input changes', () => {
    render(<CustomerCreateForm {...baseProps} />);
    fireEvent.change(screen.getByLabelText('Last name'), { target: { value: 'Smith' } });
    expect(baseProps.onLastNameChange).toHaveBeenCalledWith('Smith');
  });

  it('calls onEmailChange when email input changes', () => {
    render(<CustomerCreateForm {...baseProps} />);
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'jane@example.com' } });
    expect(baseProps.onEmailChange).toHaveBeenCalledWith('jane@example.com');
  });

  it('calls onSave when save button is clicked', () => {
    render(<CustomerCreateForm {...baseProps} saveLabel="Save customer" />);
    fireEvent.click(screen.getByRole('button', { name: 'Save customer' }));
    expect(baseProps.onSave).toHaveBeenCalledTimes(1);
  });

  it('disables save button when saving=true and shows saving label', () => {
    render(<CustomerCreateForm {...baseProps} saving savingLabel="Saving…" />);
    const btn = screen.getByRole('button', { name: 'Saving…' });
    expect(btn).toBeDisabled();
  });

  it('renders custom saveLabel', () => {
    render(<CustomerCreateForm {...baseProps} saveLabel="Create learner" />);
    expect(screen.getByRole('button', { name: 'Create learner' })).toBeInTheDocument();
  });

  it('renders the back link with default href', () => {
    render(<CustomerCreateForm {...baseProps} />);
    const backLink = screen.getByRole('link', { name: /customers/i });
    expect(backLink).toHaveAttribute('href', '/admin/customers');
  });

  it('renders a custom backHref', () => {
    render(<CustomerCreateForm {...baseProps} backHref="/portal/customers" />);
    const backLink = screen.getByRole('link', { name: /customers/i });
    expect(backLink).toHaveAttribute('href', '/portal/customers');
  });
});

describe('CustomerEditForm', () => {
  const baseProps = {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@example.com',
    onFirstNameChange: jest.fn(),
    onLastNameChange: jest.fn(),
    onEmailChange: jest.fn(),
    onSave: jest.fn(),
  };

  const allHandlers = {
    onPhoneChange: jest.fn(),
    onMarketingEmailChange: jest.fn(),
    onMarketingSmsChange: jest.fn(),
    onMarketingWhatsappChange: jest.fn(),
    onStaffNotesChange: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it('renders core customer detail fields', () => {
    render(<CustomerEditForm {...baseProps} />);
    expect(screen.getByLabelText('First name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('renders phone field only when onPhoneChange is provided', () => {
    const { rerender } = render(<CustomerEditForm {...baseProps} />);
    expect(screen.queryByLabelText('Phone')).not.toBeInTheDocument();
    rerender(<CustomerEditForm {...baseProps} onPhoneChange={allHandlers.onPhoneChange} />);
    expect(screen.getByLabelText('Phone')).toBeInTheDocument();
  });

  it('renders staff notes textarea only when onStaffNotesChange is provided', () => {
    const { rerender } = render(<CustomerEditForm {...baseProps} />);
    expect(screen.queryByPlaceholderText(/internal notes/i)).not.toBeInTheDocument();
    rerender(<CustomerEditForm {...baseProps} onStaffNotesChange={allHandlers.onStaffNotesChange} />);
    expect(screen.getByPlaceholderText(/internal notes/i)).toBeInTheDocument();
  });

  it('renders three marketing checkboxes when all handlers are provided', () => {
    render(<CustomerEditForm {...baseProps} {...allHandlers} />);
    expect(screen.getAllByRole('checkbox')).toHaveLength(3);
  });

  it('calls onPhoneChange when phone input changes', () => {
    render(<CustomerEditForm {...baseProps} onPhoneChange={allHandlers.onPhoneChange} />);
    fireEvent.change(screen.getByLabelText('Phone'), { target: { value: '+91 9000000000' } });
    expect(allHandlers.onPhoneChange).toHaveBeenCalledWith('+91 9000000000');
  });

  it('calls onStaffNotesChange when notes textarea changes', () => {
    render(<CustomerEditForm {...baseProps} onStaffNotesChange={allHandlers.onStaffNotesChange} />);
    fireEvent.change(screen.getByPlaceholderText(/internal notes/i), { target: { value: 'VIP learner' } });
    expect(allHandlers.onStaffNotesChange).toHaveBeenCalledWith('VIP learner');
  });

  it('calls onMarketingEmailChange when email checkbox changes', () => {
    render(<CustomerEditForm {...baseProps} {...allHandlers} marketingEmail={false} />);
    const [emailCheckbox] = screen.getAllByRole('checkbox');
    fireEvent.click(emailCheckbox);
    expect(allHandlers.onMarketingEmailChange).toHaveBeenCalledWith(true);
  });

  it('shows initials avatar from first and last name', () => {
    render(<CustomerEditForm {...baseProps} />);
    expect(screen.getByText('JS')).toBeInTheDocument();
  });

  it('shows save button with correct label and disables when saving', () => {
    render(<CustomerEditForm {...baseProps} saving savingLabel="Saving…" />);
    expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled();
  });
});
