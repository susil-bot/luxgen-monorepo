import {
  ActivityEvent,
  ActivityActorType,
  ActivityEventKind,
  ActivitySubjectType,
  Course,
  User,
  type IActivityEvent,
} from '@luxgen/db';

function buildOrderSubjectId(courseId: string, studentId: string): string {
  return `${courseId}:${studentId}`;
}

export interface RecordActivityInput {
  tenantId: string;
  subjectType: ActivitySubjectType;
  subjectId: string;
  kind: ActivityEventKind;
  eventType: string;
  message: string;
  actorType?: ActivityActorType;
  actorId?: string;
  actorName?: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  metadata?: Record<string, unknown>;
}

export interface AddCommentInput {
  tenantId: string;
  subjectType: ActivitySubjectType;
  subjectId: string;
  message: string;
  actorId: string;
  actorName: string;
}

function staffName(user: { firstName?: string; lastName?: string; email?: string }): string {
  const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
  return name || user.email || 'Staff';
}

export class ActivityEventService {
  async record(input: RecordActivityInput): Promise<IActivityEvent> {
    const event = new ActivityEvent({
      tenant: input.tenantId,
      subjectType: input.subjectType,
      subjectId: input.subjectId,
      kind: input.kind,
      eventType: input.eventType,
      message: input.message,
      actorType: input.actorType ?? ActivityActorType.SYSTEM,
      actorId: input.actorId,
      actorName: input.actorName,
      field: input.field,
      oldValue: input.oldValue,
      newValue: input.newValue,
      metadata: input.metadata ?? {},
    });
    await event.save();
    return event;
  }

  async addComment(input: AddCommentInput): Promise<IActivityEvent> {
    return this.record({
      tenantId: input.tenantId,
      subjectType: input.subjectType,
      subjectId: input.subjectId,
      kind: ActivityEventKind.STAFF_COMMENT,
      eventType: 'staff.comment',
      message: input.message,
      actorType: ActivityActorType.STAFF,
      actorId: input.actorId,
      actorName: input.actorName,
    });
  }

