import { test, expect } from '@playwright/test';

test.describe('Module 2: Groups Management', () => {

    const groupName = `Trip ${Date.now()}`;
    const memberName = `Bobby_${Date.now().toString().slice(-4)}`;

    test.beforeEach(async ({ page }) => {
        // Reusable login step before each test in this file
        await page.goto('/login');
        await page.fill('input[placeholder="Email address"]', 'alice@example.com');
        await page.fill('input[placeholder="Password"]', 'password123');
        await page.click('button[type="submit"]');
        await page.waitForURL('/', { timeout: 10000 });
    });

    test('Create a new group with members and verify card appears', async ({ page }) => {
        // 1. Navigate to Groups page
        await page.goto('/groups');
        await expect(page.locator('text=Create a Community')).toBeVisible();

        // 2. Step 1: Type Group Name and click Next
        await page.fill('input[placeholder="Group name (e.g. Dream House)"]', groupName);
        await page.click('button:has-text("Next")');

        // 3. Step 2: Add a member to the group
        await expect(page.locator(`text=Step 2: Add Members to "${groupName}"`)).toBeVisible();
        await page.fill('input[placeholder="Invite by name"]', memberName);
        // Click the emerald '+' button to add member
        await page.click('button.bg-emerald-500');
        // Verify member tag appears inside the creation wizard
        await expect(page.getByText(memberName, { exact: true }).first()).toBeVisible();
        // Click Finalize Info button
        await page.click('button:has-text("Finalize Info")');

        // 4. Step 3: Fill description and Create Group
        await expect(page.locator('text=Final Step: Group Details')).toBeVisible();
        await page.fill('textarea[placeholder*="What is this group for?"]', 'Vacation trip expenses');
        await page.click('button:has-text("Create Group")');

        // 5. Verify the new group card is visible in the list!
        await expect(page.locator(`h4:has-text("${groupName}")`)).toBeVisible();
    });

});
