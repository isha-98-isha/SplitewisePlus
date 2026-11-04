import { test, expect } from '@playwright/test';

test.describe('Module 3: Full Expense Lifecycle & All Fields', () => {

    const expenseTitle = `Team Outing ${Date.now()}`;
    const expenseAmount = '1200';
    const splitFriend = 'Charlie';
    const splitEmail = 'charlie@test.com';

    test.beforeEach(async ({ page }) => {
        // Log in before running test
        await page.goto('/login');
        await page.fill('input[placeholder="Email address"]', 'alice@example.com');
        await page.fill('input[placeholder="Password"]', 'password123');
        await page.click('button[type="submit"]');
        await page.waitForURL('/', { timeout: 10000 });
    });

    test('Create expense with ALL fields, verify card, open modal, and search', async ({ page }) => {
        // 1. Navigate to Add Expense page
        await page.goto('/expenses/add');
        await expect(page.locator('text=Add New Expense')).toBeVisible();

        // 2. Fill Title and Amount
        await page.fill('input[placeholder="e.g. Dinner at Taj"]', expenseTitle);
        await page.fill('input[placeholder="0.00"]', expenseAmount);

        // 3. Select Category (e.g. Shopping)
        await page.selectOption('select', 'Shopping');

        // 4. Fill Notes
        await page.fill('textarea[placeholder*="Add any extra details"]', 'Office weekend snacks and drinks');

        // 5. Add Split Member (Name + Email)
        await page.fill('input[placeholder="Person\'s name"]', splitFriend);
        await page.fill('input[placeholder="Email (required for notifications)"]', splitEmail);
        // Click the golden "Add" button to attach the split member
        await page.click('button:has-text("Add")');
        // Verify the split member badge appears
        await expect(page.getByText(splitFriend, { exact: true })).toBeVisible();

        // 6. Submit the complete expense form
        await page.click('button:has-text("Create Expense")');

        // 7. Verify redirect to /expenses page
        await page.waitForURL('/expenses', { timeout: 10000 });

        // 8. Verify the newly created expense card appears with its title and category
        const expenseCard = page.locator(`div:has-text("${expenseTitle}")`).first();
        await expect(expenseCard).toBeVisible();

        // 9. Click "More Details" on our new card to open the Details Modal
        await page.click(`div:has(p:has-text("${expenseTitle}")) >> button:has-text("More Details")`);

        // 10. Assert that the Details Modal popped up with all info
        await expect(page.locator('text=Transaction Details')).toBeVisible();
        await expect(page.locator(`text=${expenseTitle}`)).toBeVisible();

        // 11. Close the modal by clicking the X button
        await page.click('button:has(svg.lucide-x)');

        // 12. Test Search Filter: Positive Search
        await page.fill('input[placeholder*="Search by title"]', expenseTitle);
        await expect(page.locator(`text=${expenseTitle}`)).toBeVisible();

        // 13. Test Search Filter: Negative Search (no matching item)
        await page.fill('input[placeholder*="Search by title"]', 'NonExistentItemXYZ');
        await expect(page.locator(`text=${expenseTitle}`)).not.toBeVisible();
    });

});