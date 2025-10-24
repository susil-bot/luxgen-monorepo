export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  role: string;
  plan: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin: string;
  permissions?: string[];
}

export interface Role {
  id: string;
  name: string;
  description: string;
  userCount: number;
  users: User[];
  permissions: string[];
  color?: string;
  icon?: string;
}

export interface UserTableProps {
  users: User[];
  loading?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onUserSelect?: (userId: string) => void;
  onSelectAll?: () => void;
  selectedUsers?: string[];
  currentPage?: number;
  rowsPerPage?: number;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rows: number) => void;
  onExport?: () => void;
  onAddUser?: () => void;
  onUserAction?: (userId: string, action: string) => void;
}

export interface RoleCardProps {
  role: Role;
  onEdit?: (roleId: string) => void;
  onCopy?: (roleId: string) => void;
  onViewUsers?: (roleId: string) => void;
}

export interface UserRowProps {
  user: User;
  selected?: boolean;
  onSelect?: (userId: string) => void;
  onAction?: (userId: string, action: string) => void;
  showCheckbox?: boolean;
}
