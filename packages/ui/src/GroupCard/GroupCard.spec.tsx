import React from 'react';
import { render, screen } from '@testing-library/react';
import { GroupCard } from './GroupCard';

const sampleGroup = {
  id: 'g1',
  name: 'Engineering Team',
  description: 'Core engineering group',
  color: '#3B82F6',
  icon: '🛠',
  memberCount: 12,
  isActive: true,
  settings: { trainingEnabled: true, nudgeEnabled: true, reportingEnabled: false },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-06-01T00:00:00Z',
};

describe('GroupCard', () => {
  const baseProps = {
    group: sampleGroup,
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    onViewMembers: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it('renders the group name', () => {
    render(<GroupCard {...baseProps} />);
    expect(screen.getByText('Engineering Team')).toBeInTheDocument();
  });

  it('renders the group description', () => {
    render(<GroupCard {...baseProps} />);
    expect(screen.getByText('Core engineering group')).toBeInTheDocument();
  });

  it('renders the active badge for an active group', () => {
    render(<GroupCard {...baseProps} />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders the inactive badge for an inactive group', () => {
    render(<GroupCard {...baseProps} group={{ ...sampleGroup, isActive: false }} />);
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('renders member count in the stats section', () => {
    render(<GroupCard {...baseProps} showStats />);
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('Members')).toBeInTheDocument();
  });

  it('does not render stats when showStats=false', () => {
    render(<GroupCard {...baseProps} showStats={false} />);
    expect(screen.queryByText('Members')).not.toBeInTheDocument();
  });
});
