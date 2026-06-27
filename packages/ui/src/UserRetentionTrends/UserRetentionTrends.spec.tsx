import React from 'react';
import { render, screen } from '@testing-library/react';
import { UserRetentionTrends } from './UserRetentionTrends';

const sampleData = [
  { date: '2024-01', value: 85, label: 'January' },
  { date: '2024-02', value: 88, label: 'February' },
  { date: '2024-03', value: 92, label: 'March' },
];

describe('UserRetentionTrends', () => {
  it('renders the default title', () => {
    render(<UserRetentionTrends data={sampleData} />);
    expect(screen.getByText('User Retention Trends')).toBeInTheDocument();
  });

  it('renders a custom title', () => {
    render(<UserRetentionTrends data={sampleData} title="Retention Rate" />);
    expect(screen.getByText('Retention Rate')).toBeInTheDocument();
  });

  it('renders without crashing when data is empty', () => {
    render(<UserRetentionTrends data={[]} />);
    expect(screen.getByText('User Retention Trends')).toBeInTheDocument();
  });
});
