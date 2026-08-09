import React from 'react';

/**
 * Small outline icon set for the Todo List page (view-switcher tabs, the "Add a
 * new view" menu, and the toolbar). Hand-rolled SVGs, no icon library dependency
 * -- same raw-SVG convention already used by TodoStatsChart in Todo.tsx.
 */
export interface TodoIconProps {
  size?: number;
  className?: string;
}

const svgProps = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 16 16',
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true as const,
});

export const TodoToDoIcon: React.FC<TodoIconProps> = ({ size = 16, className }) => (
  <svg {...svgProps(size)} className={className}>
    <rect x="1.5" y="1.5" width="4" height="4" rx="1" />
    <path d="M7 3.5H14.5" />
    <rect x="1.5" y="6.5" width="4" height="4" rx="1" />
    <path d="M7 8.5H14.5" />
    <rect x="1.5" y="11.5" width="4" height="4" rx="1" />
    <path d="M7 13.5H14.5" />
  </svg>
);

export const TodoDoneIcon: React.FC<TodoIconProps> = ({ size = 16, className }) => (
  <svg {...svgProps(size)} className={className}>
    <rect x="1.5" y="1.5" width="13" height="13" rx="2.5" />
    <path d="M4.5 8.2L6.8 10.5L11.5 5.5" />
  </svg>
);

export const TodoBoardIcon: React.FC<TodoIconProps> = ({ size = 16, className }) => (
  <svg {...svgProps(size)} className={className}>
    <rect x="1.5" y="1.5" width="13" height="13" rx="1.5" />
    <path d="M5.83 1.5V14.5" />
    <path d="M10.17 1.5V14.5" />
  </svg>
);

export const TodoChartIcon: React.FC<TodoIconProps> = ({ size = 16, className }) => (
  <svg {...svgProps(size)} className={className}>
    <path d="M8 1.5A6.5 6.5 0 1 1 1.98 5.7" strokeLinecap="round" />
    <path d="M8 1.5V8L3.2 11.4" />
  </svg>
);

export const TodoGalleryIcon: React.FC<TodoIconProps> = ({ size = 16, className }) => (
  <svg {...svgProps(size)} className={className}>
    <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1" />
    <rect x="9" y="1.5" width="5.5" height="5.5" rx="1" />
    <rect x="1.5" y="9" width="5.5" height="5.5" rx="1" />
    <rect x="9" y="9" width="5.5" height="5.5" rx="1" />
  </svg>
);

export const TodoTableIcon: React.FC<TodoIconProps> = ({ size = 16, className }) => (
  <svg {...svgProps(size)} className={className}>
    <rect x="1.5" y="2.5" width="13" height="11" rx="1.5" />
    <path d="M1.5 6.5H14.5" />
    <path d="M6 2.5V13.5" />
    <path d="M10.5 2.5V13.5" />
  </svg>
);

export const TodoListViewIcon: React.FC<TodoIconProps> = ({ size = 16, className }) => (
  <svg {...svgProps(size)} className={className}>
    <circle cx="2.5" cy="3.5" r="1" fill="currentColor" stroke="none" />
    <path d="M5.5 3.5H14.5" />
    <circle cx="2.5" cy="8" r="1" fill="currentColor" stroke="none" />
    <path d="M5.5 8H14.5" />
    <circle cx="2.5" cy="12.5" r="1" fill="currentColor" stroke="none" />
    <path d="M5.5 12.5H14.5" />
  </svg>
);

export const TodoDashboardIcon: React.FC<TodoIconProps> = ({ size = 16, className }) => (
  <svg {...svgProps(size)} className={className}>
    <rect x="1.5" y="1.5" width="7" height="4.5" rx="1" />
    <rect x="1.5" y="8" width="4.5" height="6.5" rx="1" />
    <rect x="8.5" y="1.5" width="6" height="9" rx="1" />
    <rect x="6.5" y="10.5" width="8" height="4" rx="1" />
  </svg>
);

export const TodoTimelineIcon: React.FC<TodoIconProps> = ({ size = 16, className }) => (
  <svg {...svgProps(size)} className={className}>
    <path d="M1.5 3H9" />
    <path d="M1.5 8H14.5" />
    <path d="M1.5 13H6.5" />
  </svg>
);

export const TodoFeedIcon: React.FC<TodoIconProps> = ({ size = 16, className }) => (
  <svg {...svgProps(size)} className={className}>
    <rect x="2.5" y="1.5" width="11" height="13" rx="1.5" />
    <path d="M5 5H11" />
    <path d="M5 8H11" />
    <path d="M5 11H8.5" />
  </svg>
);

export const TodoMapIcon: React.FC<TodoIconProps> = ({ size = 16, className }) => (
  <svg {...svgProps(size)} className={className}>
    <path d="M1.5 3.5L5.5 1.5L10.5 3.5L14.5 1.5V12.5L10.5 14.5L5.5 12.5L1.5 14.5V3.5Z" />
    <path d="M5.5 1.5V12.5" />
    <path d="M10.5 3.5V14.5" />
  </svg>
);

export const TodoCalendarIcon: React.FC<TodoIconProps> = ({ size = 16, className }) => (
  <svg {...svgProps(size)} className={className}>
    <rect x="1.5" y="2.5" width="13" height="12" rx="1.5" />
    <path d="M1.5 6H14.5" />
    <path d="M4.5 1.5V3.5" />
    <path d="M11.5 1.5V3.5" />
    <rect x="4" y="8" width="2.5" height="2.5" fill="currentColor" stroke="none" />
  </svg>
);

