import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test('should maintain consistent UI appearance after theme toggle', async ({ page }) => {
    await page.goto('/');

    // Make sure page is fully loaded
    await page.waitForLoadState('networkidle');

    // Capture the initial state
    const initialTheme = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    });

    // Find the theme toggle button
    const themeToggle = page.getByRole('button', { name: /light theme|dark theme/i });
    await themeToggle.waitFor({ state: 'visible' });

    // Wait for the loading animation to complete
    await page.waitForSelector('button[aria-label*="theme"]:not([disabled])');
    await page.waitForTimeout(1000);

    // Click theme toggle
    await themeToggle.click({ force: true });

    // Wait for the theme to change
    await page.waitForFunction((initialTheme) => {
      const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
      return currentTheme !== initialTheme;
    }, initialTheme);

    // Get new theme
    const newTheme = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    });

    // Verify new theme is different from initial theme
    expect(newTheme).not.toBe(initialTheme);

    // Verify the theme has changed on the HTML element
    await expect(page.locator('html')).toHaveClass(newTheme === 'dark' ? 'dark' : '');
  });
});
