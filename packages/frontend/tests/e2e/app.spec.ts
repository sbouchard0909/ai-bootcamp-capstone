import { test, expect } from '@playwright/test';

test.describe('App', () => {
  test('should load homepage', async ({ page }) => {
    await page.goto('/');
    
    await expect(page).toHaveTitle(/Travel Planning App/);
    await expect(page.getByRole('heading', { name: /travel planning app/i })).toBeVisible();
  });

  test('should have counter button', async ({ page }) => {
    await page.goto('/');
    
    const button = page.getByRole('button', { name: /count is/i });
    await expect(button).toBeVisible();
  });
});
