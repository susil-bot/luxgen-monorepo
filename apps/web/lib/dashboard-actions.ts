import type { NextRouter } from 'next/router';
import type { DashboardAction, DashboardActionHandler } from '@luxgen/ui';

export type { DashboardAction, DashboardActionHandler };

/** Route dashboard widget events to pages (UI-88). */
export function createDashboardActionHandler(router: NextRouter): DashboardActionHandler {
  return (action: DashboardAction) => {
    switch (action.type) {
      case 'view_course':
        void router.push(`/courses/${action.courseId}`);
        break;
      case 'view_survey':
      case 'edit_survey':
      case 'share_survey':
        void router.push(`/surveys/${action.surveyId}`);
        break;
      case 'view_details':
        if (action.entityType === 'course') void router.push(`/courses/${action.entityId}`);
        else if (action.entityType === 'user') void router.push(`/admin/customers/${action.entityId}`);
        break;
      case 'approve_request':
      case 'deny_request':
        void router.push('/permissions');
        break;
      case 'activity_click':
        void router.push(`/activity/${action.activityId}`);
        break;
      default:
        if (process.env.NODE_ENV === 'development') {
          console.debug('[dashboard]', action);
        }
    }
  };
}
