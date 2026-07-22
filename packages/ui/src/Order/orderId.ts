/** Order URL ids are 24-char Mongo ObjectIds (enrollment `_id`). Legacy `courseId:studentId` is still accepted. */

const OBJECT_ID_RE = /^[a-f0-9]{24}$/i;

export function isStandardOrderId(orderId: string): boolean {
  return OBJECT_ID_RE.test(orderId);
}

export function isLegacyOrderId(orderId: string): boolean {
  return orderId.includes(':');
}

/** Activity timeline + automation subject key (legacy composite). */
export function buildOrderSubjectId(courseId: string, studentId: string): string {
  return `${courseId}:${studentId}`;
}

/** @deprecated URL ids use enrollment `id`. Kept for timeline subject resolution. */
export function buildOrderId(courseId: string, studentId: string): string {
  return buildOrderSubjectId(courseId, studentId);
}

export function parseLegacyOrderId(orderId: string): { courseId: string; studentId: string } | null {
  if (!isLegacyOrderId(orderId)) return null;
  const sep = orderId.indexOf(':');
  if (sep <= 0) return null;
  const courseId = orderId.slice(0, sep);
  const studentId = orderId.slice(sep + 1);
  if (!courseId || !studentId) return null;
  return { courseId, studentId };
}

export function enrollmentPairKey(courseId: string, studentId: string): string {
  return `${courseId}:${studentId}`;
}

export interface OrderEnrollmentSource {
  id: string;
  courseId: string;
  studentId: string;
  paymentStatus?: string;
  enrolledAt?: string;
  notes?: string;
}
