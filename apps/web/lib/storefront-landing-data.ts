import type { StorefrontStatsLabels } from '@luxgen/storefront';
import { DEFAULT_STOREFRONT_CONTENT } from '@luxgen/storefront';

export interface StorefrontInstructor {
  id: string;
  name: string;
  role: string;
}

export interface StorefrontCourseCard {
  id: string;
  title: string;
  category: string;
  instructorName: string | null;
  priceLabel: string;
  rating: number;
  reviewCount: number;
  href: string;
  kind: 'course' | 'product';
}

export function buildStorefrontStats(
  input: { instructorCount: number; courseCount: number; studentCount: number },
  labels: StorefrontStatsLabels = DEFAULT_STOREFRONT_CONTENT.stats,
) {
  const { instructorCount, courseCount, studentCount } = input;
  return [
    { label: labels.trainers, value: instructorCount || 12 },
    { label: labels.programs, value: courseCount || 48 },
    { label: labels.learners, value: studentCount || 1200 },
    { label: labels.community, value: Math.max(studentCount * 8, 5000) },
  ];
}
