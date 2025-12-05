import { test, expect } from '@playwright/test';

test.describe('rnxJS Demos E2E', () => {

    test('Login Demo Flow', async ({ page }) => {
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

        await page.goto('/examples/login.html');

        // Check initial state
        await expect(page.locator('h1')).toHaveText('Welcome Back');

        // 1. Validation Error
        await page.click('button:has-text("Sign In")'); // Empty submit
        await expect(page.locator('.text-danger').first()).toBeVisible();
        await expect(page.locator('.alert-danger')).toHaveText(/Please fix the errors/);

        // 2. Successful Login
        await page.fill('input[type="email"]', 'admin@demo.com');
        await page.fill('input[type="password"]', 'secret123');

        // Check loading state
        const submitBtn = page.locator('button:has-text("Sign In")');
        await submitBtn.click();
        await expect(submitBtn).toContainText('Loading'); // Check loading text

        // Wait for navigation
        await page.waitForURL('**/dashboard.html');
        expect(page.url()).toContain('dashboard.html');
    });

    test('Dashboard Demo Flow', async ({ page }) => {
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

        await page.goto('/examples/dashboard.html');

        // 1. Verify Stats Load
        await expect(page.getByText('Total Users')).toBeVisible();
        await expect(page.locator('h2').first()).not.toBeEmpty(); // Stats should be populated

        // 2. Add User Modal
        await page.click('button:has-text("Add User")');
        const modal = page.locator('#addUserModal');
        await expect(modal).toBeVisible();

        // Fill Form inside Modal
        await modal.locator('input').first().fill('E2E Test User'); // Name
        await modal.locator('input[type="email"]').fill('e2e@test.com'); // Email

        // Save
        await modal.locator('button:has-text("Save User")').click();

        // Verify Modal Closes
        await expect(modal).not.toBeVisible();

        // Verify User Added to Table
        await expect(page.locator('table')).toContainText('E2E Test User');
        await expect(page.locator('table')).toContainText('e2e@test.com');
    });

    test('Data Table Demo Flow', async ({ page }) => {
        await page.goto('/examples/datatable.html');

        // 1. Initial State
        const rows = page.locator('tbody tr');
        await expect(rows).toHaveCount(5); // Initial users count

        // 2. Search Functionality
        await page.fill('input[placeholder="Search users..."]', 'Admin');
        await expect(rows).toHaveCount(2); // Should filter to 2 admins
        await expect(page.locator('tbody')).toContainText('Alice Johnson');
        await expect(page.locator('tbody')).not.toContainText('Charlie Brown');

        // 3. Clear Search
        await page.fill('input[placeholder="Search users..."]', '');
        await expect(rows).toHaveCount(5);

        // 4. Sorting
        // Sort by Name (Ascending)
        await page.click('th:has-text("Name")');
        const firstRowName = await rows.first().locator('td').nth(1).innerText();
        expect(firstRowName).toBe('Alice Johnson');

        // Sort by Name (Descending) - Click again
        await page.click('th:has-text("Name")'); // Toggle
        const firstRowNameDesc = await rows.first().locator('td').nth(1).innerText();
        expect(firstRowNameDesc).toBe('Eve Wilson'); // Last Alphabetically
    });

});
