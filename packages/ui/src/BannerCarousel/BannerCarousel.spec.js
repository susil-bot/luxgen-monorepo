import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BannerCarousel } from './BannerCarousel';

// Mock the Arrow component
jest.mock('../Arrow', () => ({
  Arrow: ({ direction, onClick, 'aria-label': ariaLabel }) => (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      data-testid={`arrow-${direction}`}
    >
      {direction} arrow
    </button>
  ),
}));

describe('BannerCarousel Component', () => {
  const mockSlides = [
    {
      id: '1',
      title: 'First Slide',
      subtitle: 'First Subtitle',
      description: 'First description',
      date: '2024-01-01',
      ctaText: 'Get Started',
      backgroundColor: '#4A70F7',
      textColor: '#FFFFFF',
      ctaColor: '#F78C4A',
    },
    {
      id: '2',
      title: 'Second Slide',
      subtitle: 'Second Subtitle',
      description: 'Second description',
      date: '2024-01-02',
      ctaText: 'Learn More',
      backgroundColor: '#10B981',
      textColor: '#FFFFFF',
      ctaColor: '#F59E0B',
    },
    {
      id: '3',
      title: 'Third Slide',
      backgroundColor: '#8B5CF6',
    },
  ];

  const defaultProps = {
    slides: mockSlides,
    onSlideChange: jest.fn(),
    onCtaClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<BannerCarousel {...defaultProps} />);
      
      expect(screen.getByText('First Slide')).toBeInTheDocument();
      expect(screen.getByText('First Subtitle')).toBeInTheDocument();
      expect(screen.getByText('First description')).toBeInTheDocument();
      expect(screen.getByText('2024-01-01')).toBeInTheDocument();
      expect(screen.getByText('Get Started')).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      render(<BannerCarousel {...defaultProps} className="custom-class" />);
      const carousel = screen.getByText('First Slide').closest('div');
      expect(carousel).toHaveClass('custom-class');
    });

    it('returns null when slides array is empty', () => {
      const { container } = render(<BannerCarousel slides={[]} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Auto-play', () => {
    it('starts auto-play by default', () => {
      render(<BannerCarousel {...defaultProps} />);
      
      // Fast-forward time to trigger auto-play
      jest.advanceTimersByTime(5000);
      
      expect(defaultProps.onSlideChange).toHaveBeenCalledWith(1);
    });

    it('respects autoPlay prop', () => {
      render(<BannerCarousel {...defaultProps} autoPlay={false} />);
      
      jest.advanceTimersByTime(10000);
      
      expect(defaultProps.onSlideChange).not.toHaveBeenCalled();
    });

    it('respects autoPlayInterval prop', () => {
      render(<BannerCarousel {...defaultProps} autoPlayInterval={2000} />);
      
      jest.advanceTimersByTime(2000);
      
      expect(defaultProps.onSlideChange).toHaveBeenCalledWith(1);
    });

    it('pauses auto-play when user interacts', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<BannerCarousel {...defaultProps} />);
      
      // Click on a dot to pause auto-play
      const dots = screen.getAllByLabelText(/Go to slide/);
      await user.click(dots[1]);
      
      // Fast-forward time - should not advance
      jest.advanceTimersByTime(10000);
      
      expect(defaultProps.onSlideChange).toHaveBeenCalledTimes(1);
    });
  });

  describe('Navigation', () => {
    it('renders navigation arrows when showArrows is true', () => {
      render(<BannerCarousel {...defaultProps} showArrows={true} />);
      
      expect(screen.getByTestId('arrow-left')).toBeInTheDocument();
      expect(screen.getByTestId('arrow-right')).toBeInTheDocument();
    });

    it('does not render arrows when showArrows is false', () => {
      render(<BannerCarousel {...defaultProps} showArrows={false} />);
      
      expect(screen.queryByTestId('arrow-left')).not.toBeInTheDocument();
      expect(screen.queryByTestId('arrow-right')).not.toBeInTheDocument();
    });

    it('does not render arrows when only one slide', () => {
      render(<BannerCarousel {...defaultProps} slides={[mockSlides[0]]} />);
      
      expect(screen.queryByTestId('arrow-left')).not.toBeInTheDocument();
      expect(screen.queryByTestId('arrow-right')).not.toBeInTheDocument();
    });

    it('navigates to previous slide', async () => {
      const user = userEvent.setup();
      render(<BannerCarousel {...defaultProps} />);
      
      // Go to second slide first
      const rightArrow = screen.getByTestId('arrow-right');
      await user.click(rightArrow);
      
      expect(defaultProps.onSlideChange).toHaveBeenCalledWith(1);
      
      // Go back to first slide
      const leftArrow = screen.getByTestId('arrow-left');
      await user.click(leftArrow);
      
      expect(defaultProps.onSlideChange).toHaveBeenCalledWith(0);
    });

    it('navigates to next slide', async () => {
      const user = userEvent.setup();
      render(<BannerCarousel {...defaultProps} />);
      
      const rightArrow = screen.getByTestId('arrow-right');
      await user.click(rightArrow);
      
      expect(defaultProps.onSlideChange).toHaveBeenCalledWith(1);
      expect(screen.getByText('Second Slide')).toBeInTheDocument();
    });

    it('wraps around from last to first slide', async () => {
      const user = userEvent.setup();
      render(<BannerCarousel {...defaultProps} />);
      
      // Go to last slide
      const rightArrow = screen.getByTestId('arrow-right');
      await user.click(rightArrow);
      await user.click(rightArrow);
      
      expect(defaultProps.onSlideChange).toHaveBeenCalledWith(2);
      expect(screen.getByText('Third Slide')).toBeInTheDocument();
      
      // Go to next (should wrap to first)
      await user.click(rightArrow);
      
      expect(defaultProps.onSlideChange).toHaveBeenCalledWith(0);
      expect(screen.getByText('First Slide')).toBeInTheDocument();
    });
  });

  describe('Dots Navigation', () => {
    it('renders dots when showDots is true', () => {
      render(<BannerCarousel {...defaultProps} showDots={true} />);
      
      const dots = screen.getAllByLabelText(/Go to slide/);
      expect(dots).toHaveLength(3);
    });

    it('does not render dots when showDots is false', () => {
      render(<BannerCarousel {...defaultProps} showDots={false} />);
      
      const dots = screen.queryAllByLabelText(/Go to slide/);
      expect(dots).toHaveLength(0);
    });

    it('does not render dots when only one slide', () => {
      render(<BannerCarousel {...defaultProps} slides={[mockSlides[0]]} />);
      
      const dots = screen.queryAllByLabelText(/Go to slide/);
      expect(dots).toHaveLength(0);
    });

    it('navigates to specific slide when dot is clicked', async () => {
      const user = userEvent.setup();
      render(<BannerCarousel {...defaultProps} />);
      
      const dots = screen.getAllByLabelText(/Go to slide/);
      await user.click(dots[2]); // Click third dot
      
      expect(defaultProps.onSlideChange).toHaveBeenCalledWith(2);
      expect(screen.getByText('Third Slide')).toBeInTheDocument();
    });

    it('highlights active dot', () => {
      render(<BannerCarousel {...defaultProps} />);
      
      const dots = screen.getAllByLabelText(/Go to slide/);
      expect(dots[0]).toHaveClass('bg-white', 'scale-125');
      expect(dots[1]).toHaveClass('bg-white/50');
      expect(dots[2]).toHaveClass('bg-white/50');
    });
  });

  describe('Play/Pause Button', () => {
    it('renders play/pause button when multiple slides', () => {
      render(<BannerCarousel {...defaultProps} />);
      
      expect(screen.getByLabelText('Pause carousel')).toBeInTheDocument();
    });

    it('does not render play/pause button when single slide', () => {
      render(<BannerCarousel {...defaultProps} slides={[mockSlides[0]]} />);
      
      expect(screen.queryByLabelText(/carousel/)).not.toBeInTheDocument();
    });

    it('toggles play/pause state', async () => {
      const user = userEvent.setup();
      render(<BannerCarousel {...defaultProps} />);
      
      const playPauseButton = screen.getByLabelText('Pause carousel');
      await user.click(playPauseButton);
      
      expect(screen.getByLabelText('Play carousel')).toBeInTheDocument();
    });
  });

  describe('CTA Button', () => {
    it('renders CTA button when ctaText is provided', () => {
      render(<BannerCarousel {...defaultProps} />);
      
      expect(screen.getByText('Get Started')).toBeInTheDocument();
    });

    it('does not render CTA button when ctaText is not provided', () => {
      const slidesWithoutCta = mockSlides.map(slide => ({ ...slide, ctaText: undefined }));
      render(<BannerCarousel {...defaultProps} slides={slidesWithoutCta} />);
      
      expect(screen.queryByText('Get Started')).not.toBeInTheDocument();
    });

    it('calls onCtaClick when CTA is clicked', async () => {
      const user = userEvent.setup();
      render(<BannerCarousel {...defaultProps} />);
      
      const ctaButton = screen.getByText('Get Started');
      await user.click(ctaButton);
      
      expect(defaultProps.onCtaClick).toHaveBeenCalledWith(mockSlides[0]);
    });

    it('calls slide ctaOnClick when provided', async () => {
      const user = userEvent.setup();
      const slideOnClick = jest.fn();
      const slidesWithOnClick = [
        { ...mockSlides[0], ctaOnClick: slideOnClick }
      ];
      
      render(<BannerCarousel {...defaultProps} slides={slidesWithOnClick} />);
      
      const ctaButton = screen.getByText('Get Started');
      await user.click(ctaButton);
      
      expect(slideOnClick).toHaveBeenCalled();
      expect(defaultProps.onCtaClick).toHaveBeenCalled();
    });
  });

  describe('Styling', () => {
    it('applies background color from slide data', () => {
      render(<BannerCarousel {...defaultProps} />);
      
      const banner = screen.getByText('First Slide').closest('div');
      expect(banner).toHaveStyle('background-color: #4A70F7');
    });

    it('applies text color from slide data', () => {
      render(<BannerCarousel {...defaultProps} />);
      
      const title = screen.getByText('First Slide');
      expect(title).toHaveStyle('color: #FFFFFF');
    });

    it('applies CTA color from slide data', () => {
      render(<BannerCarousel {...defaultProps} />);
      
      const ctaButton = screen.getByText('Get Started');
      expect(ctaButton).toHaveStyle('background-color: #F78C4A');
    });

    it('applies background image when provided', () => {
      const slidesWithImage = [
        { ...mockSlides[0], backgroundImage: '/test-image.jpg' }
      ];
      
      render(<BannerCarousel {...defaultProps} slides={slidesWithImage} />);
      
      const banner = screen.getByText('First Slide').closest('div');
      expect(banner).toHaveStyle('background-image: url(/test-image.jpg)');
    });
  });

  describe('Responsive Design', () => {
    it('applies responsive classes', () => {
      render(<BannerCarousel {...defaultProps} />);
      
      const banner = screen.getByText('First Slide').closest('div');
      expect(banner).toHaveClass('h-64', 'md:h-80', 'lg:h-96');
    });

    it('applies responsive text classes', () => {
      render(<BannerCarousel {...defaultProps} />);
      
      const title = screen.getByText('First Slide');
      expect(title).toHaveClass('text-2xl', 'md:text-3xl', 'lg:text-4xl');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for navigation', () => {
      render(<BannerCarousel {...defaultProps} />);
      
      expect(screen.getByLabelText('Previous slide')).toBeInTheDocument();
      expect(screen.getByLabelText('Next slide')).toBeInTheDocument();
    });

    it('has proper ARIA labels for dots', () => {
      render(<BannerCarousel {...defaultProps} />);
      
      const dots = screen.getAllByLabelText(/Go to slide/);
      expect(dots[0]).toHaveAttribute('aria-label', 'Go to slide 1');
      expect(dots[1]).toHaveAttribute('aria-label', 'Go to slide 2');
      expect(dots[2]).toHaveAttribute('aria-label', 'Go to slide 3');
    });

    it('has proper ARIA labels for play/pause button', () => {
      render(<BannerCarousel {...defaultProps} />);
      
      expect(screen.getByLabelText('Pause carousel')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles slides with minimal data', () => {
      const minimalSlides = [
        { id: '1', title: 'Minimal Slide' }
      ];
      
      render(<BannerCarousel {...defaultProps} slides={minimalSlides} />);
      
      expect(screen.getByText('Minimal Slide')).toBeInTheDocument();
      expect(screen.queryByText('Get Started')).not.toBeInTheDocument();
    });

    it('handles rapid navigation', async () => {
      const user = userEvent.setup();
      render(<BannerCarousel {...defaultProps} />);
      
      const rightArrow = screen.getByTestId('arrow-right');
      
      // Rapidly click next arrow
      await user.click(rightArrow);
      await user.click(rightArrow);
      await user.click(rightArrow);
      
      expect(defaultProps.onSlideChange).toHaveBeenCalledTimes(3);
    });

    it('handles auto-play with single slide', () => {
      render(<BannerCarousel {...defaultProps} slides={[mockSlides[0]]} />);
      
      jest.advanceTimersByTime(10000);
      
      expect(defaultProps.onSlideChange).not.toHaveBeenCalled();
    });
  });
});
