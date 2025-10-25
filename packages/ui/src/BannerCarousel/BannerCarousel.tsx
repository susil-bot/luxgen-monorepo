import React, { useState, useEffect } from 'react';
import { Arrow } from '../Arrow';

export interface BannerSlide {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  date?: string;
  ctaText?: string;
  ctaHref?: string;
  ctaOnClick?: () => void;
  backgroundImage?: string;
  backgroundColor?: string;
  textColor?: string;
  ctaColor?: string;
}

export interface BannerCarouselProps {
  slides: BannerSlide[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showArrows?: boolean;
  showDots?: boolean;
  className?: string;
  onSlideChange?: (index: number) => void;
  onCtaClick?: (slide: BannerSlide) => void;
}

export const BannerCarousel: React.FC<BannerCarouselProps> = ({
  slides,
  autoPlay = true,
  autoPlayInterval = 5000,
  showArrows = true,
  showDots = true,
  className = '',
  onSlideChange,
  onCtaClick
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  useEffect(() => {
    if (!isPlaying || slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isPlaying, slides.length, autoPlayInterval]);

  useEffect(() => {
    onSlideChange?.(currentSlide);
  }, [currentSlide, onSlideChange]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsPlaying(false); // Pause auto-play when user interacts
  };

  const goToPrevious = () => {
    const newIndex = currentSlide === 0 ? slides.length - 1 : currentSlide - 1;
    goToSlide(newIndex);
  };

  const goToNext = () => {
    const newIndex = (currentSlide + 1) % slides.length;
    goToSlide(newIndex);
  };

  const handleCtaClick = (slide: BannerSlide) => {
    if (slide.ctaOnClick) {
      slide.ctaOnClick();
    }
    onCtaClick?.(slide);
  };

  if (slides.length === 0) {
    return null;
  }

  const currentSlideData = slides[currentSlide];

  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      {/* Banner Container */}
      <div
        className="relative w-full h-64 md:h-80 lg:h-96 flex items-center"
        style={{
          backgroundColor: currentSlideData.backgroundColor || '#4A70F7',
          backgroundImage: currentSlideData.backgroundImage 
            ? `url(${currentSlideData.backgroundImage})` 
            : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Background Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <svg
            className="w-full h-full"
            viewBox="0 0 400 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,100 Q100,50 200,100 T400,100 L400,200 L0,200 Z"
              fill="currentColor"
              className="text-white"
            />
            <path
              d="M0,120 Q150,80 300,120 T400,120 L400,200 L0,200 Z"
              fill="currentColor"
              className="text-white"
            />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 w-full px-6 md:px-8 lg:px-12">
          <div className="max-w-4xl">
            {/* Date */}
            {currentSlideData.date && (
              <div 
                className="text-sm md:text-base mb-2 opacity-80"
                style={{ color: currentSlideData.textColor || '#E5E7EB' }}
              >
                {currentSlideData.date}
              </div>
            )}

            {/* Title */}
            <h2 
              className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 leading-tight"
              style={{ color: currentSlideData.textColor || '#FFFFFF' }}
            >
              {currentSlideData.title}
            </h2>

            {/* Subtitle */}
            {currentSlideData.subtitle && (
              <h3 
                className="text-lg md:text-xl lg:text-2xl font-semibold mb-3"
                style={{ color: currentSlideData.textColor || '#FFFFFF' }}
              >
                {currentSlideData.subtitle}
              </h3>
            )}

            {/* Description */}
            {currentSlideData.description && (
              <p 
                className="text-sm md:text-base mb-6 opacity-90 max-w-2xl"
                style={{ color: currentSlideData.textColor || '#E5E7EB' }}
              >
                {currentSlideData.description}
              </p>
            )}

            {/* CTA Button */}
            {currentSlideData.ctaText && (
              <button
                onClick={() => handleCtaClick(currentSlideData)}
                className="inline-flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50"
                style={{
                  backgroundColor: currentSlideData.ctaColor || '#F78C4A',
                  color: '#FFFFFF'
                }}
              >
                {currentSlideData.ctaText}
              </button>
            )}
          </div>
        </div>

        {/* Navigation Arrows */}
        {showArrows && slides.length > 1 && (
          <>
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20">
              <Arrow
                direction="left"
                size="medium"
                variant="outline"
                onClick={goToPrevious}
                aria-label="Previous slide"
              />
            </div>
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20">
              <Arrow
                direction="right"
                size="medium"
                variant="outline"
                onClick={goToNext}
                aria-label="Next slide"
              />
            </div>
          </>
        )}
      </div>

      {/* Dots Indicator */}
      {showDots && slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentSlide
                    ? 'bg-white scale-125'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Play/Pause Button */}
      {slides.length > 1 && (
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-200"
            aria-label={isPlaying ? 'Pause carousel' : 'Play carousel'}
          >
            {isPlaying ? (
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
