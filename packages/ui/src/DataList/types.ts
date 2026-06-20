export interface DataListTab {
  id: string;
  label: string;
  count?: number;
}

export interface FilterChipData {
  id: string;
  label: string;
  value: string;
}

export interface SortOption {
  id: string;
  label: string;
}

export type SortDirection = 'asc' | 'desc';

export interface PageHeaderProps {
  icon?: React.ReactNode;
  breadcrumb?: string;
  title: string;
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export interface TabNavProps {
  tabs: DataListTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onSearchToggle?: () => void;
  onSortToggle?: () => void;
  searchActive?: boolean;
  className?: string;
}

export interface FilterChipProps {
  label: string;
  value: string;
  onRemove: () => void;
  className?: string;
}

export interface AddFilterChipProps {
  onClick: () => void;
  className?: string;
}

export interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchCancel: () => void;
  activeFilters?: FilterChipData[];
  onRemoveFilter?: (filterId: string) => void;
  onAddFilter?: () => void;
  onClearAll?: () => void;
  onSortToggle?: () => void;
  sortActive?: boolean;
  placeholder?: string;
  className?: string;
}

export interface SortDropdownProps {
  options: SortOption[];
  selectedOption: string;
  direction: SortDirection;
  onOptionChange: (optionId: string) => void;
  onDirectionChange: (direction: SortDirection) => void;
  onClose?: () => void;
  className?: string;
}

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}
