import {
  Course,
  CourseStatus,
  Group,
  LearnerSubscription,
  LearnerSubscriptionStatus,
  StorefrontBundle,
  StorefrontBundleStatus,
  StorefrontBillingInterval,
  Tenant,
} from '@luxgen/db';

import { courseService } from './courseService';
import { enrollmentService } from './enrollmentService';
import { isBillingDevMode } from './billingService';

const PRODUCT_CATEGORIES = ['men', 'women', 'interior', 'dresses', 'digital'] as const;

function parseCategoryFromDescription(description?: string): string | null {
  if (!description) return null;
  const match = description.match(/luxgen-product-meta[^]*?"category"\s*:\s*"([^"]+)"/i);
  if (match?.[1] && PRODUCT_CATEGORIES.includes(match[1] as (typeof PRODUCT_CATEGORIES)[number])) {
    return match[1];
  }
  return null;
}

function inferProductCategory(title: string, description?: string, index = 0): string {
  const parsed = parseCategoryFromDescription(description);
  if (parsed) return parsed;
  const lower = `${title} ${description ?? ''}`.toLowerCase();
  if (lower.includes('digital') || lower.includes('training') || lower.includes('course')) return 'digital';
  if (lower.includes('dress')) return 'dresses';
  if (lower.includes('interior') || lower.includes('home')) return 'interior';
  if (lower.includes('women') || lower.includes('leadership')) return 'women';
  if (lower.includes('men')) return 'men';
  return PRODUCT_CATEGORIES[index % PRODUCT_CATEGORIES.length];
}

function mapProduct(course: Awaited<ReturnType<typeof courseService.getCourseById>>, index = 0) {
  if (!course) return null;
  const instructor = course.instructor as {
    _id?: { toString(): string };
    id?: string;
    firstName?: string;
    lastName?: string;
  };
  const title = course.title;
  const description = course.description ?? '';
  return {
    id: course._id?.toString?.() ?? course.id,
    title,
    description,
    status: course.status,
    category: inferProductCategory(title, description, index),
    priceCents: inferProductCategory(title, description, index) === 'digital' ? 4900 : 12900,
    currency: 'usd',
    instructorName: instructor ? `${instructor.firstName ?? ''} ${instructor.lastName ?? ''}`.trim() : null,
    enrollmentCount: (course.students as unknown[])?.length ?? 0,
    tenantId: (course.tenant as { _id?: { toString(): string } })?._id?.toString?.() ?? String(course.tenant),
  };
}

export class StorefrontService {
  async listProducts(tenantId: string, includeDrafts = false, category?: string | null) {
    const courses = await courseService.getCoursesByTenant(tenantId);
    const filtered = includeDrafts ? courses : courses.filter((c) => c.status === CourseStatus.PUBLISHED);
    let products = filtered.map((c, i) => mapProduct(c, i)).filter(Boolean) as NonNullable<
      ReturnType<typeof mapProduct>
    >[];
    if (category && category !== 'all') {
      products = products.filter((p) => p.category === category);
    }
    return products;
  }

  async getProduct(id: string, includeDrafts = false) {
    const course = await courseService.getCourseById(id);
    if (!course) return null;
    if (!includeDrafts && course.status !== CourseStatus.PUBLISHED) return null;
    return mapProduct(course);
  }

  async listCollections(tenantId: string) {
    const groups = await Group.find({ tenant: tenantId, isActive: true }).sort({ name: 1 }).limit(100).lean();
    return groups.map((g) => ({
      id: g._id.toString(),
      name: g.name,
      description: g.description ?? '',
      color: g.color ?? null,
      icon: g.icon ?? null,
      memberCount: 0,
      tenantId,
    }));
  }

  async getCollection(id: string, tenantId: string) {
    const group = await Group.findOne({ _id: id, tenant: tenantId, isActive: true }).lean();
    if (!group) return null;
    return {
      id: group._id.toString(),
      name: group.name,
      description: group.description ?? '',
      color: group.color ?? null,
      icon: group.icon ?? null,
      memberCount: 0,
      tenantId,
    };
  }

  async listBundles(tenantId: string, includeDrafts = false) {
    const query: Record<string, unknown> = { tenant: tenantId };
    if (!includeDrafts) query.status = StorefrontBundleStatus.PUBLISHED;
    const bundles = await StorefrontBundle.find(query).sort({ title: 1 }).lean();
    return bundles.map((b) => this.mapBundle(b));
  }

  async getBundle(id: string, tenantId: string, includeDrafts = false) {
    const query: Record<string, unknown> = { _id: id, tenant: tenantId };
    if (!includeDrafts) query.status = StorefrontBundleStatus.PUBLISHED;
    const bundle = await StorefrontBundle.findOne(query).lean();
    if (!bundle) return null;
    return this.mapBundle(bundle);
  }

