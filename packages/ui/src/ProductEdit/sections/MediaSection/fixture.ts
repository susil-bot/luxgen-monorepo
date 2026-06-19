import type { MediaSectionProps } from './MediaSection';

export const mediaSectionFixtures = {
  empty: {} satisfies MediaSectionProps,
  withThumbnail: { thumbnailUrl: '/placeholder-course.png' } satisfies MediaSectionProps,
};
