import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Logout } from './Logout';

describe('Logout', () => {
  const baseProps = {
    onLogout: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it('renders the logout button', () => {
    render(<Logout {...baseProps} />);
    expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument();
  });

  it('shows confirmation dialog when showConfirmation=true and button is clicked', () => {
    render(<Logout {...baseProps} showConfirmation />);
    fireEvent.click(screen.getByRole('button', { name: 'Logout' }));
    expect(screen.getByText('Confirm Logout')).toBeInTheDocument();
  });

  it('calls onLogout when confirmed', () => {
    render(<Logout {...baseProps} showConfirmation />);
    fireEvent.click(screen.getByRole('button', { name: 'Logout' }));
    // After clicking, the confirmation dialog replaces the main button with Cancel + Logout confirm
    fireEvent.click(screen.getByRole('button', { name: 'Logout' }));
    expect(baseProps.onLogout).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when cancel button is clicked in confirmation', () => {
    render(<Logout {...baseProps} showConfirmation />);
    fireEvent.click(screen.getByRole('button', { name: 'Logout' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(baseProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('renders without crashing with minimal props', () => {
    const { container } = render(<Logout onLogout={jest.fn()} />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
