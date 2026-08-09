// Data List Components (PageHeader, TabNav, FilterBar, FilterChip, SortDropdown, EmptyState, DataListPage)
export * from './DataList';

// Layout Components
export * from './PageWrapper';
export * from './Header';
export * from './Footer';
export * from './GridContainer';
export { SplitPageLayout } from './SplitPageLayout/SplitPageLayout';
export type { SplitPageLayoutProps } from './SplitPageLayout/SplitPageLayout';
export { SplitPageSection } from './SplitPageLayout/SplitPageSection';
export type { SplitPageSectionProps } from './SplitPageLayout/SplitPageSection';
export { SplitPageHeader } from './SplitPageLayout/SplitPageHeader';
export type { SplitPageHeaderProps } from './SplitPageLayout/SplitPageHeader';
export { EntityFormPageLayout } from './SplitPageLayout/EntityFormPageLayout';
export type { EntityFormPageLayoutProps } from './SplitPageLayout/EntityFormPageLayout';
export { SplitPageFormField } from './SplitPageLayout/SplitPageFormField';
export type { SplitPageFormFieldProps } from './SplitPageLayout/SplitPageFormField';
export { splitPagePresets, splitPageDefaults, splitPageStyles } from './SplitPageLayout/fetcher';
export type { SplitPageVariant, SplitPageLayoutPreset } from './SplitPageLayout/fetcher';
export { splitPageLayoutFixtures } from './SplitPageLayout/fixture';
export { SplitPageLayoutTranslations } from './SplitPageLayout/translations';
export * from './Layout';

// Navigation Components
export * from './NavBar';
export * from './Sidebar';
export * from './Menu';
export * from './AIStudio';

// Form Components
export * from './Button';
export * from './Input';
export * from './TextArea';
export * from './Select';
export * from './Checkbox';
export * from './RadioGroup';
export * from './Switch';

// Authentication Components
export * from './Logout';

// Display Components
export * from './Chip';
export * from './Tag/Tag';
export * from './UserManagement';
export * from './CourseMenu';
export * from './Arrow';
export * from './BannerCarousel';
export * from './Form';
export * from './InputWithLabel';
export * from './LoginForm';
export * from './RegisterForm';
export { SocialLoginButtons } from './SocialLoginButtons/SocialLoginButtons';
export type { SocialProvider } from './SocialLoginButtons/types';
export * from './RegisterVisual';
export * from './EditProfile';

// Search and Navigation Components
export * from './SearchBar';
export * from './GlobalSearch';
export * from './CountryLanguageDropdown';

// Display Components
export * from './Heading';
export * from './Text';
export * from './Badge';
export * from './Kicker';
export * from './Carousel';
export * from './Accordion';
export * from './Card';
export * from './ProductCard';
export * from './ProductEdit';
export * from './Order';
export * from './Customer';
export * from './Timeline';
export * from './Modal';
export * from './ActionMenu';
export * from './Toolkit';
export * from './Table';
// Only the component is re-exported here -- TabItem/TabProps are intentionally not,
// since packages/ui/src/types.ts already defines a public TabItem shape (id/label/content/
// disabled) that Tab's own richer TabItem (+ icon/badge) would otherwise collide with via
// export *, per TS2308. Consumers needing the richer shape can import it directly from './Tab'.
export { Tab } from './Tab';
export * from './Todo';
export { TaskDetailDrawer } from './TaskDetailDrawer';
export type { TaskDetailDrawerProps, TaskActivityItem } from './TaskDetailDrawer';
export { ReminderEditor } from './ReminderEditor';
export type { ReminderEditorProps, TaskReminderItem, ReminderOffsetPreset } from './ReminderEditor';
export { RequiredFieldsEditor } from './RequiredFieldsEditor';
export type {
  RequiredFieldsEditorProps,
  TaskTemplateItem,
  TaskFieldDefinitionItem,
  TaskFieldValueItem,
} from './RequiredFieldsEditor';
export * from './TodoIcons';
export { TodoPageHeader } from './TodoPageHeader';
export type { TodoPageHeaderProps } from './TodoPageHeader';
export { TodoAddViewMenu } from './TodoAddViewMenu';
export type { TodoViewOption, TodoAddViewMenuProps } from './TodoAddViewMenu';
export { TodoViewTabs } from './TodoViewTabs';
export type { TodoViewTab, TodoToolbarAction, TodoViewTabsProps } from './TodoViewTabs';

// Dashboard Components
export * from './AdminDashboard';
export type { DashboardAction, DashboardActionHandler } from './AdminDashboard/dashboard-actions';
export * from './UserDashboard';

// Dashboard Layout Components
export * from './AdminDashboardLayout';
export * from './UserDashboardLayout';

// Standalone Chart Components
export * from './UserRetention';
export * from './EngagementBreakdown';
export * from './EngagementTrends';
export * from './RecentActivities';
export * from './LastSurvey';
export * from './PermissionRequest';

// Notification Components
export * from './Snackbar';

// Group Management Components (UI-163: pages use DataListPage — kept for embeds)
export * from './GroupCard';
export * from './GroupForm';
export * from './GroupMemberList';
// export * from './GroupDashboardCard'; // Temporarily disabled due to compilation issues

// Utility Components
export * from './NotFound';
export * from './Assets';
export * from './TenantDebug';
export * from './ErrorBoundary';

// Context Providers
export * from './context/GlobalContext';
export * from './context/ThemeContext';
export * from './context/UserContext';
export * from './context/NavigationContext';
export * from './context/NavTenantSwitchContext';

// Services
export * from './services/userService';

// Tenant Configuration
export {
  getTenantConfig,
  getAvailableTenants,
  getTenantAssets,
  type TenantConfig,
  type AvailableTenant,
} from './services/tenantService';

// Shared Types and Utilities
export * from './types';
export * from './theme';
export * from './ssr';
export { extractErrorMessage } from './utils/extractErrorMessage';
