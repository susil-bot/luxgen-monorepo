/** iOS Dynamic Type–inspired scale used across LuxGen web UI */

export interface FontFamily {
  primary: string;
  display: string;
  mono: string;
}

export interface FontSizeScale {
  caption2: number;
  caption1: number;
  footnote: number;
  subheadline: number;
  callout: number;
  body: number;
  headline: number;
  title3: number;
  title2: number;
  title1: number;
  largeTitle: number;
  /** Hero / empty-state icon size */
  display: number;
}

export interface FontWeightScale {
  regular: '400';
  medium: '500';
  semibold: '600';
  bold: '700';
}

export interface Typography {
  fontFamily: FontFamily;
  fontSize: FontSizeScale;
  fontWeight: FontWeightScale;
  letterSpacing: {
    tight: number;
    normal: number;
    wide: number;
    sectionLabel: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
}

export const typography: Typography = {
  fontFamily: {
    primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', system-ui, sans-serif",
    display: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif",
    mono: "ui-monospace, 'SF Mono', Menlo, Monaco, Consolas, monospace",
  },
  fontSize: {
    caption2: 11,
    caption1: 12,
    footnote: 13,
    subheadline: 14,
    callout: 15,
    body: 15,
    headline: 17,
    title3: 20,
    title2: 22,
    title1: 28,
    largeTitle: 34,
    display: 56,
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  letterSpacing: {
    tight: -0.5,
    normal: -0.2,
    wide: 0.04,
    sectionLabel: 0.06,
  },
  lineHeight: {
    tight: 1.12,
    normal: 1.4,
    relaxed: 1.6,
  },
};