  async listLearnerSubscriptions(userId: string, tenantId: string) {
    const subs = await LearnerSubscription.find({ userId, tenant: tenantId }).sort({ createdAt: -1 }).lean();
    const bundleIds = subs.map((s) => s.bundleId);
    const bundles = await StorefrontBundle.find({ _id: { $in: bundleIds } }).lean();
    const bundleMap = new Map(bundles.map((b) => [b._id.toString(), b]));

    return subs.map((s) => {
      const bundle = bundleMap.get(s.bundleId.toString());
      return {
        id: s._id.toString(),
        status: s.status,
        currentPeriodEnd: s.currentPeriodEnd ?? null,
        bundle: bundle ? this.mapBundle(bundle) : null,
      };
    });
  }

  async subscribeToBundle(bundleId: string, tenantId: string, userId: string) {
    const bundle = await StorefrontBundle.findOne({
      _id: bundleId,
      tenant: tenantId,
      status: StorefrontBundleStatus.PUBLISHED,
    });
    if (!bundle) throw new Error('Bundle not found');

    const existing = await LearnerSubscription.findOne({ userId, bundleId });
    if (existing && existing.status === LearnerSubscriptionStatus.ACTIVE) {
      return { subscription: existing, alreadySubscribed: true };
    }

    for (const courseId of bundle.courseIds) {
      await courseService.enrollStudent(courseId.toString(), tenantId, userId);
      await enrollmentService.ensureEnrollment(tenantId, courseId.toString(), userId);
    }

    const periodEnd =
      bundle.billingInterval === StorefrontBillingInterval.MONTH
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        : bundle.billingInterval === StorefrontBillingInterval.YEAR
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          : undefined;

    const subscription =
      existing ??
      (await LearnerSubscription.create({
        tenant: tenantId,
        userId,
        bundleId,
        status: LearnerSubscriptionStatus.ACTIVE,
        currentPeriodEnd: periodEnd,
        stripeSubscriptionId: isBillingDevMode() ? `dev_sub_${bundleId}_${userId}` : undefined,
      }));

    if (existing) {
      existing.status = LearnerSubscriptionStatus.ACTIVE;
      existing.currentPeriodEnd = periodEnd;
      await existing.save();
    }

    return { subscription, alreadySubscribed: false };
  }

  async cancelLearnerSubscription(subscriptionId: string, tenantId: string, userId: string) {
    const sub = await LearnerSubscription.findOne({ _id: subscriptionId, tenant: tenantId, userId });
    if (!sub) throw new Error('Subscription not found');
    sub.status = LearnerSubscriptionStatus.CANCELED;
    await sub.save();
    return sub;
  }

  private mapBundle(bundle: {
    _id: { toString(): string };
    title: string;
    description?: string;
    slug: string;
    courseIds: { toString(): string }[];
    priceCents: number;
    currency: string;
    billingInterval: StorefrontBillingInterval;
    status: StorefrontBundleStatus;
  }) {
    return {
      id: bundle._id.toString(),
      title: bundle.title,
      description: bundle.description ?? '',
      slug: bundle.slug,
      courseIds: bundle.courseIds.map((id) => id.toString()),
      priceCents: bundle.priceCents,
      currency: bundle.currency,
      billingInterval: bundle.billingInterval,
      status: bundle.status,
    };
  }
}

export const storefrontService = new StorefrontService();

export async function ensureDemoStorefrontBundles(): Promise<void> {
  const tenant = await Tenant.findOne({ subdomain: 'demo' });
  if (!tenant) return;

  const existing = await StorefrontBundle.countDocuments({
    tenant: tenant._id,
    status: StorefrontBundleStatus.PUBLISHED,
  });
  if (existing > 0) return;

  const courses = await Course.find({ tenant: tenant._id, status: CourseStatus.PUBLISHED }).limit(3).lean();
  if (courses.length === 0) return;

  const courseIds = courses.map((c) => c._id);

  await StorefrontBundle.insertMany([
    {
      tenant: tenant._id,
      title: 'Leadership Starter Pack',
      slug: 'leadership-starter',
      description: 'Two courses bundled for new managers — one-time purchase.',
      courseIds: courseIds.slice(0, 2),
      priceCents: 9900,
      currency: 'usd',
      billingInterval: StorefrontBillingInterval.ONE_TIME,
      status: StorefrontBundleStatus.PUBLISHED,
    },
    {
      tenant: tenant._id,
      title: 'Full Learning Pass',
      slug: 'full-learning-pass',
      description: 'All catalog courses with monthly access — cancel anytime.',
      courseIds,
      priceCents: 2900,
      currency: 'usd',
      billingInterval: StorefrontBillingInterval.MONTH,
      status: StorefrontBundleStatus.PUBLISHED,
    },
  ]);
}
