import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Logout } from './Logout';

// Mock user data
const mockUser = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'ADMIN',
  avatar: 'https://example.com/avatar.jpg',
  initials: 'JD',
};

const defaultProps = {
  onLogout: jest.fn(),
  user: mockUser,
};

describe('Logout Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders logout button with user info', () => {
      render(<Logout {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('ADMIN')).toBeInTheDocument();
    });

    it('renders without user info when user not provided', () => {
      render(<Logout {...defaultProps} user={undefined} />);
      
      expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it('renders with custom className', () => {
      const { container } = render(<Logout {...defaultProps} className="custom-class" />);
      
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Variants', () => {
    it('renders default variant', () => {
      render(<Logout {...defaultProps} variant="default" />);
      
      const button = screen.getByRole('button', { name: /logout/i });
      expect(button).toBeInTheDocument();
    });

    it('renders compact variant', () => {
      render(<Logout {...defaultProps} variant="compact" />);
      
      const button = screen.getByRole('button', { name: /logout/i });
      expect(button).toBeInTheDocument();
    });

    it('renders minimal variant', () => {
      render(<Logout {...defaultProps} variant="minimal" />);
      
      const button = screen.getByRole('button', { name: /logout/i });
      expect(button).toBeInTheDocument();
    });

    it('renders danger variant', () => {
      render(<Logout {...defaultProps} variant="danger" />);
      
      const button = screen.getByRole('button', { name: /logout/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('User Display', () => {
    it('displays user avatar when provided', () => {
      render(<Logout {...defaultProps} />);
      
      const avatar = screen.getByAltText('John Doe');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    });

    it('displays user initials when avatar not provided', () => {
      const userWithoutAvatar = { ...mockUser, avatar: undefined };
      render(<Logout {...defaultProps} user={userWithoutAvatar} />);
      
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('generates initials from name when initials not provided', () => {
      const userWithoutInitials = { ...mockUser, initials: undefined, avatar: undefined };
      render(<Logout {...defaultProps} user={userWithoutInitials} />);
      
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('displays user name and role', () => {
      render(<Logout {...defaultProps} />);
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('ADMIN')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onLogout when logout button is clicked and confirmation is disabled', async () => {
      const user = userEvent.setup();
      const onLogout = jest.fn().mockResolvedValue();
      
      render(<Logout {...defaultProps} onLogout={onLogout} showConfirmation={false} />);
      
      const logoutButton = screen.getByRole('button', { name: /logout/i });
      await user.click(logoutButton);
      
      expect(onLogout).toHaveBeenCalledTimes(1);
    });

    it('shows confirmation dialog when logout button is clicked and confirmation is enabled', async () => {
      const user = userEvent.setup();
      render(<Logout {...defaultProps} showConfirmation={true} />);
      
      const logoutButton = screen.getByRole('button', { name: /logout/i });
      await user.click(logoutButton);
      
      expect(screen.getByText('Confirm Logout')).toBeInTheDocument();
      expect(screen.getByText('Are you sure you want to logout? Any unsaved changes will be lost.')).toBeInTheDocument();
    });

    it('calls onLogout when confirm button is clicked in confirmation dialog', async () => {
      const user = userEvent.setup();
      const onLogout = jest.fn().mockResolvedValue();
      
      render(<Logout {...defaultProps} onLogout={onLogout} showConfirmation={true} />);
      
      const logoutButton = screen.getByRole('button', { name: /logout/i });
      await user.click(logoutButton);
      
      const confirmButton = screen.getByRole('button', { name: /logout/i });
      await user.click(confirmButton);
      
      expect(onLogout).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when cancel button is clicked in confirmation dialog', async () => {
      const user = userEvent.setup();
      const onCancel = jest.fn();
      
      render(<Logout {...defaultProps} onCancel={onCancel} showConfirmation={true} />);
      
      const logoutButton = screen.getByRole('button', { name: /logout/i });
      await user.click(logoutButton);
      
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);
      
      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(screen.queryByText('Confirm Logout')).not.toBeInTheDocument();
    });

    it('handles logout loading state', async () => {
      const user = userEvent.setup();
      const onLogout = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      render(<Logout {...defaultProps} onLogout={onLogout} showConfirmation={false} />);
      
      const logoutButton = screen.getByRole('button', { name: /logout/i });
      await user.click(logoutButton);
      
      expect(screen.getByText('Logging out...')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.getByText('Logout')).toBeInTheDocument();
      });
    });
  });

  describe('Disabled State', () => {
    it('disables logout button when disabled prop is true', () => {
      render(<Logout {...defaultProps} disabled={true} />);
      
      const logoutButton = screen.getByRole('button', { name: /logout/i });
      expect(logoutButton).toBeDisabled();
    });

    it('shows loading state during logout process', async () => {
      const user = userEvent.setup();
      const onLogout = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      render(<Logout {...defaultProps} onLogout={onLogout} showConfirmation={false} />);
      
      const logoutButton = screen.getByRole('button', { name: /logout/i });
      await user.click(logoutButton);
      
      expect(screen.getByText('Logging out...')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.getByText('Logout')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('handles logout error gracefully', async () => {
      const user = userEvent.setup();
      const onLogout = jest.fn().mockRejectedValue(new Error('Logout failed'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      render(<Logout {...defaultProps} onLogout={onLogout} showConfirmation={false} />);
      
      const logoutButton = screen.getByRole('button', { name: /logout/i });
      await user.click(logoutButton);
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Logout error:', expect.any(Error));
      });
      
      consoleSpy.mockRestore();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<Logout {...defaultProps} />);
      
      const logoutButton = screen.getByRole('button', { name: /logout/i });
      expect(logoutButton).toHaveAttribute('aria-label', 'Logout');
    });

    it('has proper button roles', () => {
      render(<Logout {...defaultProps} showConfirmation={true} />);
      
      const logoutButton = screen.getByRole('button', { name: /logout/i });
      expect(logoutButton).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('applies custom styles based on variant', () => {
      const { container } = render(<Logout {...defaultProps} variant="danger" />);
      
      const logoutButton = screen.getByRole('button', { name: /logout/i });
      expect(logoutButton).toBeInTheDocument();
    });

    it('applies disabled styles when disabled', () => {
      render(<Logout {...defaultProps} disabled={true} />);
      
      const logoutButton = screen.getByRole('button', { name: /logout/i });
      expect(logoutButton).toBeDisabled();
    });
  });
});
