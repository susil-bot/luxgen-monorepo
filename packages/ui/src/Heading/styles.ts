import { css } from '@emotion/css';

export const headingStyles = {
  base: css`
    .heading {
      font-family: var(--font-primary);
      color: var(--color-text);
      margin: 0;
      line-height: 1.2;
    }
  `,
  
  sizes: {
    sm: css`
      .heading-sm {
        font-size: 0.875rem;
        line-height: 1.5;
      }
    `,
    md: css`
      .heading-md {
        font-size: 1rem;
        line-height: 1.5;
      }
    `,
    lg: css`
      .heading-lg {
        font-size: 1.125rem;
        line-height: 1.4;
      }
    `,
    xl: css`
      .heading-xl {
        font-size: 1.25rem;
        line-height: 1.4;
      }
    `,
    '2xl': css`
      .heading-2xl {
        font-size: 1.5rem;
        line-height: 1.3;
      }
    `,
    '3xl': css`
      .heading-3xl {
        font-size: 1.875rem;
        line-height: 1.2;
      }
    `,
    '4xl': css`
      .heading-4xl {
        font-size: 2.25rem;
        line-height: 1.1;
      }
    `,
    '5xl': css`
      .heading-5xl {
        font-size: 3rem;
        line-height: 1;
      }
    `,
    '6xl': css`
      .heading-6xl {
        font-size: 3.75rem;
        line-height: 1;
      }
    `,
  },
  
  weights: {
    light: css`
      .heading-light {
        font-weight: 300;
      }
    `,
    normal: css`
      .heading-normal {
        font-weight: 400;
      }
    `,
    medium: css`
      .heading-medium {
        font-weight: 500;
      }
    `,
    semibold: css`
      .heading-semibold {
        font-weight: 600;
      }
    `,
    bold: css`
      .heading-bold {
        font-weight: 700;
      }
    `,
    extrabold: css`
      .heading-extrabold {
        font-weight: 800;
      }
    `,
    black: css`
      .heading-black {
        font-weight: 900;
      }
    `,
  },
  
  alignments: {
    left: css`
      .heading-left {
        text-align: left;
      }
    `,
    center: css`
      .heading-center {
        text-align: center;
      }
    `,
    right: css`
      .heading-right {
        text-align: right;
      }
    `,
    justify: css`
      .heading-justify {
        text-align: justify;
      }
    `,
  },
  
  variants: {
    primary: css`
      .heading-primary {
        color: var(--color-text);
      }
    `,
    secondary: css`
      .heading-secondary {
        color: var(--color-text-secondary);
      }
    `,
    success: css`
      .heading-success {
        color: var(--color-success);
      }
    `,
    error: css`
      .heading-error {
        color: var(--color-error);
      }
    `,
    warning: css`
      .heading-warning {
        color: var(--color-warning);
      }
    `,
    info: css`
      .heading-info {
        color: var(--color-info);
      }
    `,
  },
  
  truncate: css`
    .heading-truncate {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  `,
  
  responsive: css`
    @media (max-width: 768px) {
      .heading-6xl {
        font-size: 2.5rem;
      }
      
      .heading-5xl {
        font-size: 2rem;
      }
      
      .heading-4xl {
        font-size: 1.75rem;
      }
      
      .heading-3xl {
        font-size: 1.5rem;
      }
      
      .heading-2xl {
        font-size: 1.25rem;
      }
    }
  `,
  
  darkMode: css`
    @media (prefers-color-scheme: dark) {
      .heading {
        color: #F9FAFB;
      }
      
      .heading-secondary {
        color: #9CA3AF;
      }
    }
  `,
};
