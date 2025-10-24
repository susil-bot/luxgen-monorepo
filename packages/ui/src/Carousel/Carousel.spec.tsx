import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Carousel } from './Carousel';
import { carouselFixtures } from './fixture';

describe('Carousel', () => {
  it('renders with default props', () => {
    render(<Carousel {...carouselFixtures.default} />);
    
    expect(screen.getByText('Slide 1 Content')).toBeInTheDocument();
  });

  it('renders with auto play', () => {
    render(<Carousel {...carouselFixtures.withAutoPlay} />);
    
    expect(screen.getByText('Slide 1 Content')).toBeInTheDocument();
  });

  it('renders with arrows', () => {
    render(<Carousel {...carouselFixtures.withArrows} />);
    
    expect(screen.getByText('‹')).toBeInTheDocument();
    expect(screen.getByText('›')).toBeInTheDocument();
  });

  it('renders with dots', () => {
    render(<Carousel {...carouselFixtures.withDots} />);
    
    const dots = screen.getAllByRole('button');
    expect(dots).toHaveLength(3); // 3 dots for 3 slides
  });

  it('renders with thumbnails', () => {
    render(<Carousel {...carouselFixtures.withThumbnails} />);
    
    expect(screen.getByText('Slide 1 Content')).toBeInTheDocument();
    expect(screen.getByText('Slide 2 Content')).toBeInTheDocument();
    expect(screen.getByText('Slide 3 Content')).toBeInTheDocument();
  });

  it('renders with multiple slides', () => {
    render(<Carousel {...carouselFixtures.withMultipleSlides} />);
    
    expect(screen.getByText('Slide 1 Content')).toBeInTheDocument();
  });

  it('renders without infinite scroll', () => {
    render(<Carousel {...carouselFixtures.withoutInfinite} />);
    
    expect(screen.getByText('Slide 1 Content')).toBeInTheDocument();
  });

  it('calls onSlideChange when slide changes', async () => {
    const onSlideChange = jest.fn();
    render(<Carousel {...carouselFixtures.withCallbacks} onSlideChange={onSlideChange} />);
    
    const nextButton = screen.getByText('›');
    fireEvent.click(nextButton);
    
    await waitFor(() => {
      expect(onSlideChange).toHaveBeenCalledWith(1);
    });
  });

  it('calls onItemClick when item is clicked', () => {
    const onItemClick = jest.fn();
    render(<Carousel {...carouselFixtures.withCallbacks} onItemClick={onItemClick} />);
    
    const slide = screen.getByText('Slide 1 Content');
    fireEvent.click(slide);
    
    expect(onItemClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: '1', title: 'Slide 1' }),
      0
    );
  });

  it('renders with custom theme', () => {
    render(<Carousel {...carouselFixtures.withCustomTheme} />);
    
    expect(screen.getByText('Slide 1 Content')).toBeInTheDocument();
  });

  it('renders with single item', () => {
    render(<Carousel {...carouselFixtures.singleItem} />);
    
    expect(screen.getByText('Slide 1 Content')).toBeInTheDocument();
  });

  it('renders with empty items', () => {
    render(<Carousel {...carouselFixtures.emptyItems} />);
    
    expect(screen.getByText('Slide 1 Content')).not.toBeInTheDocument();
  });

  it('renders with all features', () => {
    render(<Carousel {...carouselFixtures.withAllFeatures} />);
    
    expect(screen.getByText('Slide 1 Content')).toBeInTheDocument();
    expect(screen.getByText('‹')).toBeInTheDocument();
    expect(screen.getByText('›')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Carousel {...carouselFixtures.default} className="custom-carousel" />);
    
    const carousel = screen.getByText('Slide 1 Content').closest('.carousel');
    expect(carousel).toHaveClass('custom-carousel');
  });

  it('applies custom style', () => {
    const customStyle = { border: '2px solid red' };
    render(<Carousel {...carouselFixtures.default} style={customStyle} />);
    
    const carousel = screen.getByText('Slide 1 Content').closest('.carousel');
    expect(carousel).toHaveStyle('border: 2px solid red');
  });

  it('handles keyboard navigation', () => {
    render(<Carousel {...carouselFixtures.default} />);
    
    const carousel = screen.getByText('Slide 1 Content').closest('.carousel');
    fireEvent.keyDown(carousel!, { key: 'ArrowRight' });
    
    // Should move to next slide
    expect(screen.getByText('Slide 2 Content')).toBeInTheDocument();
  });

  it('handles touch events', () => {
    render(<Carousel {...carouselFixtures.default} />);
    
    const carousel = screen.getByText('Slide 1 Content').closest('.carousel');
    fireEvent.touchStart(carousel!, { touches: [{ clientX: 100 }] });
    fireEvent.touchEnd(carousel!, { changedTouches: [{ clientX: 50 }] });
    
    // Should move to next slide
    expect(screen.getByText('Slide 2 Content')).toBeInTheDocument();
  });
});
