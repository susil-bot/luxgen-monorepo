import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RecentActivities } from './RecentActivities';

const activities = [
  {
    id: 'a1',
    user: { name: 'Jane Doe', initials: 'JD' },
    action: 'completed a course',
    time: '2 min ago',
    status: 'online' as const,
  },
  {
    id: 'a2',
    user: { name: 'Bob Lee', initials: 'BL' },
    action: 'submitted a quiz',
    time: '5 min ago',
    status: 'offline' as const,
  },
];

describe('RecentActivities', () => {
  it('renders the default title', () => {
    render(<RecentActivities activities={activities} />);
    expect(screen.getByText('Recent Activities')).toBeInTheDocument();
  });

  it('renders activity user names', () => {
    render(<RecentActivities activities={activities} />);
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('Bob Lee')).toBeInTheDocument();
  });

  it('renders activity action text', () => {
    render(<RecentActivities activities={activities} />);
    expect(screen.getByText('completed a course')).toBeInTheDocument();
    expect(screen.getByText('submitted a quiz')).toBeInTheDocument();
  });

  it('renders without crashing with empty activities', () => {
    render(<RecentActivities activities={[]} />);
    expect(screen.getByText('Recent Activities')).toBeInTheDocument();
  });

  it('calls onActivityClick when an activity is clicked', () => {
    const onActivityClick = jest.fn();
    render(<RecentActivities activities={activities} onActivityClick={onActivityClick} />);
    fireEvent.click(screen.getByText('Jane Doe'));
    expect(onActivityClick).toHaveBeenCalledWith(expect.objectContaining({ id: 'a1' }));
  });
});
