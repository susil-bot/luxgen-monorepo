import { css } from '@emotion/css';

export const cardStyles = {
  base: css`
    .card {
      font-family: var(--font-primary);
      color: var(--color-text);
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
  `,
  
  variants: {
    default: css`
      .card-default {
        background-color: var(--color-background);
        border: 1px solid var(--color-border);
        border-radius: 0.5rem;
      }
    `,
    elevated: css`
      .card-elevated {
        background-color: var(--color-background);
        border: none;
        border-radius: 0.5rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      }
    `,
    outlined: css`
      .card-outlined {
        background-color: transparent;
        border: 2px solid var(--color-border);
        border-radius: 0.5rem;
      }
    `,
    filled: css`
      .card-filled {
        background-color: var(--color-background-secondary);
        border: none;
        border-radius: 0.5rem;
      }
    `,
  },
  
  sizes: {
    small: css`
      .card-small {
        font-size: 0.875rem;
        min-height: 8rem;
      }
    `,
    medium: css`
      .card-medium {
        font-size: 1rem;
        min-height: 10rem;
      }
    `,
    large: css`
      .card-large {
        font-size: 1.125rem;
        min-height: 12rem;
      }
    `,
  },
  
  padding: {
    none: css`
      .card-padding-none {
        padding: 0;
      }
    `,
    small: css`
      .card-padding-small {
        padding: 0.75rem;
      }
    `,
    medium: css`
      .card-padding-medium {
        padding: 1rem;
      }
    `,
    large: css`
      .card-padding-large {
        padding: 1.5rem;
      }
    `,
  },
  
  shadow: {
    none: css`
      .card-shadow-none {
        box-shadow: none;
      }
    `,
    small: css`
      .card-shadow-small {
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
      }
    `,
    medium: css`
      .card-shadow-medium {
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      }
    `,
    large: css`
      .card-shadow-large {
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      }
    `,
  },
  
  interactive: {
    clickable: css`
      .card-clickable {
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      .card-clickable:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      }
    `,
    hover: css`
      .card-hover:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 8px -1px rgba(0, 0, 0, 0.1), 0 3px 5px -1px rgba(0, 0, 0, 0.06);
      }
    `,
  },
  
  header: css`
    .card-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    
    .card-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2rem;
      height: 2rem;
      color: var(--color-primary);
      font-size: 1.25rem;
    }
    
    .card-title {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--color-text);
      line-height: 1.4;
    }
    
    .card-description {
      margin: 0.25rem 0 0 0;
      font-size: 0.875rem;
      color: var(--color-text-secondary);
      line-height: 1.5;
    }
  `,
  
  content: css`
    .card-content {
      flex: 1;
    }
  `,
  
  footer: css`
    .card-footer {
      border-top: 1px solid var(--color-border);
      margin-top: auto;
    }
  `,
  
  image: css`
    .card-image {
      width: 100%;
      height: 200px;
      object-fit: cover;
    }
    
    .card-image-left,
    .card-image-right {
      width: 40%;
      height: auto;
    }
  `,
  
  responsive: css`
    @media (max-width: 768px) {
      .card {
        min-height: auto;
      }
      
      .card-large {
        font-size: 1rem;
        min-height: 8rem;
      }
      
      .card-image-left,
      .card-image-right {
        width: 100%;
        height: 200px;
      }
    }
  `,
  
  darkMode: css`
    @media (prefers-color-scheme: dark) {
      .card-default {
        background-color: var(--color-background-dark);
        border-color: var(--color-border-dark);
      }
      
      .card-elevated {
        background-color: var(--color-background-dark);
      }
      
      .card-outlined {
        border-color: var(--color-border-dark);
      }
      
      .card-filled {
        background-color: var(--color-background-secondary-dark);
      }
      
      .card-title {
        color: var(--color-text-dark);
      }
      
      .card-description {
        color: var(--color-text-secondary-dark);
      }
    }
  `,
  
  animations: css`
    .card {
      animation: fadeIn 0.3s ease-in-out;
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .card-clickable {
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.95;
      }
    }
  `,
  
  accessibility: css`
    .card:focus {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }
    
    .card-clickable:focus {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }
    
    .card-clickable:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }
  `,
};
