/**
 * Learnify-inspired catalog view models (MIT — UI adapted from alfredang/Learnify).
 * Data is sourced from LuxGen GraphQL, not Prisma.
 */

export interface LearnifyCategory {
  id: string;
  label: string;
  courseCount: number;
  href: string;
}

export interface LearnifyInstructor {
  id: string;
  name: string;
  role: string;
  courseCount: number;
}

export interface LearnifyCatalogCourse {
  id: string;
  title: string;
  description?: string;
  href: string;
  instructorName: string | null;
  priceLabel: string;
  isFree: boolean;
  studentCount: number;
  rating: number;
  reviewCount: number;
  category: string;
  kind: 'course' | 'product' | 'bundle';
  isFeatured?: boolean;
}

export interface LearnifyCatalogStats {
  courses: number;
  students: number;
  instructors: number;
  satisfactionLabel: string;
}

export interface LearnifyCatalog {
  featured: LearnifyCatalogCourse[];
  all: LearnifyCatalogCourse[];
  categories: LearnifyCategory[];
  instructors: LearnifyInstructor[];
  stats: LearnifyCatalogStats;
}
