/** iOS system palette — sourced from apps/web/styles/globals.css */

export interface SystemColors {
  blue: string;
  blueHover: string;
  green: string;
  indigo: string;
  orange: string;
  pink: string;
  purple: string;
  red: string;
  teal: string;
  yellow: string;
  mint: string;
}

export interface SurfaceColors {
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  bgElevated: string;
}

export interface LabelColors {
  labelPrimary: string;
  labelSecondary: string;
  labelTertiary: string;
  labelQuaternary: string;
}

export interface FillColors {
  fillPrimary: string;
  fillSecondary: string;
  fillTertiary: string;
  fillQuaternary: string;
}

export interface SeparatorColors {
  separator: string;
  separatorOpaque: string;
}

export interface SidebarColors {
  sidebarBg: string;
  sidebarBorder: string;
  sidebarItemHover: string;
  sidebarItemActive: string;
}

export interface ThemeColors
  extends SurfaceColors, LabelColors, FillColors, SeparatorColors, SidebarColors, SystemColors {}

export const lightSystemColors: SystemColors = {
  blue: '#007aff',
  blueHover: '#0066dd',
  green: '#34c759',
  indigo: '#5856d6',
  orange: '#ff9500',
  pink: '#ff2d55',
  purple: '#af52de',
  red: '#ff3b30',
  teal: '#30b0c7',
  yellow: '#ffcc00',
  mint: '#00c7be',
};

export const darkSystemColors: SystemColors = {
  blue: '#0a84ff',
  blueHover: '#409cff',
  green: '#30d158',
  indigo: '#5e5ce6',
  orange: '#ff9f0a',
  pink: '#ff375f',
  purple: '#bf5af2',
  red: '#ff453a',
  teal: '#40c8e0',
  yellow: '#ffd60a',
  mint: '#63e6e2',
};

export const lightThemeColors: ThemeColors = {
  bgPrimary: '#f2f2f7',
  bgSecondary: '#ffffff',
  bgTertiary: '#efeff4',
  bgElevated: '#ffffff',
  labelPrimary: '#000000',
  labelSecondary: 'rgba(60, 60, 67, 0.6)',
  labelTertiary: 'rgba(60, 60, 67, 0.3)',
  labelQuaternary: 'rgba(60, 60, 67, 0.18)',
  separator: 'rgba(60, 60, 67, 0.12)',
  separatorOpaque: '#c6c6c8',
  fillPrimary: 'rgba(120, 120, 128, 0.2)',
  fillSecondary: 'rgba(120, 120, 128, 0.16)',
  fillTertiary: 'rgba(118, 118, 128, 0.12)',
  fillQuaternary: 'rgba(116, 116, 128, 0.08)',
  sidebarBg: 'rgba(246, 246, 246, 0.82)',
  sidebarBorder: 'rgba(0, 0, 0, 0.08)',
  sidebarItemHover: 'rgba(0, 0, 0, 0.05)',
  sidebarItemActive: 'rgba(0, 122, 255, 0.12)',
  ...lightSystemColors,
};

export const darkThemeColors: ThemeColors = {
  bgPrimary: '#000000',
  bgSecondary: '#1c1c1e',
  bgTertiary: '#2c2c2e',
  bgElevated: '#1c1c1e',
  labelPrimary: '#ffffff',
  labelSecondary: 'rgba(235, 235, 245, 0.6)',
  labelTertiary: 'rgba(235, 235, 245, 0.3)',
  labelQuaternary: 'rgba(235, 235, 245, 0.18)',
  separator: 'rgba(84, 84, 88, 0.55)',
  separatorOpaque: '#38383a',
  fillPrimary: 'rgba(120, 120, 128, 0.36)',
  fillSecondary: 'rgba(120, 120, 128, 0.28)',
  fillTertiary: 'rgba(118, 118, 128, 0.22)',
  fillQuaternary: 'rgba(116, 116, 128, 0.16)',
  sidebarBg: 'rgba(28, 28, 30, 0.9)',
  sidebarBorder: 'rgba(255, 255, 255, 0.06)',
  sidebarItemHover: 'rgba(255, 255, 255, 0.06)',
  sidebarItemActive: 'rgba(10, 132, 255, 0.18)',
  ...darkSystemColors,
};
