import { Course, ICourse } from '@luxgen/db';
import { logger } from '../utils/logger';
import { commerceFromDescription, type CourseCommerceFields } from '../utils/productMeta';

export interface CreateCourseInput {
  title: string;
  description?: string;
  instructorId: string;
  tenantId: string;
  startDate?: Date;
  endDate?: Date;
  commerce?: CourseCommerceFields;
}

export interface UpdateCourseInput {
  title?: string;
  description?: string;
  instructorId?: string;
  startDate?: Date;
  endDate?: Date;
  status?: string;
  commerce?: CourseCommerceFields;
}

function mergeCommerce(
  explicit: CourseCommerceFields | undefined,
  description: string | undefined,
  existing?: CourseCommerceFields | null,
): CourseCommerceFields {
  const fromDescription = description !== undefined ? commerceFromDescription(description) : {};
  return {
    currency: 'usd',
    ...existing,
    ...fromDescription,
    ...explicit,
  };
}

const POPULATE = [
  { path: 'instructor', populate: { path: 'tenant' } },
  { path: 'students', populate: { path: 'tenant' } },
  { path: 'tenant' },
];

export class CourseService {
  async getCourseById(id: string): Promise<ICourse | null> {
    return Course.findById(id).populate(POPULATE);
  }

  async getCoursesByTenant(tenantId: string): Promise<ICourse[]> {
    return Course.find({ tenant: tenantId }).populate(POPULATE);
  }

  async getCoursesByInstructor(instructorId: string): Promise<ICourse[]> {
    return Course.find({ instructor: instructorId }).populate(POPULATE);
  }

  async createCourse(input: CreateCourseInput): Promise<ICourse> {
    const commerce = mergeCommerce(input.commerce, input.description);
    const course = new Course({
      title: input.title,
      description: input.description,
      instructor: input.instructorId,
      tenant: input.tenantId,
      startDate: input.startDate,
      endDate: input.endDate,
      students: [],
      commerce,
    });

    await course.save();
    await course.populate(POPULATE);

    logger.info(`Course created: ${course.title}`);
    return course;
  }

  async updateCourse(id: string, tenantId: string, input: UpdateCourseInput): Promise<ICourse> {
    const existing = await Course.findOne({ _id: id, tenant: tenantId });
    if (!existing) throw new Error('Course not found');

    const update: Record<string, unknown> = {};
    if (input.title !== undefined) update.title = input.title;
    if (input.description !== undefined) update.description = input.description;
    if (input.instructorId !== undefined) update.instructor = input.instructorId;
    if (input.startDate !== undefined) update.startDate = input.startDate;
    if (input.endDate !== undefined) update.endDate = input.endDate;
    if (input.status !== undefined) update.status = input.status;

    if (input.commerce !== undefined || input.description !== undefined) {
      const nextDescription = input.description !== undefined ? input.description : existing.description;
      update.commerce = mergeCommerce(input.commerce, nextDescription, existing.commerce);
    }

    const course = await Course.findOneAndUpdate(
      { _id: id, tenant: tenantId },
      { $set: update },
      { new: true },
    ).populate(POPULATE);
    if (!course) throw new Error('Course not found');
    return course;
  }

  async deleteCourse(id: string, tenantId: string): Promise<boolean> {
    const result = await Course.findOneAndDelete({ _id: id, tenant: tenantId });
    if (result) logger.info(`Course deleted: ${id}`);
    return !!result;
  }

  async enrollStudent(courseId: string, tenantId: string, studentId: string): Promise<ICourse> {
    const course = await Course.findOneAndUpdate(
      { _id: courseId, tenant: tenantId },
      { $addToSet: { students: studentId } },
      { new: true },
    ).populate(POPULATE);
    if (!course) throw new Error('Course not found');
    logger.info(`Student ${studentId} enrolled in course ${courseId}`);
    return course;
  }

  async unenrollStudent(courseId: string, tenantId: string, studentId: string): Promise<ICourse> {
    const course = await Course.findOneAndUpdate(
      { _id: courseId, tenant: tenantId },
      { $pull: { students: studentId } },
      { new: true },
    ).populate(POPULATE);
    if (!course) throw new Error('Course not found');
    logger.info(`Student ${studentId} unenrolled from course ${courseId}`);
    return course;
  }
}

export const courseService = new CourseService();
