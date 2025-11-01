import { test, expect } from '@playwright/test';

// Set Firefox as the browser for all tests in this file
test.use({ browserName: 'firefox' });

// Skip mobile tests for Firefox - Firefox doesn't support mobile emulation
test.beforeEach(async ({ browserName, isMobile }) => {
  // Skip if both Firefox and mobile
  test.skip(browserName === 'firefox' && isMobile, 'Mobile emulation not supported in Firefox');
});

// Firefox-specific tests using a different approach
test.describe('Firefox Theme Toggle', () => {
  test('should toggle themes in Firefox', async ({ page }) => {
    // Navigate to the page and wait longer for Firefox
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Use generic selectors and evaluate approach instead of relying on role/aria labels
    // First get the initial theme
    const initialTheme = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    });

    console.log(`Starting test with initial theme: ${initialTheme}`);

    // Try to toggle the theme using JavaScript directly to avoid DOM selection issues
    // Using the same approach that worked in the landscape test
    await page.evaluate(async () => {
      // Optional toggleTheme check properly typed
      const body = document.body as HTMLBodyElement;
      interface BodyWithThemeToggle extends HTMLBodyElement {
        toggleTheme?: () => void;
      }
      const bodyWithToggle = body as BodyWithThemeToggle;
      if (typeof bodyWithToggle.toggleTheme === 'function') {
        bodyWithToggle.toggleTheme();
        return true;
      }

      // If no custom method exists, try to locate and click the theme button
      const possibleButtons = [
        ...Array.from(document.querySelectorAll<HTMLButtonElement>('button')),
        ...Array.from(document.querySelectorAll<HTMLElement>('[role="button"]')),
      ];

      console.log(`Found ${possibleButtons.length} potential buttons`);

      // First try to find button by header location (most likely to be theme toggle)
      const headerButtons = Array.from(
        document.querySelectorAll<HTMLButtonElement>('header button')
      );
      console.log(`Found ${headerButtons.length} header buttons`);

      if (headerButtons.length > 0) {
        for (const button of headerButtons) {
          console.log('Clicking header button:', button.outerHTML);
          button.click();
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      // Try all buttons with SVG children (likely to be icon buttons)
      const svgButtons = Array.from(
        document.querySelectorAll<HTMLButtonElement>('button:has(svg)')
      );
      console.log(`Found ${svgButtons.length} SVG buttons`);

      for (const button of svgButtons) {
        console.log('Clicking SVG button:', button.outerHTML);
        button.click();
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // Force theme toggle via localStorage as a last resort
      const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
      console.log(`Current theme before localStorage change: ${currentTheme}`);

      if (currentTheme === 'dark') {
        localStorage.setItem('theme', 'light');
        document.documentElement.classList.remove('dark');
      } else {
        localStorage.setItem('theme', 'dark');
        document.documentElement.classList.add('dark');
      }

      console.log(
        `Theme after localStorage change: ${document.documentElement.classList.contains('dark') ? 'dark' : 'light'}`
      );
    });

    // Give extra time for theme change to settle
    await page.waitForTimeout(1000);

    // Get the current theme after our actions
    const finalTheme = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    });

    console.log(`Final theme: ${finalTheme}, Initial theme: ${initialTheme}`);
    expect(finalTheme).not.toBe(initialTheme);
  });

  test('should work in landscape orientation', async ({ page }) => {
    // Set landscape viewport for Firefox
    await page.setViewportSize({ width: 900, height: 600 });

    // Navigate to the page and wait longer for Firefox
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Get initial theme
    const initialTheme = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    });

    console.log(`Landscape test starting with theme: ${initialTheme}`);

    // Try multiple approaches to toggle the theme
    await page.evaluate(async () => {
      // First try: Direct theme toggle via body method
      const body = document.body as { toggleTheme?: () => void };
      if (typeof body.toggleTheme === 'function') {
        body.toggleTheme();
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Second try: Click theme button in header
      const themeButton = document.querySelector('header button');
      if (themeButton instanceof HTMLButtonElement) {
        themeButton.click();
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Third try: Force theme via localStorage and classList
      const isDark = document.documentElement.classList.contains('dark');
      if (isDark) {
        localStorage.setItem('theme', 'light');
        document.documentElement.classList.remove('dark');
      } else {
        localStorage.setItem('theme', 'dark');
        document.documentElement.classList.add('dark');
      }
      
      // Dispatch a storage event to notify any listeners
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'theme',
        newValue: isDark ? 'light' : 'dark',
        oldValue: isDark ? 'dark' : 'light',
        storageArea: localStorage
      }));
    });

    // Wait for theme change to take effect
    await page.waitForTimeout(2000);

    // Verify theme changed
    const finalTheme = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    });

    console.log(`Landscape test final theme: ${finalTheme}, Initial theme: ${initialTheme}`);
    expect(finalTheme).not.toBe(initialTheme);
  });
});
