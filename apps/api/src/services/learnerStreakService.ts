import { Enrollment } from '@luxgen/db';

const MS_DAY = 86400000;

export const learnerStreakService = {
  async get(tenantId: string, studentId: string) {
    const enrollments = await Enrollment.find({ tenant: tenantId, student: studentId, cancelledAt: null });
    const days = new Set(
      enrollments
        .map((e) => e.lastAccessedAt)
        .filter(Boolean)
        .map((d) => Math.floor((d as Date).getTime() / MS_DAY)),
    );
    let streak = 0;
    const today = Math.floor(Date.now() / MS_DAY);
    for (let d = today; days.has(d); d -= 1) streak += 1;
    return { streakDays: streak, lastActiveAt: enrollments.find((e) => e.lastAccessedAt)?.lastAccessedAt ?? null };
  },
};
