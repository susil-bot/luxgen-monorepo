/** Role rank for sidebar / UI gating — mirrors @luxgen/auth/roles.ts */
const ROLE_RANK: Record<string, number> = {
  SUPER_ADMIN: 5,
  ADMIN: 4,
  INSTRUCTOR: 3,
  STUDENT: 2,
  USER: 2,
};

export function hasRoleAtLeast(userRole: string, minimumRole: string): boolean {
  const userRank = ROLE_RANK[userRole.toUpperCase()];
  const minimumRank = ROLE_RANK[minimumRole.toUpperCase()];
  if (userRank === undefined || minimumRank === undefined) return false;
  return userRank >= minimumRank;
}

export function isStaffOrAbove(role: string): boolean {
  return hasRoleAtLeast(role, 'INSTRUCTOR');
}

export function isAdminOrAbove(role: string): boolean {
  return hasRoleAtLeast(role, 'ADMIN');
}

/** Learner / customer roles — USER is legacy seed alias for STUDENT */
export function isLearnerRole(role: string): boolean {
  const normalized = role.toUpperCase();
  return normalized === 'STUDENT' || normalized === 'USER';
}
