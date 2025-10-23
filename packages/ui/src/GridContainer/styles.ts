import { css } from '@emotion/css';

export const gridContainerStyles = {
  base: css`
    .grid-container {
      display: grid;
      width: 100%;
    }
  `,
  
  responsive: css`
    @media (max-width: 768px) {
      .grid-container {
        grid-template-columns: 1fr !important;
        gap: 0.5rem !important;
      }
    }
    
    @media (min-width: 769px) and (max-width: 1024px) {
      .grid-container {
        grid-template-columns: repeat(2, 1fr) !important;
        gap: 1rem !important;
      }
    }
    
    @media (min-width: 1025px) {
      .grid-container {
        grid-template-columns: repeat(3, 1fr) !important;
        gap: 1.5rem !important;
      }
    }
  `,
  
  autoFit: css`
    .grid-container.auto-fit {
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    }
  `,
  
  autoFill: css`
    .grid-container.auto-fill {
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    }
  `,
  
  masonry: css`
    .grid-container.masonry {
      column-count: 3;
      column-gap: 1rem;
    }
    
    .grid-container.masonry > * {
      break-inside: avoid;
      margin-bottom: 1rem;
    }
  `,
  
  gapVariants: {
    none: css`
      .grid-container.gap-none {
        gap: 0;
      }
    `,
    sm: css`
      .grid-container.gap-sm {
        gap: 0.5rem;
      }
    `,
    md: css`
      .grid-container.gap-md {
        gap: 1rem;
      }
    `,
    lg: css`
      .grid-container.gap-lg {
        gap: 1.5rem;
      }
    `,
    xl: css`
      .grid-container.gap-xl {
        gap: 2rem;
      }
    `,
  },
  
  columnVariants: {
    1: css`
      .grid-container.cols-1 {
        grid-template-columns: repeat(1, 1fr);
      }
    `,
    2: css`
      .grid-container.cols-2 {
        grid-template-columns: repeat(2, 1fr);
      }
    `,
    3: css`
      .grid-container.cols-3 {
        grid-template-columns: repeat(3, 1fr);
      }
    `,
    4: css`
      .grid-container.cols-4 {
        grid-template-columns: repeat(4, 1fr);
      }
    `,
    5: css`
      .grid-container.cols-5 {
        grid-template-columns: repeat(5, 1fr);
      }
    `,
    6: css`
      .grid-container.cols-6 {
        grid-template-columns: repeat(6, 1fr);
      }
    `,
  },
};
