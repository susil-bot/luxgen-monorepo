/** GraphQL documents for usage and enrollment — mirrors web queries */

export const TENANT_USAGE = `
  query TenantUsage($tenantId: String!) {
    tenantUsage(tenantId: $tenantId) {
      tenantId
      period
      plan
      automationRuns
      activeLearners
      agentTasks
      automationCount
      limits {
        maxLearners
        maxAutomations
        maxAutomationRunsPerMonth
      }
      percentUsed {
        automationRuns
        activeLearners
      }
      withinLimits {
        automationRuns
        activeLearners
        automations
      }
    }
  }
`;

export const LIST_ENROLLMENTS = `
  query ListEnrollments($tenantId: ID!) {
    enrollments(tenantId: $tenantId) {
      id
      courseId
      studentId
      notes
      paymentStatus
      progressPercent
      learningStatus
      lastAccessedAt
      completedAt
      paidAt
      cancelledAt
      enrolledAt
    }
  }
`;

export const GET_ENROLLMENT_BY_ID = `
  query GetEnrollmentById($id: ID!) {
    enrollmentById(id: $id) {
      id
      courseId
      studentId
      notes
      paymentStatus
      progressPercent
      learningStatus
      lastAccessedAt
      completedAt
      paidAt
      cancelledAt
      enrolledAt
    }
  }
`;

export const LIST_CUSTOMERS = `
  query ListCustomers($tenantId: ID!) {
    customers(tenantId: $tenantId) {
      id
      email
      firstName
      lastName
      phone
      marketingEmail
      staffNotes
      createdAt
    }
  }
`;

export const GET_LEARNER_DASHBOARD = `
  query GetLearnerDashboard($tenantId: ID!, $studentId: ID) {
    learnerDashboard(tenantId: $tenantId, studentId: $studentId) {
      studentId
      stats {
        enrolledCount
        inProgressCount
        completedCount
        certificateCount
      }
      courses {
        enrollmentId
        courseId
        courseTitle
        instructorName
        progressPercent
        learningStatus
        lastAccessedAt
        completedAt
        enrolledAt
        paymentStatus
      }
      subscriptions {
        id
        status
        currentPeriodEnd
        bundle {
          id
          title
        }
      }
    }
  }
`;

export const CUSTOMER_SEGMENTS = `
  query CustomerSegments($tenantId: ID!) {
    customerSegments(tenantId: $tenantId) {
      segment
      label
      customerCount
      orderCount
      avgProgressPercent
    }
  }
`;

export const CUSTOMERS_IN_SEGMENT = `
  query CustomersInSegment($tenantId: ID!, $segment: CustomerSegmentId!) {
    customersInSegment(tenantId: $tenantId, segment: $segment) {
      customerId
      customerName
      customerEmail
      orderCount
      lastOrderAt
      totalPaidCents
      avgProgressPercent
      segment
    }
  }
`;

export interface PlanLimits {
  maxLearners: number;
  maxAutomations: number;
  maxAutomationRunsPerMonth: number;
}

export interface TenantUsageSummary {
  tenantId: string;
  period: string;
  plan: string;
  automationRuns: number;
  activeLearners: number;
  agentTasks: number;
  automationCount: number;
  limits: PlanLimits;
  percentUsed: { automationRuns: number; activeLearners: number };
  withinLimits: { automationRuns: boolean; activeLearners: boolean; automations: boolean };
}

export interface EnrollmentRecord {
  id: string;
  courseId: string;
  studentId: string;
  notes: string;
  paymentStatus: string;
  progressPercent: number;
  learningStatus: string;
  lastAccessedAt?: string | null;
  completedAt?: string | null;
  paidAt?: string | null;
  cancelledAt?: string | null;
  enrolledAt: string;
}

export interface TenantUsageResult {
  tenantUsage: TenantUsageSummary;
}

export interface ListEnrollmentsResult {
  enrollments: EnrollmentRecord[];
}

export interface GetEnrollmentByIdResult {
  enrollmentById: EnrollmentRecord | null;
}

export interface CustomerRecord {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  marketingEmail?: boolean | null;
  staffNotes?: string | null;
  createdAt: string;
}

export interface LearnerDashboardStats {
  enrolledCount: number;
  inProgressCount: number;
  completedCount: number;
  certificateCount: number;
}

export interface LearnerDashboardRecord {
  studentId: string;
  stats: LearnerDashboardStats;
  courses: Array<{
    enrollmentId: string;
    courseId: string;
    courseTitle: string;
    instructorName: string;
    progressPercent: number;
    learningStatus: string;
    lastAccessedAt?: string | null;
    completedAt?: string | null;
    enrolledAt: string;
    paymentStatus: string;
  }>;
  subscriptions: Array<{
    id: string;
    status: string;
    currentPeriodEnd?: string | null;
    bundle?: { id: string; title: string } | null;
  }>;
}

export interface CustomerSegmentSummary {
  segment: string;
  label: string;
  customerCount: number;
  orderCount: number;
  avgProgressPercent: number;
}

export interface CustomerSegmentMember {
  customerId: string;
  customerName: string;
  customerEmail: string;
  orderCount: number;
  lastOrderAt?: string | null;
  totalPaidCents: number;
  avgProgressPercent: number;
  segment: string;
}

export interface ListCustomersResult {
  customers: CustomerRecord[];
}

export interface LearnerDashboardResult {
  learnerDashboard: LearnerDashboardRecord;
}

export interface CustomerSegmentsResult {
  customerSegments: CustomerSegmentSummary[];
}

export interface CustomersInSegmentResult {
  customersInSegment: CustomerSegmentMember[];
}
