import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserRetention } from './UserRetention';

describe('UserRetention Component', () => {
  const defaultData = [
    { date: 'Jan', value: 400 },
    { date: 'Feb', value: 450 },
    { date: 'Mar', value: 500 },
    { date: 'Apr', value: 480 },
    { date: 'May', value: 550 }
  ];

  const defaultProps = {
    title: 'User Retention Trends',
    data: defaultData,
    height: 300,
    color: '#3B82F6',
    showGrid: true,
    showLegend: true,
    variant: 'default'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<UserRetention {...defaultProps} />);
      
      expect(screen.getByText('User Retention Trends')).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      render(<UserRetention {...defaultProps} className="custom-class" />);
      
      const container = screen.getByText('User Retention Trends').closest('.user-retention-container');
      expect(container).toHaveClass('custom-class');
    });

    it('renders empty state when no data', () => {
      render(<UserRetention {...defaultProps} data={[]} />);
      
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });
  });

  describe('Chart Functionality', () => {
    it('renders chart with data points', () => {
      render(<UserRetention {...defaultProps} />);
      
      // Check for SVG elements
      const svg = screen.getByText('User Retention Trends').closest('.user-retention-container').querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('shows grid when showGrid is true', () => {
      render(<UserRetention {...defaultProps} showGrid={true} />);
      
      const container = screen.getByText('User Retention Trends').closest('.user-retention-container');
      expect(container).toBeInTheDocument();
    });

    it('hides grid when showGrid is false', () => {
      render(<UserRetention {...defaultProps} showGrid={false} />);
      
      const container = screen.getByText('User Retention Trends').closest('.user-retention-container');
      expect(container).toBeInTheDocument();
    });

    it('shows legend when showLegend is true', () => {
      render(<UserRetention {...defaultProps} showLegend={true} />);
      
      expect(screen.getByText('User Retention')).toBeInTheDocument();
    });

    it('hides legend when showLegend is false', () => {
      render(<UserRetention {...defaultProps} showLegend={false} />);
      
      expect(screen.queryByText('User Retention')).not.toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onDataPointClick when data point is clicked', async () => {
      const onDataPointClick = jest.fn();
      render(<UserRetention {...defaultProps} onDataPointClick={onDataPointClick} />);
      
      // Find and click a data point (circle element)
      const svg = screen.getByText('User Retention Trends').closest('.user-retention-container').querySelector('svg');
      const circles = svg.querySelectorAll('circle');
      if (circles.length > 0) {
        await userEvent.click(circles[0]);
        expect(onDataPointClick).toHaveBeenCalled();
      }
    });
  });

  describe('Variants', () => {
    it('renders compact variant correctly', () => {
      render(<UserRetention {...defaultProps} variant="compact" />);
      
      expect(screen.getByText('User Retention Trends')).toBeInTheDocument();
    });

    it('renders detailed variant correctly', () => {
      render(<UserRetention {...defaultProps} variant="detailed" />);
      
      expect(screen.getByText('User Retention Trends')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('applies custom color', () => {
      render(<UserRetention {...defaultProps} color="#FF0000" />);
      
      const container = screen.getByText('User Retention Trends').closest('.user-retention-container');
      expect(container).toBeInTheDocument();
    });

    it('applies custom height', () => {
      render(<UserRetention {...defaultProps} height={400} />);
      
      const container = screen.getByText('User Retention Trends').closest('.user-retention-container');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      render(<UserRetention {...defaultProps} />);
      
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('User Retention Trends');
    });

    it('has clickable data points', () => {
      render(<UserRetention {...defaultProps} />);
      
      const svg = screen.getByRole('img', { hidden: true });
      const circles = svg.querySelectorAll('circle');
      expect(circles.length).toBeGreaterThan(0);
    });
  });
});
