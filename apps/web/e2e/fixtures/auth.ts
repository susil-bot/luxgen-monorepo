import { test as base, expect, type Page } from '@playwright/test';
import { AUTH_STORAGE_KEYS, type SessionUser } from '../../lib/session';

export const DEMO_EMAIL = process.env.E2E_DEMO_EMAIL ?? 'alex.thompson@demo.com';
export const DEMO_PASSWORD = process.env.E2E_DEMO_PASSWORD ?? 'password123';

const STORAGE_KEYS = AUTH_STORAGE_KEYS;

/** Clear canonical session keys + legacy UI cache. */
export async function clearAuthSession(page: Page): Promise<void> {
  await page.evaluate((keys) => {
    Object.values(keys).forEach((key) => localStorage.removeItem(key));
    localStorage.removeItem('luxgen_user');
  }, STORAGE_KEYS);
}

/** Seed localStorage session (for flows that skip the login form). */
export async function seedAuthSession(page: Page, token: string, user: SessionUser, expiresAt?: number): Promise<void> {
  await page.evaluate(
    ({ keys, token, user, expiresAt }) => {
      localStorage.setItem(keys.token, token);
      localStorage.setItem(keys.user, JSON.stringify(user));
      localStorage.setItem(keys.tenant, user.tenant.subdomain);
      localStorage.setItem(keys.sessionEpoch, String(Date.now()));
      if (expiresAt) {
        localStorage.setItem(keys.expiresAt, String(expiresAt));
      } else {
        localStorage.removeItem(keys.expiresAt);
      }
      localStorage.setItem(
        'luxgen_user',
        JSON.stringify({
          name: `${user.firstName} ${user.lastName}`.trim() || user.email,
          email: user.email,
          role: user.role,
          tenant: user.tenant,
        }),
      );
    },
    { keys: STORAGE_KEYS, token, user, expiresAt },
  );
}

/** Login via /login form (requires GraphQL API). */
export async function loginViaUi(
  page: Page,
  email: string = DEMO_EMAIL,
  password: string = DEMO_PASSWORD,
): Promise<void> {
  await page.goto('/login');
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();
}

type AuthFixtures = {
  /** Page with a fresh UI login (cleared after test). */
  authedPage: Page;
};

export const test = base.extend<AuthFixtures>({
  authedPage: async ({ page }, use) => {
    await clearAuthSession(page);
    await loginViaUi(page);
    await expect(page).not.toHaveURL(/\/login/);
    await use(page);
    await clearAuthSession(page);
  },
});

export { expect };
