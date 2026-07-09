import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard', () => {
  test('loads dashboard with KPI cards', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page.locator('h1')).toContainText('لوحة الإدارة');
    await expect(page.getByText('إجمالي الطلبات')).toBeVisible();
  });

  test('shows orders table', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page.getByText('الطلبات الأخيرة')).toBeVisible();
    await expect(page.getByText('SQ-001247')).toBeVisible();
  });
});
