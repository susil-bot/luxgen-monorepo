import { Course, Enrollment, EnrollmentLearningStatus, Group, GroupMember } from '@luxgen/db';
import { resolveProductPriceCents } from '../utils/productMeta';
export const analyticsService = {
  async getCourseAnalytics(tenantId: string, _days = 90) {
    const allEnrollments = await Enrollment.find({ tenant: tenantId }).lean();
    const courses = await Course.find({ tenant: tenantId }).lean();
    const completed = allEnrollments.filter((e) => e.learningStatus === EnrollmentLearningStatus.COMPLETED);
    const activeStudentIds = new Set(
      allEnrollments.filter((e) => e.learningStatus === EnrollmentLearningStatus.ACTIVE).map((e) => String(e.student)),
    );
    let revenueCents = 0;
    const courseMap = new Map(courses.map((c) => [String(c._id), c]));
    for (const e of allEnrollments) {
      const course = courseMap.get(String(e.course));
      if (course) revenueCents += resolveProductPriceCents(course);
    }
    const byCourse = new Map<string, typeof allEnrollments>();
    for (const e of allEnrollments) {
      const k = String(e.course);
      if (!byCourse.has(k)) byCourse.set(k, []);
      byCourse.get(k)!.push(e);
    }
    const topCourses = courses
      .map((c) => {
        const id = String(c._id);
        const rows = byCourse.get(id) ?? [];
        const done = rows.filter((r) => r.learningStatus === EnrollmentLearningStatus.COMPLETED).length;
        return {
          id,
          title: c.title,
          enrollments: rows.length,
          completionRate: rows.length ? Math.round((done / rows.length) * 100) : 0,
        };
      })
      .sort((a, b) => b.enrollments - a.enrollments)
      .slice(0, 5);
    return {
      totalCourses: courses.length,
      totalEnrollments: allEnrollments.length,
      activeStudents: activeStudentIds.size,
      completionRate: allEnrollments.length ? Math.round((completed.length / allEnrollments.length) * 100) : 0,
      averageRating: 0,
      revenueCents,
      topCourses,
      enrollmentTrends: [
        { label: 'Jan', enrollments: 0 },
        { label: 'Feb', enrollments: 0 },
        { label: 'Mar', enrollments: 0 },
      ],
    };
  },
  async getGroupAnalytics(tenantId: string) {
    const groups = await Group.find({ tenant: tenantId }).lean();
    const groupIds = groups.map((g) => String(g._id));
    const members = groupIds.length
      ? await GroupMember.find({ groupId: { $in: groupIds }, isActive: true }).lean()
      : [];
    const countBy = new Map<string, number>();
    for (const m of members) {
      const k = String(m.groupId);
      countBy.set(k, (countBy.get(k) ?? 0) + 1);
    }
    const topGroups = groups
      .map((g) => ({
        id: String(g._id),
        name: g.name,
        memberCount: countBy.get(String(g._id)) ?? 0,
        isActive: g.isActive !== false,
      }))
      .sort((a, b) => b.memberCount - a.memberCount)
      .slice(0, 5);
    const totalMembers = members.length;
    return {
      totalGroups: groups.length,
      activeGroups: groups.filter((g) => g.isActive !== false).length,
      totalMembers,
      averageMembersPerGroup: groups.length ? Math.round(totalMembers / groups.length) : 0,
      topGroups,
    };
  },
};
