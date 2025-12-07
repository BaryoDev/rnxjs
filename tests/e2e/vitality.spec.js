import { test, expect } from '@playwright/test';

test.describe('Vitality Check', () => {
    test.beforeEach(async ({ page }) => {
        // Go to the material demo or a simplified test page
        // Assuming the dev server or static file server serves examples/
        // We'll try to load the material-demo.html directly if possible or setup a simple test page
        // For this environment, we might need to rely on the 'dist/rnx.global.js' being built.
        await page.goto('/examples/material-demo.html');
    });

    test('should not crash browser on load', async ({ page }) => {
        // If the page loads and we can find the body, the thread hasn't hung
        await expect(page.locator('body')).toBeVisible();
    });

    test('should render FAB components', async ({ page }) => {
        // Check if .m3-fab exists
        const fab = page.locator('.m3-fab');
        await expect(fab).toBeVisible();
        await expect(fab).toHaveCount(1); // Assuming 1 FAB in demo, or at least > 0
    });

    test('should bind data correctly without crash', async ({ page }) => {
        // This assumes there's an input with data-bind in the demo
        // If not, we might fail. The material-demo.html needs to have binding.
        // Let's create a dedicated test-binding.html for this spec if the demo is insufficient?
        // For now, let's inject a test case into the page via evaluation to be sure.

        await page.evaluate(() => {
            document.body.innerHTML += `
            <div id="test-area">
                <input id="test-input" data-bind="testValue" />
                <span id="test-output" data-bind="testValue"></span>
            </div>
        `;
            const state = window.rnx.createReactiveState({ testValue: 'Initial' });
            window.rnx.bindData(document.getElementById('test-area'), state);

            // Expose state for test manipulation
            window.testState = state;
        });

        const input = page.locator('#test-input');
        await expect(input).toHaveValue('Initial');

        await input.fill('Updated');

        const output = page.locator('#test-output');
        await expect(output).toHaveText('Updated');
    });
});