  async list(
    tenantId: string,
    subjectType: ActivitySubjectType,
    subjectId: string,
    limit = 50,
  ): Promise<IActivityEvent[]> {
    const stored = await ActivityEvent.find({ tenant: tenantId, subjectType, subjectId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    if (stored.length > 0) {
      return stored as IActivityEvent[];
    }

    return this.synthesize(tenantId, subjectType, subjectId);
  }

  /** Backfill read model when no events exist yet (append-only store stays empty for legacy data). */
  private async synthesize(
    tenantId: string,
    subjectType: ActivitySubjectType,
    subjectId: string,
  ): Promise<IActivityEvent[]> {
    const now = new Date();
    const base = {
      tenant: tenantId as unknown as IActivityEvent['tenant'],
      createdAt: now,
    };

    if (subjectType === ActivitySubjectType.PRODUCT) {
      const course = await Course.findOne({ _id: subjectId, tenant: tenantId });
      if (!course) return [];
      const events: Partial<IActivityEvent>[] = [
        {
          ...base,
          subjectType,
          subjectId,
          kind: ActivityEventKind.SYSTEM,
          eventType: 'product.created',
          message: 'Product created',
          actorType: ActivityActorType.SYSTEM,
          actorName: 'LuxGen',
          createdAt: course.createdAt,
        },
      ];
      if (course.status !== 'DRAFT') {
        events.unshift({
          ...base,
          subjectType,
          subjectId,
          kind: ActivityEventKind.FIELD_CHANGE,
          eventType: 'product.status_changed',
          message: `Status set to ${course.status}`,
          actorType: ActivityActorType.SYSTEM,
          actorName: 'LuxGen',
          field: 'status',
          newValue: course.status,
          createdAt: course.updatedAt,
        });
      }
      return events as IActivityEvent[];
    }

    if (subjectType === ActivitySubjectType.CUSTOMER) {
      const user = await User.findOne({ _id: subjectId, tenant: tenantId });
      if (!user) return [];
      return [
        {
          ...base,
          subjectType,
          subjectId,
          kind: ActivityEventKind.SYSTEM,
          eventType: 'customer.created',
          message: 'Customer account created',
          actorType: ActivityActorType.APP,
          actorName: 'LuxGen',
          createdAt: user.createdAt,
        },
      ] as IActivityEvent[];
    }

    if (subjectType === ActivitySubjectType.ORDER) {
      const [courseId, studentId] = subjectId.split(':');
      if (!courseId || !studentId) return [];
      const course = await Course.findById(courseId);
      const student = await User.findById(studentId);
      if (!course || !student) return [];
      const orderNumber = subjectId;
      return [
        {
          ...base,
          subjectType,
          subjectId,
          kind: ActivityEventKind.SYSTEM,
          eventType: 'order.created',
          message: `Order placed for ${course.title}`,
          actorType: ActivityActorType.APP,
          actorName: 'LuxGen',
          metadata: { orderId: subjectId, courseId, studentId },
          createdAt: course.updatedAt,
        },
        {
          ...base,
          subjectType,
          subjectId,
          kind: ActivityEventKind.SYSTEM,
          eventType: 'order.enrollment_confirmed',
          message: `Enrollment confirmed for ${student.email}`,
          actorType: ActivityActorType.SYSTEM,
          actorName: 'LuxGen',
          createdAt: course.updatedAt,
        },
      ] as IActivityEvent[];
    }

    return [];
  }

  async recordProductCreated(course: { id: string; title: string; tenantId: string }, actor?: { id: string; name: string }) {
    return this.record({
      tenantId: course.tenantId,
      subjectType: ActivitySubjectType.PRODUCT,
      subjectId: course.id,
      kind: ActivityEventKind.SYSTEM,
      eventType: 'product.created',
      message: `Product "${course.title}" was created`,
      actorType: actor ? ActivityActorType.STAFF : ActivityActorType.STAFF,
      actorId: actor?.id,
      actorName: actor?.name ?? 'Staff',
    });
  }

  async recordProductStatusChange(
    tenantId: string,
    courseId: string,
    oldStatus: string,
    newStatus: string,
    actor?: { id: string; name: string },
  ) {
    return this.record({
      tenantId,
      subjectType: ActivitySubjectType.PRODUCT,
      subjectId: courseId,
      kind: ActivityEventKind.FIELD_CHANGE,
      eventType: 'product.status_changed',
      message: `Status changed from ${oldStatus} to ${newStatus}`,
      actorType: actor ? ActivityActorType.STAFF : ActivityActorType.SYSTEM,
      actorId: actor?.id,
      actorName: actor?.name,
      field: 'status',
      oldValue: oldStatus,
      newValue: newStatus,
    });
  }

  async recordProductUpdated(
    tenantId: string,
    courseId: string,
    message: string,
    actor?: { id: string; name: string },
  ) {
    return this.record({
      tenantId,
      subjectType: ActivitySubjectType.PRODUCT,
      subjectId: courseId,
      kind: ActivityEventKind.SYSTEM,
      eventType: 'product.updated',
      message,
      actorType: actor ? ActivityActorType.STAFF : ActivityActorType.SYSTEM,
      actorId: actor?.id,
      actorName: actor?.name,
    });
  }

  async recordOrderCreated(
    tenantId: string,
    courseId: string,
    studentId: string,
    courseTitle: string,
    customerEmail: string,
    actor?: { id: string; name: string },
  ) {
    const subjectId = buildOrderSubjectId(courseId, studentId);
    await this.record({
      tenantId,
      subjectType: ActivitySubjectType.ORDER,
      subjectId,
      kind: ActivityEventKind.SYSTEM,
      eventType: 'order.created',
      message: `Order created — enrolled in ${courseTitle}`,
      actorType: actor ? ActivityActorType.STAFF : ActivityActorType.APP,
      actorId: actor?.id,
      actorName: actor?.name ?? 'LuxGen',
      metadata: { courseId, studentId, customerEmail },
    });
    await this.record({
      tenantId,
      subjectType: ActivitySubjectType.CUSTOMER,
      subjectId: studentId,
      kind: ActivityEventKind.SYSTEM,
      eventType: 'customer.order_placed',
      message: `Placed order for ${courseTitle}`,
      actorType: ActivityActorType.APP,
      actorName: 'LuxGen',
      metadata: { orderId: subjectId, courseId },
    });
  }

  async recordCustomerCreated(
    tenantId: string,
    userId: string,
    email: string,
    actor?: { id: string; name: string },
  ) {
    return this.record({
      tenantId,
      subjectType: ActivitySubjectType.CUSTOMER,
      subjectId: userId,
      kind: ActivityEventKind.SYSTEM,
      eventType: 'customer.created',
      message: `Customer account created (${email})`,
      actorType: actor ? ActivityActorType.STAFF : ActivityActorType.APP,
      actorId: actor?.id,
      actorName: actor?.name ?? 'LuxGen',
    });
  }

  async recordOrderNoteAdded(
    tenantId: string,
    orderSubjectId: string,
    notes: string,
    actor?: { id: string; name: string },
  ) {
    return this.record({
      tenantId,
      subjectType: ActivitySubjectType.ORDER,
      subjectId: orderSubjectId,
      kind: ActivityEventKind.SYSTEM,
      eventType: 'order.note_added',
      message: 'You added a note to this order.',
      actorType: actor ? ActivityActorType.STAFF : ActivityActorType.SYSTEM,
      actorId: actor?.id,
      actorName: actor?.name,
      metadata: { notePreview: notes.slice(0, 200) },
    });
  }

  async recordCustomerNoteAdded(
    tenantId: string,
    customerId: string,
    notes: string,
    actor?: { id: string; name: string },
  ) {
    return this.record({
      tenantId,
      subjectType: ActivitySubjectType.CUSTOMER,
      subjectId: customerId,
      kind: ActivityEventKind.SYSTEM,
      eventType: 'customer.note_added',
      message: 'You added a note to this customer.',
      actorType: actor ? ActivityActorType.STAFF : ActivityActorType.SYSTEM,
      actorId: actor?.id,
      actorName: actor?.name,
      metadata: { notePreview: notes.slice(0, 200) },
    });
  }

  async recordOrderCancelled(
    tenantId: string,
    orderSubjectId: string,
    courseTitle: string,
    customerEmail: string,
    actor?: { id: string; name: string },
  ) {
    const [courseId, studentId] = orderSubjectId.split(':');
    await this.record({
      tenantId,
      subjectType: ActivitySubjectType.ORDER,
      subjectId: orderSubjectId,
      kind: ActivityEventKind.FIELD_CHANGE,
      eventType: 'order.cancelled',
      message: `Order cancelled — unenrolled from ${courseTitle}`,
      actorType: actor ? ActivityActorType.STAFF : ActivityActorType.SYSTEM,
      actorId: actor?.id,
      actorName: actor?.name ?? 'LuxGen',
      field: 'status',
      oldValue: 'active',
      newValue: 'cancelled',
      metadata: { courseId, studentId, customerEmail },
    });
    if (studentId) {
      await this.record({
        tenantId,
        subjectType: ActivitySubjectType.CUSTOMER,
        subjectId: studentId,
        kind: ActivityEventKind.SYSTEM,
        eventType: 'customer.order_cancelled',
        message: `Enrollment cancelled for ${courseTitle}`,
        actorType: actor ? ActivityActorType.STAFF : ActivityActorType.SYSTEM,
        actorId: actor?.id,
        actorName: actor?.name ?? 'LuxGen',
        metadata: { orderId: orderSubjectId, courseId },
      });
    }
  }

  async recordOrderPaymentConfirmed(
    tenantId: string,
    orderSubjectId: string,
    courseTitle: string,
    stripeSessionId?: string,
  ) {
    return this.record({
      tenantId,
      subjectType: ActivitySubjectType.ORDER,
      subjectId: orderSubjectId,
      kind: ActivityEventKind.SYSTEM,
      eventType: 'order.payment_confirmed',
      message: `Payment confirmed for ${courseTitle}`,
      actorType: ActivityActorType.APP,
      actorName: 'Stripe',
      metadata: { stripeSessionId },
    });
  }
}

export const activityEventService = new ActivityEventService();

export function actorFromContext(user?: { _id?: { toString(): string }; id?: string; firstName?: string; lastName?: string; email?: string }) {
  if (!user) return undefined;
  const id = user._id?.toString?.() ?? user.id;
  if (!id) return undefined;
  return { id, name: staffName(user) };
}
