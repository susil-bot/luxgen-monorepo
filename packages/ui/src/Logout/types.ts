export interface LogoutUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  initials?: string;
}

export interface LogoutProps {
  onLogout: () => Promise<void> | void;
  onCancel?: () => void;
  user?: LogoutUser;
  variant?: 'default' | 'compact' | 'minimal' | 'danger';
  showConfirmation?: boolean;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
}

export interface LogoutStylesProps {
  variant: 'default' | 'compact' | 'minimal' | 'danger';
  disabled: boolean;
  loading: boolean;
}
