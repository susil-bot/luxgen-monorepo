import React, { useState, useRef, useEffect } from 'react';
import { BaseComponentProps, TenantTheme } from '../types';
import { withSSR } from '../ssr';
import { defaultTheme } from '../theme';

export interface CarouselItem {
  id: string;
  content: React.ReactNode;
  title?: string;
  description?: string;
}

export interface CarouselProps extends BaseComponentProps {
  tenantTheme?: TenantTheme;
  items: CarouselItem[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showArrows?: boolean;
  showDots?: boolean;
  showThumbnails?: boolean;
  infinite?: boolean;
  slidesToShow?: number;
  slidesToScroll?: number;
  onSlideChange?: (index: number) => void;
  onItemClick?: (item: CarouselItem, index: number) => void;
}

const CarouselComponent: React.FC<CarouselProps> = ({
  tenantTheme = defaultTheme,
  className = '',
  style,
  items,
  autoPlay = false,
  autoPlayInterval = 3000,
  showArrows = true,
  showDots = true,
  showThumbnails = false,
  infinite = true,
  slidesToShow = 1,
  slidesToScroll = 1,
  onSlideChange,
  onItemClick,
  ...props
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const totalSlides = items.length;
  const maxIndex = Math.max(0, totalSlides - slidesToShow);

  const goToSlide = (index: number) => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setCurrentIndex(index);
    onSlideChange?.(index);
    
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const nextSlide = () => {
    if (infinite) {
      goToSlide((currentIndex + slidesToScroll) % totalSlides);
    } else {
      goToSlide(Math.min(currentIndex + slidesToScroll, maxIndex));
    }
  };

  const prevSlide = () => {
    if (infinite) {
      goToSlide((currentIndex - slidesToScroll + totalSlides) % totalSlides);
    } else {
      goToSlide(Math.max(currentIndex - slidesToScroll, 0));
    }
  };

  const startAutoPlay = () => {
    if (autoPlay && totalSlides > 1) {
      intervalRef.current = setInterval(nextSlide, autoPlayInterval);
    }
  };

  const stopAutoPlay = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    startAutoPlay();
    return () => stopAutoPlay();
  }, [currentIndex, autoPlay, autoPlayInterval]);

  const handleItemClick = (item: CarouselItem, index: number) => {
    onItemClick?.(item, index);
  };

  const handleMouseEnter = () => {
    if (autoPlay) stopAutoPlay();
  };

  const handleMouseLeave = () => {
    if (autoPlay) startAutoPlay();
  };

  const getSlideStyle = (index: number) => {
    const offset = (index - currentIndex) * 100;
    return {
      transform: `translateX(${offset}%)`,
      transition: isTransitioning ? 'transform 0.3s ease' : 'none',
    };
  };

  const styles = {
    ...style,
    fontFamily: tenantTheme.fonts.primary,
    color: tenantTheme.colors.text,
  };

  return (
    <div
      ref={carouselRef}
      className={`carousel ${className}`}
      style={styles}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {/* Main carousel container */}
      <div className="carousel-container">
        <div className="carousel-track">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="carousel-slide"
              style={getSlideStyle(index)}
              onClick={() => handleItemClick(item, index)}
            >
              {item.content}
            </div>
          ))}
        </div>

        {/* Navigation arrows */}
        {showArrows && totalSlides > slidesToShow && (
          <>
            <button
              className="carousel-arrow carousel-arrow-prev"
              onClick={prevSlide}
              disabled={!infinite && currentIndex === 0}
              style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: tenantTheme.colors.background,
                border: `1px solid ${tenantTheme.colors.border}`,
                borderRadius: '50%',
                width: '3rem',
                height: '3rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: tenantTheme.colors.text,
                fontSize: '1.25rem',
                zIndex: 2,
              }}
            >
              ‹
            </button>
            <button
              className="carousel-arrow carousel-arrow-next"
              onClick={nextSlide}
              disabled={!infinite && currentIndex >= maxIndex}
              style={{
                position: 'absolute',
                right: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: tenantTheme.colors.background,
                border: `1px solid ${tenantTheme.colors.border}`,
                borderRadius: '50%',
                width: '3rem',
                height: '3rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: tenantTheme.colors.text,
                fontSize: '1.25rem',
                zIndex: 2,
              }}
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* Dots navigation */}
      {showDots && totalSlides > 1 && (
        <div className="carousel-dots" style={{ textAlign: 'center', marginTop: '1rem' }}>
          {Array.from({ length: Math.ceil(totalSlides / slidesToShow) }).map((_, index) => (
            <button
              key={index}
              className={`carousel-dot ${index === Math.floor(currentIndex / slidesToShow) ? 'active' : ''}`}
              onClick={() => goToSlide(index * slidesToShow)}
              style={{
                width: '0.75rem',
                height: '0.75rem',
                borderRadius: '50%',
                border: 'none',
                background: index === Math.floor(currentIndex / slidesToShow) 
                  ? tenantTheme.colors.primary 
                  : tenantTheme.colors.border,
                margin: '0 0.25rem',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
              }}
            />
          ))}
        </div>
      )}

      {/* Thumbnails */}
      {showThumbnails && (
        <div className="carousel-thumbnails" style={{ marginTop: '1rem' }}>
          {items.map((item, index) => (
            <button
              key={item.id}
              className={`carousel-thumbnail ${index === currentIndex ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              style={{
                width: '4rem',
                height: '3rem',
                border: `2px solid ${index === currentIndex ? tenantTheme.colors.primary : tenantTheme.colors.border}`,
                borderRadius: '0.375rem',
                background: tenantTheme.colors.background,
                cursor: 'pointer',
                margin: '0 0.25rem',
                overflow: 'hidden',
                transition: 'border-color 0.2s ease',
              }}
            >
              {item.content}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const Carousel = withSSR(CarouselComponent);
