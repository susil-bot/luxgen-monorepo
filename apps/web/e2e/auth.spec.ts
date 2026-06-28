import { test, expect, clearAuthSession, loginViaUi, DEMO_EMAIL, DEMO_PASSWORD } from './fixtures/auth';

test.describe('Auth flows', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuthSession(page);
  });

  test('guest NavBar shows Login and Sign Up', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Login' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign Up' }).first()).toBeVisible();
  });

  test('login succeeds and leaves /login', async ({ page }) => {
    await loginViaUi(page);
    await expect(page).not.toHaveURL(/\/login(?:\?|$)/);
    await expect(page.getByText(DEMO_EMAIL, { exact: false })).toBeVisible({ timeout: 15_000 });
  });

  test('logout clears session and shows guest NavBar', async ({ page }) => {
    await loginViaUi(page);
    await expect(page).not.toHaveURL(/\/login/);

    const userMenu = page
      .locator('nav button')
      .filter({ hasText: /^[A-Z]$/ })
      .first();
    await userMenu.click();
    await page.getByRole('button', { name: 'Log out' }).click();

    await expect(page.getByRole('link', { name: 'Login' }).first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('link', { name: 'Sign Up' }).first()).toBeVisible();
  });

  test('session expired redirect shows notice on login', async ({ page }) => {
    await page.goto('/login?reason=session_expired');
    await expect(page.getByText('Session expired', { exact: false })).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
  });

  test('invalid credentials stay on login with form visible', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#email').fill('not-a-real-user@example.com');
    await page.locator('#password').fill('wrong-password');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('#email')).toHaveValue('not-a-real-user@example.com');
  });
});

test.describe('Auth fixture', () => {
  test('authedPage fixture provides authenticated session', async ({ authedPage }) => {
    await authedPage.goto('/dashboard');
    await expect(authedPage).toHaveURL(/\/dashboard/);
    await expect(authedPage.getByRole('link', { name: 'Login' })).toHaveCount(0);
  });
});
