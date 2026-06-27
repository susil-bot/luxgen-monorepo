/** Discriminated union for dashboard widget interactions (UI-88). */
export type DashboardAction =
  | { type: 'retention_click'; date: string; value: number; label?: string }
  | { type: 'engagement_click'; segmentId: string; label: string; value: number }
  | { type: 'trend_click'; label: string; interactions: number; completions: number }
  | { type: 'activity_click'; activityId: string }
  | { type: 'survey_click'; surveyId: string }
  | { type: 'request_click'; requestId: string }
  | { type: 'view_survey'; surveyId: string }
  | { type: 'edit_survey'; surveyId: string }
  | { type: 'share_survey'; surveyId: string }
  | { type: 'approve_request'; requestId: string }
  | { type: 'deny_request'; requestId: string }
  | { type: 'view_details'; entityId: string; entityType?: string }
  | { type: 'view_course'; courseId: string };

export type DashboardActionHandler = (action: DashboardAction) => void;
