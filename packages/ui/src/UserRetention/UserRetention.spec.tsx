import React from 'react';
import { render, screen } from '@testing-library/react';
import { UserRetention } from './UserRetention';

const sampleData = [
  { date: '2024-01', value: 85, label: 'January' },
  { date: '2024-02', value: 88, label: 'February' },
  { date: '2024-03', value: 92, label: 'March' },
];

describe('UserRetention', () => {
  it('renders the default title', () => {
    render(<UserRetention data={sampleData} />);
    expect(screen.getByText('User Retention Trends')).toBeInTheDocument();
  });

  it('renders a custom title', () => {
    render(<UserRetention data={sampleData} title="Monthly Retention" />);
    expect(screen.getByText('Monthly Retention')).toBeInTheDocument();
  });

  it('renders without crashing when data is empty', () => {
    render(<UserRetention data={[]} />);
    expect(screen.getByText('User Retention Trends')).toBeInTheDocument();
  });

  it('renders without crashing with default props', () => {
    const { container } = render(<UserRetention data={sampleData} />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
