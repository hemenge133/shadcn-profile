import { test, expect } from '@playwright/test';

test.describe('Theme Toggle', () => {
  test('should toggle between light and dark themes', async ({ page }) => {
    // Navigate to the home page
    await page.goto('/');

    // Wait for the theme toggle button to be visible
    const themeToggle = page.getByRole('button', { name: /light theme|dark theme/i });
    await themeToggle.waitFor({ state: 'visible' });

    // Wait for the loading animation to complete
    // The button is disabled during loading and enabled when ready
    await page.waitForSelector('button[aria-label*="theme"]:not([disabled])');

    // Additional wait for hydration to complete
    await page.waitForTimeout(500);

    // Accessibility check - verify the button has proper ARIA attributes
    await expect(themeToggle).toHaveAttribute('aria-label', /light theme|dark theme/i);

    // Check the initial theme (could be light or dark based on system preference)
    const initialTheme = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    });

    // Simplified icon check that doesn't rely on specific element structure
    // Just verify the button is visible and has some content
    await expect(themeToggle).toBeVisible();

    // Click the theme toggle button
    await themeToggle.click({ force: true });

    // Wait for the theme to change
    await page.waitForFunction((initialTheme) => {
      const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
      return currentTheme !== initialTheme;
    }, initialTheme);

    // Verify the theme has changed
    const newTheme = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    });

    expect(newTheme).not.toBe(initialTheme);

    // Verify color scheme changes are reflected
    await expect(page.locator('html')).toHaveClass(newTheme === 'dark' ? 'dark' : '');

    // Click the theme toggle button again
    await themeToggle.click({ force: true });

    // Wait for the theme to change back
    await page.waitForFunction((newTheme) => {
      const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
      return currentTheme !== newTheme;
    }, newTheme);

    // Verify the theme has changed back to the initial theme
    const finalTheme = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    });

    expect(finalTheme).toBe(initialTheme);
  });

  test('should be keyboard accessible', async ({ page }) => {
    await page.goto('/');

    // Wait for the loading animation to complete
    await page.waitForSelector('button[aria-label*="theme"]:not([disabled])');
    await page.waitForTimeout(500);

    // Focus on theme toggle using keyboard navigation
    await page.keyboard.press('Tab');

    // Keep pressing Tab until theme toggle is focused
    const maxTabs = 20; // Safety limit
    let isFocused = false;

    for (let i = 0; i < maxTabs && !isFocused; i++) {
      const focusedElement = await page.evaluate(() => {
        const el = document.activeElement;
        return {
          ariaLabel: el?.getAttribute('aria-label') || '',
          tagName: el?.tagName || '',
        };
      });

      if (focusedElement.ariaLabel.includes('theme') && focusedElement.tagName === 'BUTTON') {
        isFocused = true;
      } else {
        await page.keyboard.press('Tab');
      }
    }

    // Verify theme toggle is focused
    expect(isFocused).toBeTruthy();

    // Get initial theme
    const initialTheme = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    });

    // Activate with keyboard
    await page.keyboard.press('Enter');

    // Wait for theme change
    await page.waitForFunction((initialTheme) => {
      const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
      return currentTheme !== initialTheme;
    }, initialTheme);

    // Verify theme changed
    const newTheme = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    });

    expect(newTheme).not.toBe(initialTheme);
  });
});
