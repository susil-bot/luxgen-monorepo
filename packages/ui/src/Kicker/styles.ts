import { css } from '@emotion/css';

export const kickerStyles = {
  base: css`
    .kicker {
      font-family: var(--font-primary);
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s ease;
    }
  `,
  
  sizes: {
    small: css`
      .kicker-small {
        font-size: 0.75rem;
        letter-spacing: 0.05em;
        line-height: 1.2;
      }
    `,
    medium: css`
      .kicker-medium {
        font-size: 0.875rem;
        letter-spacing: 0.1em;
        line-height: 1.3;
      }
    `,
    large: css`
      .kicker-large {
        font-size: 1rem;
        letter-spacing: 0.15em;
        line-height: 1.4;
      }
    `,
  },
  
  variants: {
    primary: css`
      .kicker-primary {
        color: var(--color-primary);
      }
    `,
    secondary: css`
      .kicker-secondary {
        color: var(--color-text-secondary);
      }
    `,
    success: css`
      .kicker-success {
        color: var(--color-success);
      }
    `,
    error: css`
      .kicker-error {
        color: var(--color-error);
      }
    `,
    warning: css`
      .kicker-warning {
        color: var(--color-warning);
      }
    `,
    info: css`
      .kicker-info {
        color: var(--color-info);
      }
    `,
  },
  
  weights: {
    light: css`
      .kicker-light {
        font-weight: 300;
      }
    `,
    normal: css`
      .kicker-normal {
        font-weight: 400;
      }
    `,
    medium: css`
      .kicker-medium {
        font-weight: 500;
      }
    `,
    semibold: css`
      .kicker-semibold {
        font-weight: 600;
      }
    `,
    bold: css`
      .kicker-bold {
        font-weight: 700;
      }
    `,
  },
  
  alignments: {
    left: css`
      .kicker-left {
        text-align: left;
      }
    `,
    center: css`
      .kicker-center {
        text-align: center;
      }
    `,
    right: css`
      .kicker-right {
        text-align: right;
      }
    `,
  },
  
  icon: css`
    .kicker-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875em;
    }
  `,
  
  content: css`
    .kicker-content {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `,
  
  uppercase: css`
    .kicker-uppercase {
      text-transform: uppercase;
    }
  `,
  
  underline: css`
    .kicker-underline {
      text-decoration: underline;
      text-decoration-thickness: 2px;
      text-underline-offset: 0.25em;
    }
  `,
  
  hover: css`
    .kicker:hover {
      opacity: 0.8;
    }
  `,
  
  focus: css`
    .kicker:focus {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }
  `,
  
  responsive: css`
    @media (max-width: 768px) {
      .kicker-large {
        font-size: 0.875rem;
        letter-spacing: 0.1em;
      }
    }
  `,
  
  darkMode: css`
    @media (prefers-color-scheme: dark) {
      .kicker-primary {
        color: var(--color-primary-light);
      }
      
      .kicker-secondary {
        color: var(--color-text-light);
      }
    }
  `,
  
  animations: css`
    .kicker {
      animation: fadeIn 0.2s ease-in-out;
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-0.25rem);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `,
};
