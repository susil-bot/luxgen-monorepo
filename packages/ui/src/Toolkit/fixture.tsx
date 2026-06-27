import React from 'react';
import { type ToolkitProps, type ToolkitItem } from './Toolkit';
import { defaultTheme } from '../theme';

const AddIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path
      d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path
      d="M2 4h10M5 4V2h4v2M5.5 6.5v4M8.5 6.5v4M3 4l1 8h6l1-8"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const iconItems: ToolkitItem[] = [
  { id: 'add', label: 'Add', icon: <AddIcon /> },
  { id: 'edit', label: 'Edit', icon: <EditIcon /> },
  { id: 'delete', label: 'Delete', icon: <TrashIcon />, destructive: true },
];

const plainItems: ToolkitItem[] = [
  { id: 'add', label: 'Add' },
  { id: 'edit', label: 'Edit' },
  { id: 'delete', label: 'Delete', destructive: true },
];

export const toolkitFixtures = {
  default: {
    tenantTheme: defaultTheme,
    items: plainItems,
    ariaLabel: 'Page actions',
  } satisfies ToolkitProps,

  compact: {
    tenantTheme: defaultTheme,
    items: plainItems,
    size: 'small' as const,
    ariaLabel: 'Compact toolkit',
  } satisfies ToolkitProps,

  withIcons: {
    tenantTheme: defaultTheme,
    items: iconItems,
    ariaLabel: 'Toolkit with icons',
  } satisfies ToolkitProps,

  withActive: {
    tenantTheme: defaultTheme,
    items: plainItems.map((item) => ({ ...item, active: item.id === 'edit' })),
    ariaLabel: 'Toolkit with active tool',
  } satisfies ToolkitProps,

  withDisabled: {
    tenantTheme: defaultTheme,
    items: plainItems.map((item) => ({ ...item, disabled: item.id === 'delete' })),
    ariaLabel: 'Toolkit with disabled action',
  } satisfies ToolkitProps,

  empty: {
    tenantTheme: defaultTheme,
    items: [],
    ariaLabel: 'Empty toolkit',
  } satisfies ToolkitProps,

  withCustomTheme: {
    tenantTheme: { ...defaultTheme, colors: { ...defaultTheme.colors, primary: '#8B5CF6' } },
    items: plainItems,
    ariaLabel: 'Custom themed toolkit',
  } satisfies ToolkitProps,
};
