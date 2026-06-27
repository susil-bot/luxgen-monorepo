import type { LuxgenGraphqlClient } from '../graphql/client';
import {
  GET_ENROLLMENT_BY_ID,
  LIST_ENROLLMENTS,
  TENANT_USAGE,
  LIST_CUSTOMERS,
  GET_LEARNER_DASHBOARD,
  CUSTOMER_SEGMENTS,
  CUSTOMERS_IN_SEGMENT,
  type GetEnrollmentByIdResult,
  type ListEnrollmentsResult,
  type TenantUsageResult,
  type ListCustomersResult,
  type LearnerDashboardResult,
  type CustomerSegmentsResult,
  type CustomersInSegmentResult,
} from '../graphql/commerce-queries';
import type { ToolConfig, ToolContent } from './types';
import { formatToolError, formatToolSuccess } from '../errors';

async function runTool<T>(config: ToolConfig, fn: () => Promise<T>): Promise<ToolContent> {
  try {
    return formatToolSuccess(await fn());
  } catch (error) {
    return formatToolError(error, config.production);
  }
}

export async function handleCommerceTool(
  name: string,
  args: Record<string, unknown>,
  client: LuxgenGraphqlClient,
  config: ToolConfig,
): Promise<ToolContent | null> {
  switch (name) {
    case 'get_tenant_usage':
      return runTool(config, async () => {
        const data = await client.query<TenantUsageResult>(TENANT_USAGE, { tenantId: config.tenant });
        return data.tenantUsage;
      });

    case 'list_enrollments': {
      const limitRaw = args.limit;
      const limit = typeof limitRaw === 'number' ? Math.min(500, Math.max(1, limitRaw)) : 50;
      return runTool(config, async () => {
        const data = await client.query<ListEnrollmentsResult>(LIST_ENROLLMENTS, { tenantId: config.tenant });
        const enrollments = data.enrollments.slice(0, limit);
        return {
          tenantId: config.tenant,
          total: data.enrollments.length,
          count: enrollments.length,
          enrollments,
        };
      });
    }

    case 'get_enrollment': {
      const id = String(args.id ?? '');
      if (!id) throw new Error('id is required');
      return runTool(config, async () => {
        const data = await client.query<GetEnrollmentByIdResult>(GET_ENROLLMENT_BY_ID, { id });
        if (!data.enrollmentById) throw new Error(`Enrollment not found: ${id}`);
        return data.enrollmentById;
      });
    }

    case 'list_customers': {
      const limitRaw = args.limit;
      const limit = typeof limitRaw === 'number' ? Math.min(500, Math.max(1, limitRaw)) : 50;
      return runTool(config, async () => {
        const data = await client.query<ListCustomersResult>(LIST_CUSTOMERS, { tenantId: config.tenant });
        const customers = data.customers.slice(0, limit);
        return {
          tenantId: config.tenant,
          total: data.customers.length,
          count: customers.length,
          customers,
        };
      });
    }

    case 'get_learner_dashboard': {
      const studentId = typeof args.studentId === 'string' ? args.studentId : undefined;
      return runTool(config, async () => {
        const data = await client.query<LearnerDashboardResult>(GET_LEARNER_DASHBOARD, {
          tenantId: config.tenant,
          studentId,
        });
        return data.learnerDashboard;
      });
    }

    case 'customer_segments':
      return runTool(config, async () => {
        const data = await client.query<CustomerSegmentsResult>(CUSTOMER_SEGMENTS, { tenantId: config.tenant });
        return {
          tenantId: config.tenant,
          segments: data.customerSegments,
        };
      });

    case 'customers_in_segment': {
      const segment = String(args.segment ?? 'ALL');
      return runTool(config, async () => {
        const data = await client.query<CustomersInSegmentResult>(CUSTOMERS_IN_SEGMENT, {
          tenantId: config.tenant,
          segment,
        });
        return {
          tenantId: config.tenant,
          segment,
          count: data.customersInSegment.length,
          customers: data.customersInSegment,
        };
      });
    }

    default:
      return null;
  }
}
