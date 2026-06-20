/** Training-focused categories for the public storefront landing page */
export const TRAINING_CATEGORIES = [
  { id: 'leadership', label: 'Leadership' },
  { id: 'coaching', label: 'Coaching' },
  { id: 'business', label: 'Business' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'design', label: 'Design' },
  { id: 'development', label: 'Development' },
  { id: 'wellness', label: 'Wellness' },
  { id: 'finance', label: 'Finance' },
  { id: 'communication', label: 'Communication' },
  { id: 'productivity', label: 'Productivity' },
  { id: 'sales', label: 'Sales' },
  { id: 'mentorship', label: 'Mentorship' },
] as const;

export const STOREFRONT_TESTIMONIALS = [
  {
    id: '1',
    quote:
      'My mentor helped me launch a coaching practice in 90 days. The structured programs and live sessions made all the difference.',
    name: 'Sarah Chen',
    role: 'Executive coach · enrolled learner',
  },
  {
    id: '2',
    quote:
      'I sell cohort-based training here and the platform handles enrollment, payments, and learner progress — I focus on teaching.',
    name: 'Marcus Webb',
    role: 'Leadership trainer · course creator',
  },
] as const;

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

export function buildStorefrontStats(input: { instructorCount: number; courseCount: number; studentCount: number }) {
  const { instructorCount, courseCount, studentCount } = input;
  return [
    { label: 'Trainers & mentors', value: instructorCount || 12 },
    { label: 'Programs & courses', value: courseCount || 48 },
    { label: 'Active learners', value: studentCount || 1200 },
    { label: 'Community members', value: Math.max(studentCount * 8, 5000) },
  ];
}
