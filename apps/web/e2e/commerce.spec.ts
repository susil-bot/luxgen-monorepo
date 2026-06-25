import { test, expect } from './fixtures/auth';

test.describe('Commerce storefront', () => {
  test('store catalog loads', async ({ page }) => {
    await page.goto('/store/product');
    await expect(page).toHaveURL(/\/store\/product/);
    await expect(page.getByRole('heading', { name: /Shop with/i })).toBeVisible({ timeout: 20_000 });
  });

  test('product detail and checkout stub (enroll/buy)', async ({ page }) => {
    await page.goto('/store/product');
    await expect(page.getByRole('heading', { name: /Shop with/i })).toBeVisible({ timeout: 20_000 });

    const productLink = page.locator('a[href^="/store/product/"]').first();
    const count = await productLink.count();
    test.skip(count === 0, 'No storefront products — seed data required');

    await productLink.click();
    await expect(page).toHaveURL(/\/store\/product\/[^/]+/);
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 15_000 });

    const buyAction = page.getByRole('button', { name: /buy|enroll|purchase/i }).first();
    if ((await buyAction.count()) > 0) {
      await expect(buyAction).toBeVisible();
    } else {
      await expect(page.getByText(/checkout|enroll|purchase/i).first()).toBeVisible();
    }
  });

  test('store index redirects to product catalog', async ({ page }) => {
    await page.goto('/store');
    await expect(page).toHaveURL(/\/store\/product/);
  });
});
