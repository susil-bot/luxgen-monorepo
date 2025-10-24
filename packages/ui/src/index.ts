// Layout Components
export * from './PageWrapper';
export * from './Header';
export * from './Sidebar';
export * from './Footer';
export * from './GridContainer';

// Form Components
export * from './Button';
export * from './Input';
export * from './TextArea';
export * from './Select';
export * from './Checkbox';
export * from './RadioGroup';
export * from './Switch';
export * from './Form';
export * from './InputWithLabel';
export * from './LoginForm';
export * from './RegisterForm';
export * from './Snackbar';
export * from './NavBar';
export * from './Sidebar';
export * from './GroupCard';
export * from './GroupForm';
export * from './GroupMemberList';
// export * from './GroupDashboardCard';
export * from './Menu';
export * from './Layout';

// Display Components
export * from './Heading';
export * from './Text';
export * from './Badge';
export * from './Kicker';
export * from './Carousel';
export * from './Accordion';
export * from './Card';
export * from './Modal';
export * from './Table';

// Shared Types and Utilities
export * from './types';
export * from './theme';
export * from './ssr';


// #TODO: Add more components live 
// kicker component
// carousel component
// accordion component
// tabs component
// tooltip component
// popover component
// drawer component
// modal component
// alert component
// badge component
// breadcrumb component
// // button component
// CUSTOM COMPONENT LIST
// 2.1 Layout Components
// Component	Purpose	Key Props
// PageWrapper	Main wrapper per page	tenantTheme, className, padding?: string, children
// Header	Top bar with logo & navigation	tenantTheme, logoUrl, menuItems, onMenuClick
// Sidebar	Collapsible side navigation	tenantTheme, menuItems, collapsed?: boolean, onToggle?
// Footer	Footer info	tenantTheme, links, copyright
// GridContainer	Responsive grid	columns?: number, gap?: string, children
// Card	Content container	tenantTheme, title, description, icon, children, onClick?
// 2.2 Form & Input Components
// Component	Purpose	Key Props
// Input	Text input	value, onChange, placeholder, disabled, type, tenantTheme, error?
// TextArea	Multi-line input	value, onChange, rows, placeholder, tenantTheme, error?
// Select	Dropdown	options, value, onChange, disabled, tenantTheme, multi?: boolean
// Checkbox	Checkbox input	checked, onChange, label, tenantTheme, disabled
// RadioGroup	Group of radio buttons	options, value, onChange, tenantTheme
// Switch	Toggle input	checked, onChange, tenantTheme
// Button	Clickable button	label, onClick, `variant?: 'primary'
// Form	Form wrapper	onSubmit, children, tenantTheme
// InputWithLabel	Label + Input combo	label, value, onChange, tenantTheme, error?
// 2.3 Display & Typography Components
// Component	Purpose	Key Props
// Heading	h1-h6 title	level, text, tenantTheme, className
// Text	Paragraph	text, tenantTheme, `variant?: 'normal'
// Badge	Small label	text, `variant?: 'info'
// Avatar	User picture	src, alt, size?: number, tenantTheme
// Tag	Colored label	text, color, tenantTheme
// 2.4 Table & List Components
// Component	Purpose	Key Props
// Table	Data table	columns, rows, sortable?, pagination?, tenantTheme
// TableRow	Row	data, selected?, onClick?, tenantTheme
// TableCell	Cell	data, align?, tenantTheme
// List	Vertical list	items, renderItem, tenantTheme
// ListItem	Single item	data, onClick?, tenantTheme
// 2.5 Navigation & Interaction Components
// Component	Purpose	Key Props
// Tabs	Tab navigation	tabs, activeTab, onChange, tenantTheme
// TabPanel	Tab content	children, tenantTheme
// Breadcrumb	Page breadcrumbs	items, tenantTheme
// Pagination	Page navigation	currentPage, totalPages, onPageChange, tenantTheme
// Modal	Overlay modal	isOpen, onClose, title, children, tenantTheme
// Popover	Small popup	content, trigger, tenantTheme
// Tooltip	Hover tip	content, position, tenantTheme
// 2.6 Presentation / Training Specific Components
// Component	Purpose	Key Props
// Slide	Single slide	content, `type: 'text'
// SlideDeck	Collection of slides	slides, currentSlide, onSlideChange, tenantTheme
// QrCode	Live session QR	value, size, tenantTheme
// Poll	Live audience poll	question, options, onVote, tenantTheme
// SurveyForm	Pre/Post survey	questions, onSubmit, tenantTheme
// TrainingCard	Training summary	title, date, status, tenantTheme
// ProgressTracker	Training progress bar	completed, total, tenantTheme
// 2.7 Article & Content Components
// Component	Purpose	Key Props
// ArticleCard	Article preview	title, author, date, summary, tenantTheme
// ArticleList	List of articles	articles, renderItem, tenantTheme
// ArticleEditor	WYSIWYG editor	value, onChange, tenantTheme
// SeoMeta	SEO metadata wrapper	title, description, keywords, tenantTheme
// 2.8 Notification / Nudge Components
// Component	Purpose	Key Props
// Toast	Small popup message	message, `type?: 'success'
// Alert	Inline alert	message, variant, tenantTheme
// NudgeCard	Training nudge / reminder	message, actionLabel?, onAction?, tenantTheme
// 2.9 Global Props Summary
// Prop Name	Type	Description
// tenantTheme	TenantTheme	Theme object: colors, fonts, branding
// className	string	Additional CSS class
// style	React.CSSProperties	Inline style
// id	string	Unique DOM ID
// dataTestId	string	Testing selector
// children	ReactNode	Nested content
// disabled	boolean	Disabled state
// loading	boolean	Loading spinner state
// onClick	(e) => void	Click handler
// onChange	(value) => void	Change handler
// variant	string	Style variant: primary, secondary, info, etc.
// size	string	Component size: sm/md/lg