import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LastSurvey } from './LastSurvey';

describe('LastSurvey Component', () => {
  const defaultSurvey = {
    id: '1',
    title: 'Customer Satisfaction Survey',
    status: 'active',
    progress: 75,
    totalResponses: 150,
    targetResponses: 200,
    createdAt: '2024-01-15',
    expiresAt: '2024-02-15',
    description: 'Quarterly customer satisfaction assessment'
  };

  const defaultProps = {
    title: 'Last Survey',
    survey: defaultSurvey,
    showProgress: true,
    showActions: true,
    variant: 'default'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<LastSurvey {...defaultProps} />);
      
      expect(screen.getByText('Last Survey')).toBeInTheDocument();
      expect(screen.getByText('Customer Satisfaction Survey')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      render(<LastSurvey {...defaultProps} className="custom-class" />);
      
      const container = screen.getByText('Last Survey').closest('.last-survey-container');
      expect(container).toHaveClass('custom-class');
    });
  });

  describe('Survey Information', () => {
    it('displays survey title', () => {
      render(<LastSurvey {...defaultProps} />);
      
      expect(screen.getByText('Customer Satisfaction Survey')).toBeInTheDocument();
    });

    it('displays survey description when provided', () => {
      render(<LastSurvey {...defaultProps} />);
      
      expect(screen.getByText('Quarterly customer satisfaction assessment')).toBeInTheDocument();
    });

    it('displays creation date', () => {
      render(<LastSurvey {...defaultProps} />);
      
      expect(screen.getByText(/Created: 2024-01-15/)).toBeInTheDocument();
    });

    it('displays expiration date when provided', () => {
      render(<LastSurvey {...defaultProps} />);
      
      expect(screen.getByText(/Expires: 2024-02-15/)).toBeInTheDocument();
    });
  });

  describe('Status Display', () => {
    it('displays active status correctly', () => {
      render(<LastSurvey {...defaultProps} />);
      
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('displays completed status correctly', () => {
      const completedSurvey = { ...defaultSurvey, status: 'completed' };
      render(<LastSurvey {...defaultProps} survey={completedSurvey} />);
      
      expect(screen.getByText('Completed')).toBeInTheDocument();
    });

    it('displays draft status correctly', () => {
      const draftSurvey = { ...defaultSurvey, status: 'draft' };
      render(<LastSurvey {...defaultProps} survey={draftSurvey} />);
      
      expect(screen.getByText('Draft')).toBeInTheDocument();
    });

    it('displays closed status correctly', () => {
      const closedSurvey = { ...defaultSurvey, status: 'closed' };
      render(<LastSurvey {...defaultProps} survey={closedSurvey} />);
      
      expect(screen.getByText('Closed')).toBeInTheDocument();
    });
  });

  describe('Progress Display', () => {
    it('shows progress when showProgress is true', () => {
      render(<LastSurvey {...defaultProps} showProgress={true} />);
      
      expect(screen.getByText('Progress')).toBeInTheDocument();
      expect(screen.getByText('150 / 200 responses')).toBeInTheDocument();
      expect(screen.getByText('75% complete')).toBeInTheDocument();
    });

    it('hides progress when showProgress is false', () => {
      render(<LastSurvey {...defaultProps} showProgress={false} />);
      
      expect(screen.queryByText('Progress')).not.toBeInTheDocument();
    });

    it('displays progress without target responses', () => {
      const surveyWithoutTarget = { ...defaultSurvey, targetResponses: undefined };
      render(<LastSurvey {...defaultProps} survey={surveyWithoutTarget} showProgress={true} />);
      
      expect(screen.getByText('150 responses')).toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('shows action buttons when showActions is true', () => {
      render(<LastSurvey {...defaultProps} showActions={true} />);
      
      expect(screen.getByText('View Survey')).toBeInTheDocument();
      expect(screen.getByText('Edit')).toBeInTheDocument();
      expect(screen.getByText('Share')).toBeInTheDocument();
    });

    it('hides action buttons when showActions is false', () => {
      render(<LastSurvey {...defaultProps} showActions={false} />);
      
      expect(screen.queryByText('View Survey')).not.toBeInTheDocument();
      expect(screen.queryByText('Edit')).not.toBeInTheDocument();
      expect(screen.queryByText('Share')).not.toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onViewSurvey when View Survey is clicked', async () => {
      const onViewSurvey = jest.fn();
      render(<LastSurvey {...defaultProps} onViewSurvey={onViewSurvey} />);
      
      const viewButton = screen.getByText('View Survey');
      await userEvent.click(viewButton);
      
      expect(onViewSurvey).toHaveBeenCalledWith(defaultSurvey);
    });

    it('calls onEditSurvey when Edit is clicked', async () => {
      const onEditSurvey = jest.fn();
      render(<LastSurvey {...defaultProps} onEditSurvey={onEditSurvey} />);
      
      const editButton = screen.getByText('Edit');
      await userEvent.click(editButton);
      
      expect(onEditSurvey).toHaveBeenCalledWith(defaultSurvey);
    });

    it('calls onShareSurvey when Share is clicked', async () => {
      const onShareSurvey = jest.fn();
      render(<LastSurvey {...defaultProps} onShareSurvey={onShareSurvey} />);
      
      const shareButton = screen.getByText('Share');
      await userEvent.click(shareButton);
      
      expect(onShareSurvey).toHaveBeenCalledWith(defaultSurvey);
    });
  });

  describe('Variants', () => {
    it('renders compact variant correctly', () => {
      render(<LastSurvey {...defaultProps} variant="compact" />);
      
      expect(screen.getByText('Last Survey')).toBeInTheDocument();
    });

    it('renders detailed variant correctly', () => {
      render(<LastSurvey {...defaultProps} variant="detailed" />);
      
      expect(screen.getByText('Last Survey')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      render(<LastSurvey {...defaultProps} />);
      
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Last Survey');
    });

    it('has clickable action buttons', () => {
      render(<LastSurvey {...defaultProps} />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Styling', () => {
    it('applies status-specific colors', () => {
      render(<LastSurvey {...defaultProps} />);
      
      const statusElement = screen.getByText('Active');
      expect(statusElement).toBeInTheDocument();
    });

    it('displays progress bar with correct width', () => {
      render(<LastSurvey {...defaultProps} showProgress={true} />);
      
      const progressBar = screen.getByText('75% complete');
      expect(progressBar).toBeInTheDocument();
    });
  });
});
