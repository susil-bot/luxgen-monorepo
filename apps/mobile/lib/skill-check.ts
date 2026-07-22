import AsyncStorage from '@react-native-async-storage/async-storage';

const SKILL_CHECK_PREFIX = 'skill_check_completed:';

function storageKey(userId: string): string {
  return `${SKILL_CHECK_PREFIX}${userId}`;
}

/** Whether this user has finished the post-login 10-question skill check. */
export async function hasCompletedSkillCheck(userId: string | undefined | null): Promise<boolean> {
  if (!userId) return false;
  const value = await AsyncStorage.getItem(storageKey(userId));
  return value === '1';
}

export async function markSkillCheckCompleted(userId: string): Promise<void> {
  await AsyncStorage.setItem(storageKey(userId), '1');
}

export async function clearSkillCheckCompleted(userId: string): Promise<void> {
  await AsyncStorage.removeItem(storageKey(userId));
}

export const SKILL_CHECK_INTRO_ROUTE = '/(learner)/home' as const;
export const SKILL_CHECK_ROUTE = SKILL_CHECK_INTRO_ROUTE;
export const DASHBOARD_ROUTE = '/(tabs)/dashboard' as const;

/** After auth: unfinished skill check → intro (“We wanna know about you”); otherwise dashboard. */
export async function resolvePostAuthRoute(
  userId: string,
): Promise<typeof SKILL_CHECK_INTRO_ROUTE | typeof DASHBOARD_ROUTE> {
  const done = await hasCompletedSkillCheck(userId);
  return done ? DASHBOARD_ROUTE : SKILL_CHECK_INTRO_ROUTE;
}
