import { Course } from '@luxgen/db';
import { connectDB, disconnectDB } from '../db/connect';
import { commerceFromDescription, type CourseCommerceFields } from '../utils/productMeta';

function hasCommerceData(commerce: CourseCommerceFields): boolean {
  return (
    commerce.priceCents != null ||
    commerce.compareAtPriceCents != null ||
    Boolean(commerce.sku?.trim()) ||
    Boolean(commerce.category?.trim())
  );
}

function mergeCommerce(
  existing: CourseCommerceFields | undefined | null,
  fromDescription: CourseCommerceFields,
): CourseCommerceFields {
  return {
    currency: 'usd',
    ...existing,
    ...fromDescription,
  };
}

export async function backfillCourseCommerce(options: { dryRun?: boolean; force?: boolean } = {}): Promise<{
  scanned: number;
  updated: number;
  skipped: number;
}> {
  const { dryRun = false, force = false } = options;
  const courses = await Course.find({});
  let updated = 0;
  let skipped = 0;

  for (const course of courses) {
    const fromDescription = commerceFromDescription(course.description);
    if (!hasCommerceData(fromDescription)) {
      skipped += 1;
      continue;
    }

    const existing = course.commerce as CourseCommerceFields | undefined;
    if (existing?.priceCents != null && !force) {
      skipped += 1;
      continue;
    }

    const nextCommerce = mergeCommerce(existing, fromDescription);
    if (!dryRun) {
      course.commerce = nextCommerce;
      await course.save();
    }

    updated += 1;
    const prefix = dryRun ? '[dry-run] ' : '';
    console.log(`${prefix}Updated ${course._id} (${course.title})`, nextCommerce);
  }

  return { scanned: courses.length, updated, skipped };
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes('--dry-run');
  const force = process.argv.includes('--force');

  await connectDB();
  try {
    const result = await backfillCourseCommerce({ dryRun, force });
    console.log(
      `Done. scanned=${result.scanned} updated=${result.updated} skipped=${result.skipped}${dryRun ? ' (dry-run)' : ''}`,
    );
  } finally {
    await disconnectDB();
  }
}

if (require.main === module) {
  void main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
