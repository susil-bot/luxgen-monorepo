import { Course, CourseStatus, Tenant, User, UserRole } from '@luxgen/db';

import { logger } from '../utils/logger';

/** Ensure demo tenant has at least one PUBLISHED course for /learn storefront. Idempotent. */
export async function ensureDemoStorefrontCourses(): Promise<void> {
  const tenant = await Tenant.findOne({ subdomain: 'demo' });
  if (!tenant) return;

  const publishedCount = await Course.countDocuments({
    tenant: tenant._id,
    status: CourseStatus.PUBLISHED,
  });

  if (publishedCount > 0) {
    logger.info(`Demo storefront: ${publishedCount} published course(s) ready`);
    return;
  }

  const publishedDrafts = await Course.updateMany(
    { tenant: tenant._id, status: CourseStatus.DRAFT },
    { $set: { status: CourseStatus.PUBLISHED } },
  );

  if (publishedDrafts.modifiedCount > 0) {
    logger.info(`Demo storefront: published ${publishedDrafts.modifiedCount} existing draft course(s)`);
    return;
  }

  const instructor = await User.findOne({
    tenant: tenant._id,
    role: { $in: [UserRole.INSTRUCTOR, UserRole.ADMIN] },
  });

  if (!instructor) {
    logger.warn('Demo storefront: no instructor found — skipping sample courses');
    return;
  }

  await Course.insertMany([
    {
      title: 'Introduction to LuxGen Training',
      description: 'Get started with the LuxGen learning platform — enroll, track progress, and complete assessments.',
      instructor: instructor._id,
      tenant: tenant._id,
      status: CourseStatus.PUBLISHED,
      students: [],
    },
    {
      title: 'Advanced Team Leadership',
      description: 'Build coaching skills and lead high-performing teams in your organization.',
      instructor: instructor._id,
      tenant: tenant._id,
      status: CourseStatus.PUBLISHED,
      students: [],
    },
  ]);

  logger.info('Demo storefront: created sample published courses for demo tenant');
}
