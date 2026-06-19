import { EntityFormPageLayout } from '../SplitPageLayout/EntityFormPageLayout';
import { SplitPageHeader } from '../SplitPageLayout/SplitPageHeader';
import { SplitPageSection } from '../SplitPageLayout/SplitPageSection';
import { SplitPageFormField } from '../SplitPageLayout/SplitPageFormField';
import { OrderTranslations } from './translations';

export interface OrderCreateStudentOption {
  id: string;
  name: string;
  email: string;
}

export interface OrderCreateCourseOption {
  id: string;
  title: string;
}

export interface OrderCreateFormProps {
  students: OrderCreateStudentOption[];
  courses: OrderCreateCourseOption[];
  studentId: string;
  courseId: string;
  saving?: boolean;
  lockStudent?: boolean;
  backHref?: string;
  saveLabel?: string;
  savingLabel?: string;
  onStudentChange: (id: string) => void;
  onCourseChange: (id: string) => void;
  onSave: () => void;
}

export function OrderCreateForm({
  students,
  courses,
  studentId,
  courseId,
  saving,
  lockStudent,
  backHref = '/orders',
  saveLabel = 'Create order',
  savingLabel = 'Creating…',
  onStudentChange,
  onCourseChange,
  onSave,
}: OrderCreateFormProps) {
  const t = OrderTranslations.en;
  const selectedStudent = students.find((s) => s.id === studentId);
  const selectedCourse = courses.find((c) => c.id === courseId);
  const noStudents = students.length === 0;
  const noCourses = courses.length === 0;

  return (
    <EntityFormPageLayout
      header={
        <SplitPageHeader
          backHref={backHref}
          backLabel={t.backToOrders}
          title="Create order"
          badges={<span className="badge badge-blue">Draft</span>}
          actions={
            <button
              type="button"
              className="ios-btn-primary text-sm"
              disabled={saving || noStudents || noCourses || !studentId || !courseId}
              onClick={onSave}
            >
              {saving ? savingLabel : saveLabel}
            </button>
          }
        />
      }
      main={
        <SplitPageSection title="Order details">
          <p className="text-sm text-secondary">
            Enroll a customer in a course. This creates an order and grants course access.
          </p>

          {noStudents ? (
            <p className="text-sm text-secondary">No customers available. Add a customer first.</p>
          ) : (
            <SplitPageFormField id="order-customer" label="Customer">
              <select
                id="order-customer"
                className="ios-input w-full"
                value={studentId}
                onChange={(e) => onStudentChange(e.target.value)}
                disabled={lockStudent}
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.email})
                  </option>
                ))}
              </select>
            </SplitPageFormField>
          )}

          {noStudents ? null : noCourses ? (
            <p className="text-sm text-secondary">
              This customer is already enrolled in all courses, or no courses exist.
            </p>
          ) : (
            <SplitPageFormField id="order-course" label="Course / product">
              <select
                id="order-course"
                className="ios-input w-full"
                value={courseId}
                onChange={(e) => onCourseChange(e.target.value)}
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </SplitPageFormField>
          )}
        </SplitPageSection>
      }
      aside={
        <SplitPageSection title="Summary">
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-xs text-tertiary mb-0.5">Customer</dt>
              <dd className="text-primary">{selectedStudent?.name ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-tertiary mb-0.5">Product</dt>
              <dd className="text-primary">{selectedCourse?.title ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-tertiary mb-0.5">Payment</dt>
              <dd className="text-secondary">Recorded as paid on enrollment</dd>
            </div>
          </dl>
        </SplitPageSection>
      }
    />
  );
}
