import { CourseMenuItem, CourseSection, UserRole } from './types';

// Main course menu sections
export const courseMenuSections: CourseSection[] = [
  {
    id: 'catalog',
    title: 'Course Catalog',
    description: 'Browse and discover courses',
    visibility: ['admin', 'instructor', 'learner', 'user'],
    items: [
      {
        id: 'all-courses',
        label: 'All Courses',
        description: 'Browse all available courses with filters and search',
        icon: '📚',
        href: '/courses',
        visible: ['admin', 'instructor', 'learner', 'user'],
      },
      {
        id: 'my-courses',
        label: 'My Courses',
        description: 'Courses you are enrolled in',
        icon: '🎓',
        href: '/courses/my-courses',
        visible: ['learner', 'user'],
      },
      {
        id: 'manage-courses',
        label: 'Manage Courses',
        description: 'Create and manage your courses',
        icon: '⚙️',
        href: '/courses/manage',
        visible: ['admin', 'instructor'],
      },
    ],
  },
  {
    id: 'course-details',
    title: 'Course Details',
    description: 'Course content and management',
    visibility: ['admin', 'instructor', 'learner', 'user'],
    items: [
      {
        id: 'course-player',
        label: 'Course Player',
        description: 'View course content and videos',
        icon: '▶️',
        href: '/courses/[id]',
        visible: ['admin', 'instructor', 'learner', 'user'],
      },
      {
        id: 'course-analytics',
        label: 'Course Analytics',
        description: 'View completion rates and engagement metrics',
        icon: '📊',
        href: '/courses/[id]/analytics',
        visible: ['admin', 'instructor'],
      },
    ],
  },
  {
    id: 'interactions',
    title: 'Interactions',
    description: 'Course interactions and feedback',
    visibility: ['admin', 'instructor', 'learner', 'user'],
    items: [
      {
        id: 'reviews',
        label: 'Course Reviews',
        description: 'View and manage course reviews',
        icon: '⭐',
        href: '/courses/[id]/reviews',
        visible: ['admin', 'instructor', 'learner', 'user'],
      },
      {
        id: 'assignments',
        label: 'Assignments & Quizzes',
        description: 'Submit or grade course activities',
        icon: '📝',
        href: '/courses/[id]/assignments',
        visible: ['admin', 'instructor', 'learner', 'user'],
      },
      {
        id: 'certificates',
        label: 'Certificates',
        description: 'Generate or verify completion certificates',
        icon: '🏆',
        href: '/courses/[id]/certificates',
        visible: ['admin', 'instructor', 'learner', 'user'],
      },
    ],
  },
];

// Course detail menu items (for individual course pages)
export const getCourseDetailMenu = (courseId: string, userRole: UserRole): CourseMenuItem[] => {
  const baseItems: CourseMenuItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      description: 'Course intro, syllabus, instructor info',
      icon: '📋',
      href: `/courses/${courseId}`,
      visible: ['admin', 'instructor', 'learner', 'user'],
    },
    {
      id: 'modules',
      label: 'Modules / Lessons',
      description: 'Structured list of course contents',
      icon: '📖',
      href: `/courses/${courseId}/modules`,
      visible: ['admin', 'instructor', 'learner', 'user'],
    },
    {
      id: 'assignments',
      label: 'Assignments / Quizzes',
      description: 'View and submit course activities',
      icon: '📝',
      href: `/courses/${courseId}/assignments`,
      visible: ['admin', 'instructor', 'learner', 'user'],
    },
    {
      id: 'discussions',
      label: 'Discussions / Forum',
      description: 'Ask questions, interact with peers',
      icon: '💬',
      href: `/courses/${courseId}/discussions`,
      visible: ['admin', 'instructor', 'learner', 'user'],
    },
    {
      id: 'resources',
      label: 'Resources / Downloads',
      description: 'PDFs, reference materials',
      icon: '📁',
      href: `/courses/${courseId}/resources`,
      visible: ['admin', 'instructor', 'learner', 'user'],
    },
    {
      id: 'progress',
      label: 'Progress',
      description: 'View own progress & completion',
      icon: '📈',
      href: `/courses/${courseId}/progress`,
      visible: ['learner', 'user'],
    },
    {
      id: 'notes',
      label: 'Notes',
      description: 'Private study notes',
      icon: '📝',
      href: `/courses/${courseId}/notes`,
      visible: ['learner', 'user'],
    },
    {
      id: 'certificate',
      label: 'Certificate',
      description: 'Download or view certificate',
      icon: '🏆',
      href: `/courses/${courseId}/certificate`,
      visible: ['admin', 'instructor', 'learner', 'user'],
    },
    {
      id: 'feedback',
      label: 'Feedback',
      description: 'Rate the course or submit feedback',
      icon: '⭐',
      href: `/courses/${courseId}/feedback`,
      visible: ['learner', 'user'],
    },
  ];

  return baseItems.filter((item) => item.visible.includes(userRole));
};