export const TodoFormIcon: React.FC<TodoIconProps> = ({ size = 16, className }) => (
  <svg {...svgProps(size)} className={className}>
    <rect x="2.5" y="1.5" width="9" height="13" rx="1.5" />
    <path d="M5 5H9" />
    <path d="M5 8H9" />
    <path d="M11 11.5L14.5 8L13 6.5L9.5 10V11.5Z" />
  </svg>
);

export const TodoPlusIcon: React.FC<TodoIconProps> = ({ size = 16, className }) => (
  <svg {...svgProps(size)} className={className}>
    <path d="M8 2.5V13.5" />
    <path d="M2.5 8H13.5" />
  </svg>
);

export const TodoFilterIcon: React.FC<TodoIconProps> = ({ size = 16, className }) => (
  <svg {...svgProps(size)} className={className}>
    <path d="M1.5 2.5H14.5L9.5 8.3V13.5L6.5 12V8.3L1.5 2.5Z" />
  </svg>
);

export const TodoSortIcon: React.FC<TodoIconProps> = ({ size = 16, className }) => (
  <svg {...svgProps(size)} className={className}>
    <path d="M4.5 13.5V2.5" />
    <path d="M2 5L4.5 2.5L7 5" />
    <path d="M11.5 2.5V13.5" />
    <path d="M9 11L11.5 13.5L14 11" />
  </svg>
);

export const TodoBoltIcon: React.FC<TodoIconProps> = ({ size = 16, className }) => (
  <svg {...svgProps(size)} className={className}>
    <path d="M8.5 1.5L2.5 9H7L6 14.5L13 7H8.5L8.5 1.5Z" strokeLinejoin="round" />
  </svg>
);

export const TodoSparkleIcon: React.FC<TodoIconProps> = ({ size = 16, className }) => (
  <svg {...svgProps(size)} className={className}>
    <path d="M8 1.5L9.3 6.2L14 7.5L9.3 8.8L8 13.5L6.7 8.8L2 7.5L6.7 6.2L8 1.5Z" strokeLinejoin="round" />
  </svg>
);

export const TodoSearchIcon: React.FC<TodoIconProps> = ({ size = 16, className }) => (
  <svg {...svgProps(size)} className={className}>
    <circle cx="7" cy="7" r="5" />
    <path d="M10.8 10.8L14.5 14.5" />
  </svg>
);

export const TodoSlidersIcon: React.FC<TodoIconProps> = ({ size = 16, className }) => (
  <svg {...svgProps(size)} className={className}>
    <path d="M2 4.5H14" />
    <path d="M2 8H14" />
    <path d="M2 11.5H14" />
    <circle cx="5.5" cy="4.5" r="1.4" fill="currentColor" stroke="none" />
    <circle cx="10.5" cy="8" r="1.4" fill="currentColor" stroke="none" />
    <circle cx="6.5" cy="11.5" r="1.4" fill="currentColor" stroke="none" />
  </svg>
);

export const TodoChevronDownIcon: React.FC<TodoIconProps> = ({ size = 16, className }) => (
  <svg {...svgProps(size)} className={className}>
    <path d="M4 6L8 10L12 6" />
  </svg>
);

export const TodoLinkIcon: React.FC<TodoIconProps> = ({ size = 16, className }) => (
  <svg {...svgProps(size)} className={className}>
    <path d="M6.5 9.5L9.5 6.5" />
    <path d="M7.5 4.5L9 3C10.1 1.9 11.9 1.9 13 3C14.1 4.1 14.1 5.9 13 7L11.5 8.5" />
    <path d="M8.5 11.5L7 13C5.9 14.1 4.1 14.1 3 13C1.9 11.9 1.9 10.1 3 9L4.5 7.5" />
  </svg>
);

export const TodoStarIcon: React.FC<TodoIconProps & { filled?: boolean }> = ({ size = 16, className, filled }) => (
  <svg {...svgProps(size)} className={className} fill={filled ? 'currentColor' : 'none'}>
    <path d="M8 1.8L9.9 5.9L14.3 6.5L11.1 9.5L11.9 13.9L8 11.8L4.1 13.9L4.9 9.5L1.7 6.5L6.1 5.9L8 1.8Z" strokeLinejoin="round" />
  </svg>
);

export const TodoMoreIcon: React.FC<TodoIconProps> = ({ size = 16, className }) => (
  <svg {...svgProps(size)} className={className} stroke="none" fill="currentColor">
    <circle cx="3" cy="8" r="1.3" />
    <circle cx="8" cy="8" r="1.3" />
    <circle cx="13" cy="8" r="1.3" />
  </svg>
);

export const TodoLockIcon: React.FC<TodoIconProps> = ({ size = 16, className }) => (
  <svg {...svgProps(size)} className={className}>
    <rect x="3" y="7" width="10" height="7" rx="1.5" />
    <path d="M5 7V5C5 3.3 6.3 2 8 2C9.7 2 11 3.3 11 5V7" />
  </svg>
);

export const TodoLayersIcon: React.FC<TodoIconProps> = ({ size = 16, className }) => (
  <svg {...svgProps(size)} className={className}>
    <path d="M8 1.5L14.5 5L8 8.5L1.5 5L8 1.5Z" strokeLinejoin="round" />
    <path d="M1.5 8.5L8 12L14.5 8.5" strokeLinejoin="round" />
    <path d="M1.5 11.5L8 15L14.5 11.5" strokeLinejoin="round" />
  </svg>
);
