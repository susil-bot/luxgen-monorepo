import type { StatusSectionProps } from './StatusSection';

export const statusSectionFixtures = {
  active: { status: 'PUBLISHED', onStatusChange: () => {} } satisfies StatusSectionProps,
  draft: { status: 'DRAFT', onStatusChange: () => {} } satisfies StatusSectionProps,
};