// Admin/Instructor course management menu
export const getCourseManagementMenu = (courseId: string, userRole: UserRole): CourseMenuItem[] => {
  const managementItems: CourseMenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      description: 'Overview of course metrics',
      icon: '📊',
      href: `/courses/${courseId}/admin/dashboard`,
      visible: ['admin', 'instructor'],
    },
    {
      id: 'create-edit',
      label: 'Create / Edit Course',
      description: 'Form to add metadata, content, and structure',
      icon: '✏️',
      href: `/courses/${courseId}/admin/edit`,
      visible: ['admin', 'instructor'],
    },
    {
      id: 'modules-manager',
      label: 'Modules / Lessons Manager',
      description: 'Add, edit, reorder lessons',
      icon: '📚',
      href: `/courses/${courseId}/admin/modules`,
      visible: ['admin', 'instructor'],
    },
    {
      id: 'assignments-manager',
      label: 'Assignments & Quizzes Manager',
      description: 'Create or grade assessments',
      icon: '📝',
      href: `/courses/${courseId}/admin/assignments`,
      visible: ['admin', 'instructor'],
    },
    {
      id: 'enrollments',
      label: 'Enrollments',
      description: "Manage who's enrolled (invite/remove users)",
      icon: '👥',
      href: `/courses/${courseId}/admin/enrollments`,
      visible: ['admin', 'instructor'],
    },
    {
      id: 'certificates-setup',
      label: 'Certificates Setup',
      description: 'Configure certificate templates and rules',
      icon: '🏆',
      href: `/courses/${courseId}/admin/certificates`,
      visible: ['admin', 'instructor'],
    },
    {
      id: 'discussions-moderation',
      label: 'Discussions Moderation',
      description: 'Moderate Q&A or forum comments',
      icon: '💬',
      href: `/courses/${courseId}/admin/discussions`,
      visible: ['admin', 'instructor'],
    },
    {
      id: 'reports',
      label: 'Reports / Analytics',
      description: 'User progress, completion rates',
      icon: '📊',
      href: `/courses/${courseId}/admin/reports`,
      visible: ['admin', 'instructor'],
    },
    {
      id: 'settings',
      label: 'Settings',
      description: 'Course visibility, price, prerequisites',
      icon: '⚙️',
      href: `/courses/${courseId}/admin/settings`,
      visible: ['admin', 'instructor'],
    },
    {
      id: 'integrations',
      label: 'Integrations',
      description: 'SCORM / xAPI / video platform connectors',
      icon: '🔗',
      href: `/courses/${courseId}/admin/integrations`,
      visible: ['admin', 'instructor'],
    },
  ];

  return managementItems.filter((item) => item.visible.includes(userRole));
};

// Helper function to get menu items based on user role
export const getMenuItemsForRole = (userRole: UserRole, courseId?: string): CourseMenuItem[] => {
  const allItems: CourseMenuItem[] = [];

  courseMenuSections.forEach((section) => {
    if (section.visibility.includes(userRole)) {
      allItems.push(...section.items.filter((item) => item.visible.includes(userRole)));
    }
  });

  return allItems;
};

// Helper function to check if user has access to a specific menu item
export const hasAccessToMenuItem = (itemId: string, userRole: UserRole): boolean => {
  const allItems = getMenuItemsForRole(userRole);
  return allItems.some((item) => item.id === itemId);
};
