import { css } from '@emotion/css';

export type SplitPageVariant = 'main-aside' | 'nav-main' | 'triple';

export interface SplitPageLayoutPreset {
  variant: SplitPageVariant;
  asideWidth: string;
  navWidth: string;
  panelWidth: string;
  breakpoint: string;
  stickyTop: string;
}

export const splitPagePresets: Record<SplitPageVariant, SplitPageLayoutPreset> = {
  /** Shopify product/order detail — primary content + sticky metadata sidebar */
  'main-aside': {
    variant: 'main-aside',
    asideWidth: '320px',
    navWidth: '240px',
    panelWidth: '320px',
    breakpoint: '1024px',
    stickyTop: '72px',
  },
  /** Settings — section nav + form content */
  'nav-main': {
    variant: 'nav-main',
    asideWidth: '320px',
    navWidth: '240px',
    panelWidth: '320px',
    breakpoint: '1024px',
    stickyTop: '72px',
  },
  /** Developer studio — left tools + center + right inspector */
  triple: {
    variant: 'triple',
    asideWidth: '320px',
    navWidth: '280px',
    panelWidth: '320px',
    breakpoint: '1200px',
    stickyTop: '72px',
  },
};

export const splitPageDefaults = {
  maxWidth: '1400px',
  pagePadding: 'px-4 sm:px-6 lg:px-8 py-6',
};

export const splitPageStyles = {
  page: css`
    &.split-page {
      max-width: var(--split-page-max-width, 1400px);
      margin-left: auto;
      margin-right: auto;
    }
  `,

  grid: (preset: SplitPageLayoutPreset) => css`
    &.split-page-grid {
      display: grid;
      gap: 20px;
      align-items: start;
    }

    &.split-page-grid--main-aside {
      grid-template-columns: minmax(0, 1fr) ${preset.asideWidth};
    }

    &.split-page-grid--nav-main {
      grid-template-columns: ${preset.navWidth} minmax(0, 1fr);
    }

    &.split-page-grid--triple {
      grid-template-columns: ${preset.panelWidth} minmax(0, 1fr) ${preset.panelWidth};
      gap: 16px;
    }

    @media (max-width: ${preset.breakpoint}) {
      &.split-page-grid--main-aside,
      &.split-page-grid--nav-main,
      &.split-page-grid--triple {
        grid-template-columns: 1fr;
      }
    }
  `,

  stickyColumn: (preset: SplitPageLayoutPreset) => css`
    &.split-page-sticky {
      position: sticky;
      top: ${preset.stickyTop};
    }

    @media (max-width: ${preset.breakpoint}) {
      &.split-page-sticky {
        position: static;
      }
    }
  `,
};
