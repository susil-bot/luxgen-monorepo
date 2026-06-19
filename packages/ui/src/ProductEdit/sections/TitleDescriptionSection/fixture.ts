import type { TitleDescriptionSectionProps } from './TitleDescriptionSection';

export const titleDescriptionFixtures = {
  default: {
    title: 'Introduction to Product Design',
    bodyHtml: '<p>Course overview and learning outcomes.</p>',
    onTitleChange: () => {},
    onBodyChange: () => {},
  } satisfies TitleDescriptionSectionProps,
};
