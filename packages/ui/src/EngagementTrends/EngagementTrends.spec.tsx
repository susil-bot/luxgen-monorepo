import React from 'react';
import { render, screen } from '@testing-library/react';
import { EngagementTrends } from './EngagementTrends';

const sampleData = [
  { label: 'Jan', interactions: 120, completions: 80 },
  { label: 'Feb', interactions: 150, completions: 100 },
  { label: 'Mar', interactions: 200, completions: 140 },
];

describe('EngagementTrends', () => {
  it('renders the default title', () => {
    render(<EngagementTrends data={sampleData} />);
    expect(screen.getByText('Engagement Trends')).toBeInTheDocument();
  });

  it('renders a custom title', () => {
    render(<EngagementTrends data={sampleData} title="Monthly Trends" />);
    expect(screen.getByText('Monthly Trends')).toBeInTheDocument();
  });

  it('renders data point labels in legend', () => {
    render(<EngagementTrends data={sampleData} />);
    expect(screen.getByText('Jan')).toBeInTheDocument();
    expect(screen.getByText('Feb')).toBeInTheDocument();
    expect(screen.getByText('Mar')).toBeInTheDocument();
  });

  it('renders without crashing when data is empty', () => {
    render(<EngagementTrends data={[]} />);
    expect(screen.getByText('Engagement Trends')).toBeInTheDocument();
  });
});
