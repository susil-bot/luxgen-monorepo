import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EngagementBreakdown } from './EngagementBreakdown';

const sampleData = [
  { id: 'videos', label: 'Videos', value: 450, color: '#3B82F6', percentage: 45 },
  { id: 'quizzes', label: 'Quizzes', value: 300, color: '#10B981', percentage: 30 },
  { id: 'readings', label: 'Readings', value: 250, color: '#F59E0B', percentage: 25 },
];

describe('EngagementBreakdown', () => {
  it('renders the default title', () => {
    render(<EngagementBreakdown data={sampleData} />);
    expect(screen.getByText('Engagement Breakdown')).toBeInTheDocument();
  });

  it('renders a custom title', () => {
    render(<EngagementBreakdown data={sampleData} title="Content Breakdown" />);
    expect(screen.getByText('Content Breakdown')).toBeInTheDocument();
  });

  it('renders segment labels in the legend', () => {
    render(<EngagementBreakdown data={sampleData} showLegend />);
    expect(screen.getByText('Videos')).toBeInTheDocument();
    expect(screen.getByText('Quizzes')).toBeInTheDocument();
    expect(screen.getByText('Readings')).toBeInTheDocument();
  });

  it('renders percentage values when showPercentages=true', () => {
    render(<EngagementBreakdown data={sampleData} showPercentages />);
    expect(screen.getByText('45%')).toBeInTheDocument();
    expect(screen.getByText('30%')).toBeInTheDocument();
  });

  it('calls onSegmentClick when a legend item is clicked', () => {
    const onSegmentClick = jest.fn();
    render(<EngagementBreakdown data={sampleData} onSegmentClick={onSegmentClick} />);
    fireEvent.click(screen.getByText('Videos'));
    expect(onSegmentClick).toHaveBeenCalledWith(expect.objectContaining({ id: 'videos' }));
  });

  it('renders with empty data without crashing', () => {
    render(<EngagementBreakdown data={[]} />);
    expect(screen.getByText('Engagement Breakdown')).toBeInTheDocument();
  });
});
