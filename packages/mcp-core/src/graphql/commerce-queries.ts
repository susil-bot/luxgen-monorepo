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
