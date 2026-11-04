import { test, expect } from '@playwright/test';

test.describe('Module 1: Authentication & Protected Routes', () => {

    // Generate unique credentials for this test run so tests never collide
    const uniqueEmail = `testuser_${Date.now()}@example.com`;
    const password = 'Password@123';
    const fullName = 'Auto QA Tester';

    test('1. Register a brand new user account', async ({ page }) => {
        await page.goto('/register');

        // Verify registration page elements
        await expect(page.locator('text=Create Account')).toBeVisible();

        // Fill the registration form
        await page.fill('input[placeholder="Full name"]', fullName);
        await page.fill('input[placeholder="Email address"]', uniqueEmail);
        await page.fill('input[placeholder="Password"]', password);

        // Click register button
        await page.click('button[type="submit"]');

        // Expect redirect to login page with success message
        await page.waitForURL('/login', { timeout: 10000 });
        await expect(page.locator('text=Welcome Back')).toBeVisible();
    });

    test('2. Log in with the newly registered account', async ({ page }) => {
        await page.goto('/login');

        // Fill login credentials
        await page.fill('input[placeholder="Email address"]', uniqueEmail);
        await page.fill('input[placeholder="Password"]', password);

        // Submit login
        await page.click('button[type="submit"]');

        // Expect redirect to Dashboard
        await page.waitForURL('/', { timeout: 10000 });
        await expect(page.locator('text=Welcome back')).toBeVisible();
    });

    test('3. Log out and verify protected routes redirect to /login', async ({ page }) => {
        // 1. Log in first
        await page.goto('/login');
        await page.fill('input[placeholder="Email address"]', uniqueEmail);
        await page.fill('input[placeholder="Password"]', password);
        await page.click('button[type="submit"]');
        await page.waitForURL('/', { timeout: 10000 });

        // 2. Click the Logout button in the top navbar
        await page.click('button:has-text("Logout")');

        // 3. Confirm we are redirected to /login
        await page.waitForURL('/login', { timeout: 10000 });
        await expect(page.locator('text=Welcome Back')).toBeVisible();

        // 4. Try to directly navigate to a protected page (e.g. /groups)
        await page.goto('/groups');

        // 5. Assert route protection: user must be kicked back to /login!
        await expect(page).toHaveURL('/login');
    });

});