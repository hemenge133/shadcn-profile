import { test, expect } from '@playwright/test';

// Mobile-specific tests only run on mobile projects
test.describe('Mobile Theme Toggle Behavior', () => {
  // Test only on mobile viewports
  test.skip(({ viewport }) => !viewport || viewport.width > 640, 'Test only for mobile viewports');

  test('should be properly sized and positioned on mobile', async ({ page }) => {
    await page.goto('/');

    // Wait for the theme toggle to be visible
    const themeToggle = page.getByRole('button', { name: /light theme|dark theme/i });
    await themeToggle.waitFor({ state: 'visible' });

    // Wait for the loading animation to complete
    await page.waitForSelector('button[aria-label*="theme"]:not([disabled])');
    await page.waitForTimeout(500);

    // Check if the theme toggle has appropriate sizing for mobile
    const toggleSize = await themeToggle.boundingBox();

    // Ensure the toggle is properly sized for touch interactions
    // Adjust expected values based on actual button size (minimum 36x36 for mobile)
    expect(toggleSize?.width).toBeGreaterThanOrEqual(36);
    expect(toggleSize?.height).toBeGreaterThanOrEqual(36);

    // Check if the theme toggle is within the viewport
    const viewportSize = page.viewportSize();

    // Only run these checks if both toggleSize and viewportSize are defined
    if (toggleSize && viewportSize) {
      expect(toggleSize.x).toBeGreaterThanOrEqual(0);
      expect(toggleSize.y).toBeGreaterThanOrEqual(0);
      expect(toggleSize.x + toggleSize.width).toBeLessThanOrEqual(viewportSize.width);
      expect(toggleSize.y + toggleSize.height).toBeLessThanOrEqual(viewportSize.height);
    }

    // Get initial theme before interaction
    const initialTheme = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    });

    // Use click instead of tap (more reliable across browsers)
    await themeToggle.click();

    try {
      // Wait for theme change with a shorter timeout
      await page.waitForFunction(
        (initialTheme) => {
          const currentTheme = document.documentElement.classList.contains('dark')
            ? 'dark'
            : 'light';
          return currentTheme !== initialTheme;
        },
        initialTheme,
        { timeout: 3000 }
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      // If timeout, try clicking one more time
      console.log('Retrying button click after timeout');
      await themeToggle.click({ force: true });

      // Wait again with a longer timeout
      await page.waitForFunction(
        (initialTheme) => {
          const currentTheme = document.documentElement.classList.contains('dark')
            ? 'dark'
            : 'light';
          return currentTheme !== initialTheme;
        },
        initialTheme,
        { timeout: 5000 }
      );
    }

    // Verify theme was toggled
    const newTheme = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    });

    expect(newTheme).not.toBe(initialTheme);
  });
});

// Separate describe block for landscape tests
test.describe('Landscape Theme Toggle Behavior', () => {
  // Skip if not in landscape mode
  test.skip(
    ({ viewport }) => !viewport || viewport.width <= viewport.height,
    'Test only for landscape orientation'
  );

  test('should work correctly in landscape orientation', async ({ page }) => {
    await page.goto('/');

    // Find the theme toggle
    const themeToggle = page.getByRole('button', { name: /light theme|dark theme/i });
    await themeToggle.waitFor();

    // Wait for the loading animation to complete
    await page.waitForSelector('button[aria-label*="theme"]:not([disabled])');
    await page.waitForTimeout(500);

    // Verify toggle is visible and clickable
    await expect(themeToggle).toBeVisible();

    // Get initial theme
    const initialTheme = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    });

    // Toggle theme with force:true to ensure click
    await themeToggle.click({ force: true });

    try {
      // Wait for theme change with a shorter timeout
      await page.waitForFunction(
        (initialTheme) => {
          const currentTheme = document.documentElement.classList.contains('dark')
            ? 'dark'
            : 'light';
          return currentTheme !== initialTheme;
        },
        initialTheme,
        { timeout: 3000 }
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      // If timeout, try clicking one more time
      console.log('Retrying button click after timeout');
      await themeToggle.click({ force: true });

      // Wait again with a longer timeout
      await page.waitForFunction(
        (initialTheme) => {
          const currentTheme = document.documentElement.classList.contains('dark')
            ? 'dark'
            : 'light';
          return currentTheme !== initialTheme;
        },
        initialTheme,
        { timeout: 5000 }
      );
    }

    // Verify theme changed
    const newTheme = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    });

    expect(newTheme).not.toBe(initialTheme);
  });
});
