import { css } from '@emotion/css';

export const pageWrapperStyles = {
  base: css`
    .page-wrapper {
      min-height: 100vh;
      width: 100%;
      display: flex;
      flex-direction: column;
      position: relative;
    }
  `,
  
  withPadding: css`
    .page-wrapper {
      padding: var(--spacing-md, 1rem);
    }
  `,
  
  withCustomPadding: (padding: string) => css`
    .page-wrapper {
      padding: ${padding};
    }
  `,
  
  withTheme: css`
    .page-wrapper {
      background-color: var(--color-background);
      color: var(--color-text);
      font-family: var(--font-primary);
    }
  `,
  
  responsive: css`
    @media (max-width: 768px) {
      .page-wrapper {
        padding: var(--spacing-sm, 0.5rem);
      }
    }
    
    @media (min-width: 1024px) {
      .page-wrapper {
        padding: var(--spacing-lg, 1.5rem);
      }
    }
  `,
  
  darkMode: css`
    @media (prefers-color-scheme: dark) {
      .page-wrapper {
        background-color: #1F2937;
        color: #F9FAFB;
      }
    }
  `,
};
