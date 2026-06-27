import { defaultTheme } from '../theme';
import type { TenantTheme } from '../types';

export interface GroupMemberListData {
  tenantTheme: TenantTheme;
}

export const fetchGroupMemberListData = async (_tenantId?: string): Promise<GroupMemberListData> => {
  return { tenantTheme: defaultTheme };
};

export const fetchGroupMemberListSSR = async (tenantId?: string): Promise<{ html: string; styles: string }> => {
  const data = await fetchGroupMemberListData(tenantId);
  return {
    html: `<div class="group-member-list"></div>`,
    styles: `.group-member-list { font-family: ${data.tenantTheme.fonts.primary}; }`,
  };
};
