export type DashboardAction =
  | { type: 'view_course'; courseId: string }
  | { type: 'view_survey'; surveyId: string }
  | { type: 'generic'; action: string; payload?: Record<string, unknown> };

export function handleDashboardAction(_action: DashboardAction): void {}
