import React from 'react';
import { render, screen } from '@testing-library/react';
import { LastSurvey } from './LastSurvey';

const sampleSurvey = {
  id: 's1',
  title: 'Q4 Employee Feedback',
  status: 'active' as const,
  progress: 65,
  totalResponses: 130,
  targetResponses: 200,
  createdAt: '2024-01-01T00:00:00Z',
};

describe('LastSurvey', () => {
  const baseProps = {
    survey: sampleSurvey,
    onViewSurvey: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it('renders the default title', () => {
    render(<LastSurvey {...baseProps} />);
    expect(screen.getByText('Last Survey')).toBeInTheDocument();
  });

  it('renders the survey title', () => {
    render(<LastSurvey {...baseProps} />);
    expect(screen.getByText('Q4 Employee Feedback')).toBeInTheDocument();
  });

  it('renders total responses count', () => {
    render(<LastSurvey {...baseProps} />);
    expect(screen.getByText(/130.*responses/)).toBeInTheDocument();
  });

  it('renders without crashing with minimal props', () => {
    const { container } = render(<LastSurvey survey={sampleSurvey} />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
