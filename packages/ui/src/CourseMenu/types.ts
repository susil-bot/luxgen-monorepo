export type UserRole = 'admin' | 'instructor' | 'learner' | 'user';

export interface CourseMenuItem {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  href?: string;
  onClick?: () => void;
  visible: UserRole[];
  children?: CourseMenuItem[];
  badge?: string | number;
  disabled?: boolean;
}

export interface CourseSection {
  id: string;
  title: string;
  description: string;
  visibility: UserRole[];
  items: CourseMenuItem[];
}

export interface CourseMenuProps {
  userRole: UserRole;
  courseId?: string;
  onNavigate?: (path: string) => void;
  className?: string;
}

export interface CourseOverviewProps {
  course: {
    id: string;
    title: string;
    description: string;
    instructor: string;
    duration: string;
    level: string;
    rating: number;
    enrolledCount: number;
    thumbnail: string;
  };
  userRole: UserRole;
  enrollmentStatus?: 'enrolled' | 'not_enrolled' | 'completed';
}

export interface CourseAnalyticsProps {
  courseId: string;
  userRole: UserRole;
  metrics: {
    totalEnrollments: number;
    completionRate: number;
    averageRating: number;
    engagementScore: number;
  };
}
