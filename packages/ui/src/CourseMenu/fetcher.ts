import { defaultTheme } from '../theme';
import type { TenantTheme } from '../types';

export interface CourseMenuData {
  tenantTheme: TenantTheme;
}

export const fetchCourseMenuData = async (_tenantId?: string): Promise<CourseMenuData> => {
  return { tenantTheme: defaultTheme };
};

export const fetchCourseMenuSSR = async (tenantId?: string): Promise<{ html: string; styles: string }> => {
  const data = await fetchCourseMenuData(tenantId);
  return {
    html: `<div class="course-menu"></div>`,
    styles: `.course-menu { font-family: ${data.tenantTheme.fonts.primary}; }`,
  };
};
