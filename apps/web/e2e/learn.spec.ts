import { test, expect } from './fixtures/auth';

test.describe('Learn hub', () => {
  test('catalog page renders and links to store', async ({ page }) => {
    await page.goto('/learn');
    await expect(page).toHaveURL(/\/learn/);
    await expect(page.getByRole('heading', { name: 'Training catalog' })).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole('link', { name: /GPT Store/i })).toBeVisible();
  });

  test('course navigation from catalog', async ({ page }) => {
    await page.goto('/learn');
    await expect(page.getByRole('heading', { name: 'Training catalog' })).toBeVisible({ timeout: 20_000 });

    const courseLink = page.locator('a[href^="/learn/courses/"]').first();
    const count = await courseLink.count();
    test.skip(count === 0, 'No published courses in tenant — seed data required');

    const href = await courseLink.getAttribute('href');
    await courseLink.click();
    await expect(page).toHaveURL(new RegExp(href!.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 15_000 });
  });

  test('authenticated user can open learn hub', async ({ authedPage }) => {
    await authedPage.goto('/learn');
    await expect(authedPage.getByRole('heading', { name: 'Training catalog' })).toBeVisible({
      timeout: 20_000,
    });
  });
});
