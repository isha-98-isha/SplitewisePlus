import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    // 1. Directory where our test scripts will be stored
    testDir: './e2e',
    reporter: 'html',

    // 2. Maximum time one test can run (30 seconds)
    timeout: 30 * 1000,

    // 3. Settings shared by all tests
    use: {
        // Base URL of our React dev server
        baseURL: 'http://localhost:5173',

        // Record trace (timeline of clicks/network) when a test fails
        trace: 'on-first-retry',

        // Take a screenshot automatically if a test fails
        screenshot: 'only-on-failure',
    },

    // 4. Configure which browser to test on (Chromium / Google Chrome)
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
});