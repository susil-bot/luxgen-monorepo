/** Raw shapes returned by LuxGen GraphQL (apps/web queries). */

export interface LuxgenCourseRecord {
  id: string;
  title: string;
  description?: string;
  status: string;
  instructor?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  students?: { id: string }[];
}

export interface LuxgenProductRecord {
  id: string;
  title: string;
  description?: string;
  status?: string;
  category?: string;
  priceCents: number;
  currency: string;
  instructorName?: string;
  enrollmentCount?: number;
}

export interface LuxgenBundleRecord {
  id: string;
  title: string;
  description?: string;
  slug?: string;
  priceCents: number;
  currency: string;
  status?: string;
}

export interface LuxgenCollectionRecord {
  id: string;
  name: string;
  description?: string;
  memberCount?: number;
}
