import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GroupForm } from './GroupForm';

describe('GroupForm', () => {
  const baseProps = {
    onSubmit: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it('renders the default title', () => {
    render(<GroupForm {...baseProps} />);
    expect(screen.getByRole('heading', { name: 'Create Group' })).toBeInTheDocument();
  });

  it('renders a custom title', () => {
    render(<GroupForm {...baseProps} title="Edit Group" />);
    expect(screen.getByText('Edit Group')).toBeInTheDocument();
  });

  it('renders the group name input', () => {
    render(<GroupForm {...baseProps} />);
    expect(screen.getByPlaceholderText('Enter group name')).toBeInTheDocument();
  });

  it('renders the description textarea', () => {
    render(<GroupForm {...baseProps} />);
    expect(screen.getByPlaceholderText('Enter group description')).toBeInTheDocument();
  });

  it('renders the submit button with default label', () => {
    render(<GroupForm {...baseProps} />);
    expect(screen.getByRole('button', { name: 'Create Group' })).toBeInTheDocument();
  });

  it('renders a custom submit label', () => {
    render(<GroupForm {...baseProps} submitText="Save group" />);
    expect(screen.getByRole('button', { name: 'Save group' })).toBeInTheDocument();
  });

  it('renders the cancel button when onCancel is provided', () => {
    render(<GroupForm {...baseProps} />);
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(<GroupForm {...baseProps} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(baseProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('shows validation error when submitting with empty group name', async () => {
    const { container } = render(<GroupForm {...baseProps} />);
    fireEvent.submit(container.querySelector('form')!);
    await waitFor(() => {
      expect(screen.getByText('Group name is required')).toBeInTheDocument();
    });
    expect(baseProps.onSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with form data when name is provided', async () => {
    render(<GroupForm {...baseProps} />);
    fireEvent.change(screen.getByPlaceholderText('Enter group name'), { target: { value: 'Engineering' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Group' }));
    await waitFor(() => {
      expect(baseProps.onSubmit).toHaveBeenCalledWith(expect.objectContaining({ name: 'Engineering' }));
    });
  });

  it('pre-fills fields from initialData', () => {
    render(<GroupForm {...baseProps} initialData={{ name: 'Design Team', description: 'Creative folks' }} />);
    expect(screen.getByPlaceholderText('Enter group name')).toHaveValue('Design Team');
    expect(screen.getByPlaceholderText('Enter group description')).toHaveValue('Creative folks');
  });

  it('disables buttons when loading=true', () => {
    render(<GroupForm {...baseProps} loading />);
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  });

  it('renders settings checkboxes', () => {
    render(<GroupForm {...baseProps} />);
    expect(screen.getByLabelText('Allow self-join')).toBeInTheDocument();
    expect(screen.getByLabelText('Require approval for new members')).toBeInTheDocument();
  });

  it('renders color picker buttons', () => {
    render(<GroupForm {...baseProps} />);
    expect(screen.getByTitle('Blue')).toBeInTheDocument();
    expect(screen.getByTitle('Green')).toBeInTheDocument();
  });
});
