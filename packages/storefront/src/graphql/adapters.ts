import type { StorefrontRouteSettings } from '../types';
import type { LearnifyCatalog, LearnifyCatalogCourse, LearnifyCategory, LearnifyInstructor } from '../learnify/types';
import type {
  LuxgenBundleRecord,
  LuxgenCollectionRecord,
  LuxgenCourseRecord,
  LuxgenProductRecord,
} from './luxgen-types';

function pseudoRating(seed: string): { rating: number; reviews: number } {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash + seed.charCodeAt(i) * (i + 1)) % 997;
  return { rating: 4.5 + (hash % 5) / 10, reviews: 40 + (hash % 160) };
}

function formatPrice(cents: number, currency: string): string {
  if (cents <= 0) return 'Free';
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency || 'USD' }).format(cents / 100);
  } catch {
    return `$${(cents / 100).toFixed(2)}`;
  }
}

function instructorName(course: LuxgenCourseRecord): string | null {
  if (!course.instructor) return null;
  return `${course.instructor.firstName} ${course.instructor.lastName}`.trim();
}

export function filterPublishedCourses(courses: LuxgenCourseRecord[]): LuxgenCourseRecord[] {
  return courses.filter((c) => c.status === 'PUBLISHED');
}

export interface BuildLearnifyCatalogInput {
  courses: LuxgenCourseRecord[];
  products: LuxgenProductRecord[];
  bundles?: LuxgenBundleRecord[];
  collections?: LuxgenCollectionRecord[];
  routes: StorefrontRouteSettings;
  profileCategories?: Array<{ id: string; label: string }>;
}

export function buildLearnifyCatalog(input: BuildLearnifyCatalogInput): LearnifyCatalog {
  const { courses, products, bundles = [], collections = [], routes, profileCategories = [] } = input;
  const published = filterPublishedCourses(courses);
  const coursesBase = routes.courses.replace(/\/$/, '');
  const programsBase = routes.programs.replace(/\/$/, '');

  const fromProducts: LearnifyCatalogCourse[] = products.map((product) => {
    const { rating, reviews } = pseudoRating(product.id);
    const free = product.priceCents <= 0;
    return {
      id: product.id,
      title: product.title,
      description: product.description,
      href: `${programsBase}/${product.id}`,
      instructorName: product.instructorName ?? null,
      priceLabel: formatPrice(product.priceCents, product.currency),
      isFree: free,
      studentCount: product.enrollmentCount ?? 0,
      rating,
      reviewCount: reviews + (product.enrollmentCount ?? 0),
      category: product.category ?? 'Program',
      kind: 'product',
    };
  });

  // storefrontProducts are course-backed — skip courses already represented as products
  const productIds = new Set(fromProducts.map((p) => p.id));
  const fromCourses: LearnifyCatalogCourse[] = published
    .filter((course) => !productIds.has(course.id))
    .map((course) => {
      const { rating, reviews } = pseudoRating(course.id);
      return {
        id: course.id,
        title: course.title,
        description: course.description,
        href: `${coursesBase}/courses/${course.id}`,
        instructorName: instructorName(course),
        priceLabel: 'Enroll',
        isFree: true,
        studentCount: course.students?.length ?? 0,
        rating,
        reviewCount: reviews,
        category: 'Training',
        kind: 'course',
      };
    });

  const fromBundles: LearnifyCatalogCourse[] = bundles.map((bundle) => {
    const { rating, reviews } = pseudoRating(bundle.id);
    const free = bundle.priceCents <= 0;
    return {
      id: bundle.id,
      title: bundle.title,
      description: bundle.description,
      href: `/store/bundles/${bundle.id}`,
      instructorName: null,
      priceLabel: formatPrice(bundle.priceCents, bundle.currency),
      isFree: free,
      studentCount: 0,
      rating,
      reviewCount: reviews,
      category: 'Bundle',
      kind: 'bundle',
      isFeatured: true,
    };
  });

  const all = [...fromCourses, ...fromProducts, ...fromBundles];
  const featured = all.filter((c) => c.isFeatured).slice(0, 8);
  const displayFeatured = featured.length > 0 ? featured : all.slice(0, 8);

  const categoryCounts = new Map<string, number>();
  all.forEach((c) => categoryCounts.set(c.category, (categoryCounts.get(c.category) ?? 0) + 1));

  const categories: LearnifyCategory[] =
    collections.length > 0
      ? collections.map((col) => ({
          id: col.id,
          label: col.name,
          courseCount: col.memberCount ?? 0,
          href: routes.courses,
        }))
      : profileCategories.map((cat) => ({
          id: cat.id,
          label: cat.label,
          courseCount: categoryCounts.get(cat.label) ?? 0,
          href: routes.courses,
        }));

  const instructorMap = new Map<string, LearnifyInstructor>();
  published.forEach((course) => {
    if (!course.instructor) return;
    const name = instructorName(course);
    if (!name) return;
    const existing = instructorMap.get(course.instructor.id);
    if (existing) {
      existing.courseCount += 1;
    } else {
      instructorMap.set(course.instructor.id, {
        id: course.instructor.id,
        name,
        role: 'Course instructor',
        courseCount: 1,
      });
    }
  });
  products.forEach((product) => {
    if (!product.instructorName) return;
    const key = product.instructorName.toLowerCase();
    if (instructorMap.has(key)) return;
    instructorMap.set(key, {
      id: key,
      name: product.instructorName,
      role: 'Mentor & trainer',
      courseCount: 1,
    });
  });

  const studentCount = all.reduce((sum, c) => sum + c.studentCount, 0);

  return {
    featured: displayFeatured,
    all,
    categories,
    instructors: Array.from(instructorMap.values()),
    stats: {
      courses: all.length,
      students: studentCount || 1200,
      instructors: instructorMap.size || 12,
      satisfactionLabel: '95%',
    },
  };
}
