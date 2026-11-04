import { test, expect } from '@playwright/test';

test.describe('Module 4: Settlements & Analytics Reports', () => {

    test.beforeEach(async ({ page }) => {
        // Log in before each test
        await page.goto('/login');
        await page.fill('input[placeholder="Email address"]', 'alice@example.com');
        await page.fill('input[placeholder="Password"]', 'password123');
        await page.click('button[type="submit"]');
        await page.waitForURL('/', { timeout: 10000 });
    });

    test('1. Verify Settlements page and mark a payment as settled', async ({ page }) => {
        // Navigate to settlements page
        await page.goto('/settlements');
        await expect(page.locator('h1:has-text("Settlements")')).toBeVisible();

        // Verify both sections are rendered
        await expect(page.locator('text=People Owe You')).toBeVisible();
        await expect(page.locator('text=You Owe People')).toBeVisible();

        // Check if there is an unsettled payment to settle
        const settleBtn = page.locator('button[title="Mark as Settled"]').first();
        const count = await settleBtn.count();

        if (count > 0) {
            // Click "Mark as Settled"
            await settleBtn.click();
            // Wait for UI update
            await page.waitForTimeout(1000);
        }
    });

    test('2. Verify Reports and Analytics charts render properly', async ({ page }) => {
        // Navigate to Reports page
        await page.goto('/reports');
        await page.waitForURL('/reports', { timeout: 10000 });

        // Assert Reports page header is present (actual h1 text in ReportsPage.jsx)
        await expect(page.locator('h1:has-text("Financial Intelligence")')).toBeVisible();

        // Verify key analytics sections appear on the page
        await expect(page.locator('text=Spending Trends')).toBeVisible();
        await expect(page.locator('text=Custom Export')).toBeVisible();
    });

});
