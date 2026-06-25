import { test, expect } from './fixtures/auth';

test.describe('Agent Studio', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/agent/health', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          host: 'http://mock-ollama',
          model: 'mock-model',
          models: ['mock-model'],
        }),
      });
    });

    await page.route('**/api/agent/chat', async (route) => {
      const body = [
        'data: {"type":"text","content":"Hello from mock LLM"}\n\n',
        'data: {"type":"done"}\n\n',
      ].join('');
      await route.fulfill({
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
        body,
      });
    });
  });

  test('health endpoint returns ready (mocked)', async ({ request }) => {
    const response = await request.get('/api/agent/health');
    expect(response.ok()).toBeTruthy();
    const json = await response.json();
    expect(json.ok).toBe(true);
    expect(json.model).toBe('mock-model');
  });

  test('agent page loads studio shell', async ({ page }) => {
    await page.goto('/agent');
    await expect(page).toHaveTitle(/Agent Studio/i);
    await expect(page.getByRole('heading', { name: 'Agent Studio' })).toBeVisible({ timeout: 15_000 });
  });

  test('chat send receives mock assistant reply', async ({ page }) => {
    await page.goto('/agent');
    await expect(page.getByRole('heading', { name: 'Agent Studio' })).toBeVisible({ timeout: 15_000 });

    const input = page.locator('textarea').first();
    await input.fill('Say hello');
    await input.press('Enter');

    await expect(page.getByText('Hello from mock LLM')).toBeVisible({ timeout: 15_000 });
  });
});
