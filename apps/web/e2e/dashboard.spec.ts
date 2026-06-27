import { test, expect } from './fixtures/auth';

test.describe('Dashboard', () => {
  test('loads for authenticated user', async ({ authedPage }) => {
    await authedPage.goto('/dashboard');
    await expect(authedPage).toHaveURL(/\/dashboard/);
    await expect(authedPage).toHaveTitle(/Dashboard/i);
    await expect(authedPage.getByText(/Loading dashboard/i)).toBeHidden({ timeout: 30_000 });
    await expect(authedPage.locator('main, [role="main"], .dashboard, h1, h2').first()).toBeVisible();
  });

  test('redirects unauthenticated visitor to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
  });
});
