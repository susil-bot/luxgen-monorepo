import { ReactNode, CSSProperties } from 'react';

export interface TenantTheme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    backgroundSecondary: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    warning: string;
    success: string;
    info: string;
  };
  fonts: {
    primary: string;
    secondary: string;
    mono: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
}

export interface BaseComponentProps {
  tenantTheme?: TenantTheme;
  className?: string;
  style?: CSSProperties;
  id?: string;
  dataTestId?: string;
  children?: ReactNode;
  disabled?: boolean;
  loading?: boolean;
}

export interface ClickableProps {
  onClick?: (e: React.MouseEvent) => void;
}

export interface BaseFormProps {
  onChange?: (value: any) => void;
  value?: any;
  error?: string;
  placeholder?: string;
}

export interface VariantProps {
  variant?: 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error';
}

export interface SizeProps {
  size?: 'sm' | 'md' | 'lg';
}

export interface MenuItem {
  id: string;
  label: string;
  href?: string;
  icon?: ReactNode;
  children?: MenuItem[];
}

export interface TableColumn<T = any> {
  key: keyof T;
  title: string;
  sortable?: boolean;
  render?: (value: any, item: T) => ReactNode;
  width?: string | number;
}

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
}

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface RadioOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SlideContent {
  type: 'text' | 'image' | 'video' | 'poll' | 'quiz';
  content: any;
}

export interface PollOption {
  id: string;
  label: string;
  votes?: number;
}

export interface SurveyQuestion {
  id: string;
  type: 'text' | 'multiple-choice' | 'rating' | 'boolean';
  question: string;
  options?: string[];
  required?: boolean;
}

export interface Article {
  id: string;
  title: string;
  author: string;
  date: Date;
  summary: string;
  content?: string;
  image?: string;
  tags?: string[];
}

export interface ToastMessage {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export interface AlertProps {
  message: string;
  variant?: 'success' | 'error' | 'warning' | 'info';
  dismissible?: boolean;
  onDismiss?: () => void;
}
