import { css } from '@emotion/css';

export const carouselStyles = {
  base: css`
    .carousel {
      position: relative;
      overflow: hidden;
      font-family: var(--font-primary);
      color: var(--color-text);
    }
  `,
  
  container: css`
    .carousel-container {
      position: relative;
      width: 100%;
      height: 100%;
    }
  `,
  
  track: css`
    .carousel-track {
      display: flex;
      width: 100%;
      height: 100%;
    }
  `,
  
  slide: css`
    .carousel-slide {
      flex: 0 0 100%;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      box-sizing: border-box;
      transition: transform 0.3s ease;
    }
  `,
  
  arrows: css`
    .carousel-arrow {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: var(--color-background);
      border: 1px solid var(--color-border);
      border-radius: 50%;
      width: 3rem;
      height: 3rem;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--color-text);
      font-size: 1.25rem;
      z-index: 2;
      transition: all 0.2s ease;
    }
    
    .carousel-arrow:hover {
      background: var(--color-primary);
      color: var(--color-background);
    }
    
    .carousel-arrow:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .carousel-arrow-prev {
      left: 1rem;
    }
    
    .carousel-arrow-next {
      right: 1rem;
    }
  `,
  
  dots: css`
    .carousel-dots {
      text-align: center;
      margin-top: 1rem;
    }
    
    .carousel-dot {
      width: 0.75rem;
      height: 0.75rem;
      border-radius: 50%;
      border: none;
      background: var(--color-border);
      margin: 0 0.25rem;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }
    
    .carousel-dot.active {
      background: var(--color-primary);
    }
    
    .carousel-dot:hover {
      background: var(--color-primary);
      opacity: 0.7;
    }
  `,
  
  thumbnails: css`
    .carousel-thumbnails {
      margin-top: 1rem;
      display: flex;
      justify-content: center;
      gap: 0.5rem;
    }
    
    .carousel-thumbnail {
      width: 4rem;
      height: 3rem;
      border: 2px solid var(--color-border);
      border-radius: 0.375rem;
      background: var(--color-background);
      cursor: pointer;
      margin: 0 0.25rem;
      overflow: hidden;
      transition: border-color 0.2s ease;
    }
    
    .carousel-thumbnail.active {
      border-color: var(--color-primary);
    }
    
    .carousel-thumbnail:hover {
      border-color: var(--color-primary);
    }
  `,
  
  autoplay: css`
    .carousel-autoplay {
      animation: slideIn 0.3s ease-in-out;
    }
    
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(100%);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
  `,
  
  infinite: css`
    .carousel-infinite .carousel-track {
      animation: infiniteScroll 20s linear infinite;
    }
    
    @keyframes infiniteScroll {
      0% {
        transform: translateX(0);
      }
      100% {
        transform: translateX(-100%);
      }
    }
  `,
  
  responsive: css`
    @media (max-width: 768px) {
      .carousel-arrow {
        width: 2.5rem;
        height: 2.5rem;
        font-size: 1rem;
      }
      
      .carousel-arrow-prev {
        left: 0.5rem;
      }
      
      .carousel-arrow-next {
        right: 0.5rem;
      }
      
      .carousel-thumbnail {
        width: 3rem;
        height: 2.25rem;
      }
    }
  `,
  
  darkMode: css`
    @media (prefers-color-scheme: dark) {
      .carousel-arrow {
        background: var(--color-background-dark);
        border-color: var(--color-border-dark);
        color: var(--color-text-dark);
      }
      
      .carousel-arrow:hover {
        background: var(--color-primary-light);
        color: var(--color-background-dark);
      }
      
      .carousel-thumbnail {
        background: var(--color-background-dark);
        border-color: var(--color-border-dark);
      }
    }
  `,
  
  animations: css`
    .carousel-slide {
      animation: fadeIn 0.3s ease-in-out;
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateX(100%);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    .carousel-arrow {
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.7;
      }
    }
  `,
  
  accessibility: css`
    .carousel:focus {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }
    
    .carousel-arrow:focus {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }
    
    .carousel-dot:focus {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }
    
    .carousel-thumbnail:focus {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }
  `,
};
