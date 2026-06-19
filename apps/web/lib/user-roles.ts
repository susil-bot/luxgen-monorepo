/** Learner / customer roles — USER is legacy seed alias for STUDENT */
export function isLearnerRole(role: string): boolean {
  const normalized = role.toUpperCase();
  return normalized === 'STUDENT' || normalized === 'USER';
}
