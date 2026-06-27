import React from 'react';
import { render, screen } from '@testing-library/react';
import { AdminDashboard } from './AdminDashboard';

describe('AdminDashboard', () => {
  it('renders the default title', () => {
    render(<AdminDashboard />);
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
  });

  it('renders a custom title', () => {
    render(<AdminDashboard title="My Dashboard" />);
    expect(screen.getByText('My Dashboard')).toBeInTheDocument();
  });

  it('renders the subtitle when provided', () => {
    render(<AdminDashboard subtitle="Welcome back" />);
    expect(screen.getByText('Welcome back')).toBeInTheDocument();
  });

  it('renders without crashing with default props', () => {
    const { container } = render(<AdminDashboard />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
