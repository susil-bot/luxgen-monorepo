import { css } from '@emotion/css';

export const textStyles = {
  base: css`
    .text {
      font-family: var(--font-primary);
      color: var(--color-text);
      margin: 0;
      line-height: 1.5;
    }
  `,
  
  variants: {
    caption: css`
      .text-caption {
        font-size: 0.75rem;
        line-height: 1.4;
        color: var(--color-text-secondary);
      }
    `,
    small: css`
      .text-small {
        font-size: 0.875rem;
        line-height: 1.4;
      }
    `,
    normal: css`
      .text-normal {
        font-size: 1rem;
        line-height: 1.5;
      }
    `,
    large: css`
      .text-large {
        font-size: 1.125rem;
        line-height: 1.5;
      }
    `,
    lead: css`
      .text-lead {
        font-size: 1.25rem;
        line-height: 1.4;
        font-weight: 500;
      }
    `,
    muted: css`
      .text-muted {
        font-size: 1rem;
        color: var(--color-text-secondary);
      }
    `,
  },
  
  weights: {
    light: css`
      .text-light {
        font-weight: 300;
      }
    `,
    normal: css`
      .text-normal {
        font-weight: 400;
      }
    `,
    medium: css`
      .text-medium {
        font-weight: 500;
      }
    `,
    semibold: css`
      .text-semibold {
        font-weight: 600;
      }
    `,
    bold: css`
      .text-bold {
        font-weight: 700;
      }
    `,
  },
  
  alignments: {
    left: css`
      .text-left {
        text-align: left;
      }
    `,
    center: css`
      .text-center {
        text-align: center;
      }
    `,
    right: css`
      .text-right {
        text-align: right;
      }
    `,
    justify: css`
      .text-justify {
        text-align: justify;
      }
    `,
  },
  
  colors: {
    primary: css`
      .text-primary {
        color: var(--color-text);
      }
    `,
    secondary: css`
      .text-secondary {
        color: var(--color-text-secondary);
      }
    `,
    success: css`
      .text-success {
        color: var(--color-success);
      }
    `,
    error: css`
      .text-error {
        color: var(--color-error);
      }
    `,
    warning: css`
      .text-warning {
        color: var(--color-warning);
      }
    `,
    info: css`
      .text-info {
        color: var(--color-info);
      }
    `,
  },
  
  truncate: css`
    .text-truncate {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  `,
  
  responsive: css`
    @media (max-width: 768px) {
      .text-lead {
        font-size: 1.125rem;
      }
      
      .text-large {
        font-size: 1rem;
      }
    }
  `,
  
  darkMode: css`
    @media (prefers-color-scheme: dark) {
      .text {
        color: #F9FAFB;
      }
      
      .text-muted {
        color: #9CA3AF;
      }
      
      .text-caption {
        color: #9CA3AF;
      }
    }
  `,
};
