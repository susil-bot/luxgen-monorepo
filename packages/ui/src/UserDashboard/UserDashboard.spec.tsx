import React from 'react';
import { render, screen } from '@testing-library/react';
import { UserDashboard } from './UserDashboard';

describe('UserDashboard', () => {
  it('renders the default title', () => {
    render(<UserDashboard />);
    expect(screen.getByText('Welcome to Ideavibes')).toBeInTheDocument();
  });

  it('renders a custom title', () => {
    render(<UserDashboard title="My Learning Hub" />);
    expect(screen.getByText('My Learning Hub')).toBeInTheDocument();
  });

  it('renders the subtitle when provided', () => {
    render(<UserDashboard subtitle="Your progress" />);
    expect(screen.getByText('Your progress')).toBeInTheDocument();
  });

  it('renders without crashing with default props', () => {
    const { container } = render(<UserDashboard />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
