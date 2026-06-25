import { learnerService } from './learnerService';

export const engagementDashboardStatsService = {
  async forStudent(tenantId: string, studentId: string) {
    const dash = await learnerService.getLearnerDashboard(tenantId, studentId);
    return {
      enrolledCount: dash.stats.enrolledCount,
      inProgressCount: dash.stats.inProgressCount,
      completedCount: dash.stats.completedCount,
      certificateCount: dash.stats.certificateCount,
      activeSubscriptionCount: dash.subscriptions.filter((s) => s.status === 'active').length,
    };
  },
};
