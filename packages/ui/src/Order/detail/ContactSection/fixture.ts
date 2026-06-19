import { orderFixtures } from '../../fixture';
import type { ContactSectionProps } from './ContactSection';

export const contactSectionFixtures = {
  default: { order: orderFixtures.detail } satisfies ContactSectionProps,
};
