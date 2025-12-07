import { test, expect } from '@playwright/test';

test.describe('Material Design 3 Demo E2E', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/examples/material-demo.html');
    });

    test('Initial Load checks', async ({ page }) => {
        await expect(page).toHaveTitle(/Material Design 3/);
        // Check for key components
        await expect(page.locator('h5', { hasText: 'Material Dashboard' })).toBeVisible(); // TopAppBar
        await expect(page.locator('.m3-fab')).toBeVisible(); // FAB
    });

    test('Navigation Drawer Interaction', async ({ page }) => {
        // Drawer should be hidden initially (modal variant check or strictly closed)
        const drawer = page.locator('.m3-navigation-drawer');
        await expect(drawer).not.toHaveClass(/open/);

        // Click Menu button in TopAppBar
        await page.locator('button', { hasText: 'menu' }).first().click();

        // Verify Drawer Opens
        await expect(drawer).toHaveClass(/open/);

        // Close via backdrop click (if visible) or button inside
        // For this test, we assume backdrop presence means it's open modal styled
        await page.locator('.modal-backdrop').click();
        await expect(drawer).not.toHaveClass(/open/);
    });

    test('Switch Interaction', async ({ page }) => {
        const switchInput = page.locator('.m3-switch').first();
        const outputStats = page.locator('#active-stats'); // Assuming we hook this up in demo

        // Find a specific switch that controls something visible or just check state
        const wifiSwitch = page.locator('label', { hasText: 'Wi-Fi' }).locator('..').locator('input');

        const isChecked = await wifiSwitch.isChecked();
        await wifiSwitch.click();
        expect(await wifiSwitch.isChecked()).toBe(!isChecked);
    });

    test('Search interaction', async ({ page }) => {
        const searchInput = page.locator('input[placeholder="Search items..."]');
        await searchInput.fill('Testing Search');
        await expect(searchInput).toHaveValue('Testing Search');

        // Clear button should appear
        const clearBtn = page.locator('span', { hasText: 'close' }).locator('..');
        await expect(clearBtn).toBeVisible();
        await clearBtn.click();
        await expect(searchInput).toHaveValue('');
    });

    test('Chip Selection', async ({ page }) => {
        const chip = page.locator('span.m3-chip', { hasText: 'Work' });
        // It might be selected or not. Let's click it.
        await chip.click();
        // Visual check for selection class would require css check or 'check' icon presence
        // Assuming implementation toggles 'check' icon
        await expect(chip).toHaveClass(/selected/);
    });

});
