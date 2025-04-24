import { test, expect } from '@playwright/test';
import { toggleTheme, getCurrentTheme, toggleThemeFirefox } from './utils/test-helpers';

// Define a separate test group for tests with animated/dynamic content
const dynamicTest = test.extend({});

test.describe('Visual Regression Tests', () => {
  test('should maintain consistent UI appearance after theme toggle', async ({
    page,
    browserName,
  }) => {
    await page.goto('/');

    // Make sure page is fully loaded
    await page.waitForLoadState('networkidle');

    // Special handling for Firefox
    if (browserName === 'firefox') {
      console.log('Using Firefox-specific approach for visual regression test');
      await page.waitForTimeout(5000); // Give Firefox more time to load

      // Get initial theme
      const initialTheme = await getCurrentTheme(page);

      // Toggle theme using Firefox specific function
      const newTheme = await toggleThemeFirefox(page);

      // Verify new theme is different from initial theme
      expect(newTheme).not.toBe(initialTheme);

      // Verify the theme has changed on the HTML element
      await expect(page.locator('html')).toHaveClass(newTheme === 'dark' ? 'dark' : '');
      return;
    }

    // Capture the initial state
    const initialTheme = await getCurrentTheme(page);

    // Toggle theme
    const newTheme = await toggleTheme(page);

    // Verify new theme is different from initial theme
    expect(newTheme).not.toBe(initialTheme);

    // Verify the theme has changed on the HTML element
    await expect(page.locator('html')).toHaveClass(newTheme === 'dark' ? 'dark' : '');
  });

  // New test: Header appearance in both themes
  test('header should maintain consistent appearance in both themes', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Take screenshot of header in initial theme
    const initialTheme = await getCurrentTheme(page);

    await page.waitForTimeout(1500); // Wait for any animations

    // Capture the header
    const header = page.locator('header');
    await expect(header).toBeVisible();

    // Take screenshot of header in initial theme
    const headerScreenshot = await header.screenshot();

    // Compare with baseline
    await expect(headerScreenshot).toMatchSnapshot(`header-${initialTheme}.png`, {
      maxDiffPixelRatio: 0.05, // Allow up to 5% of pixels to be different
      threshold: 0.2, // More tolerant threshold for subtle animations
    });

    // Toggle theme
    const newTheme = await toggleTheme(page);
    await page.waitForTimeout(1500); // Wait for theme transition

    // Take screenshot of header in new theme
    const headerScreenshotAfterToggle = await header.screenshot();

    // Compare with baseline
    await expect(headerScreenshotAfterToggle).toMatchSnapshot(`header-${newTheme}.png`, {
      maxDiffPixelRatio: 0.05,
      threshold: 0.2,
    });
  });

  // New test: Test page content sections in different themes
  test('main page sections should render correctly in both themes', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500); // Wait for any animations

    // Get initial theme
    const initialTheme = await getCurrentTheme(page);

    // Test main sections - locate and screenshot each major section
    // This assumes common section elements like main, section, etc.
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();

    // Take screenshot of main content in initial theme
    const mainContentScreenshot = await mainContent.screenshot();
    await expect(mainContentScreenshot).toMatchSnapshot(`main-content-${initialTheme}.png`, {
      maxDiffPixelRatio: 0.3, // Allow up to 30% of pixels to be different
      threshold: 0.5, // More tolerant threshold for animations
    });

    // Toggle theme
    const newTheme = await toggleTheme(page);
    await page.waitForTimeout(1500); // Wait for theme transition

    // Take screenshot of main content in new theme
    const mainContentAfterToggle = await mainContent.screenshot();
    await expect(mainContentAfterToggle).toMatchSnapshot(`main-content-${newTheme}.png`, {
      maxDiffPixelRatio: 0.3, // Allow up to 30% of pixels to be different
      threshold: 0.5, // More tolerant threshold for animations
    });
  });

  // New test: Test responsive layouts
  test('should render correctly at different viewport sizes', async ({ page }) => {
    // Define common breakpoints to test
    const breakpoints = [
      { width: 375, height: 667, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1280, height: 800, name: 'desktop' },
      { width: 1920, height: 1080, name: 'large-desktop' },
    ];

    for (const bp of breakpoints) {
      // Set viewport size
      await page.setViewportSize({ width: bp.width, height: bp.height });

      // Navigate to the page
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500); // Wait for any responsive adjustments

      // Take full page screenshot
      const fullPageScreenshot = await page.screenshot({ fullPage: true });
      await expect(fullPageScreenshot).toMatchSnapshot(`responsive-${bp.name}.png`, {
        maxDiffPixelRatio: 0.25, // Allow up to 25% of pixels to be different
        threshold: 0.4, // More tolerant threshold for animations/ThreeJS
      });
    }
  });

  // New test: Project page appearance (if it exists)
  test('projects section should maintain consistent appearance', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500); // Wait for animations

    // Look for a projects section or projects link
    const projectsSection = page.locator('section:has-text("Projects")');

    // Only run this test if projects section exists
    if ((await projectsSection.count()) > 0) {
      // Take screenshot in initial theme
      const initialTheme = await getCurrentTheme(page);

      const projectsSectionScreenshot = await projectsSection.screenshot();
      await expect(projectsSectionScreenshot).toMatchSnapshot(
        `projects-section-${initialTheme}.png`,
        {
          maxDiffPixelRatio: 0.3, // Allow up to 30% of pixels to be different
          threshold: 0.5, // More tolerant threshold for animations
        }
      );

      // Toggle theme
      const newTheme = await toggleTheme(page);
      await page.waitForTimeout(1500); // Wait for theme transition

      // Take screenshot in new theme
      const projectsSectionAfterToggle = await projectsSection.screenshot();
      await expect(projectsSectionAfterToggle).toMatchSnapshot(`projects-section-${newTheme}.png`, {
        maxDiffPixelRatio: 0.3, // Allow up to 30% of pixels to be different
        threshold: 0.5, // More tolerant threshold for animations
      });
    } else {
      console.log('Projects section not found, skipping test');
      test.skip();
    }
  });
});

// Separate test group for tests with dynamic/animated content
// Use annotation to mark as unstable rendering tests
dynamicTest.describe('Visual Regression Tests - Dynamic Content @unstable-rendering', () => {
  dynamicTest(
    'main page sections with ThreeJS animations should render correctly',
    async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500); // Wait for any animations

      // Get initial theme
      const initialTheme = await getCurrentTheme(page);

      // Test main sections - locate and screenshot each major section
      // This assumes common section elements like main, section, etc.
      const mainContent = page.locator('main');
      await expect(mainContent).toBeVisible();

      // Take screenshot of main content in initial theme
      const mainContentScreenshot = await mainContent.screenshot();
      await expect(mainContentScreenshot).toMatchSnapshot(`main-content-${initialTheme}.png`, {
        maxDiffPixelRatio: 0.3, // Allow up to 30% of pixels to be different
        threshold: 0.5, // More tolerant threshold for animations
      });

      // Toggle theme
      const newTheme = await toggleTheme(page);
      await page.waitForTimeout(1500); // Wait for theme transition

      // Take screenshot of main content in new theme
      const mainContentAfterToggle = await mainContent.screenshot();
      await expect(mainContentAfterToggle).toMatchSnapshot(`main-content-${newTheme}.png`, {
        maxDiffPixelRatio: 0.3, // Allow up to 30% of pixels to be different
        threshold: 0.5, // More tolerant threshold for animations
      });
    }
  );

  // Responsive layouts test with ThreeJS
  dynamicTest(
    'responsive layouts with ThreeJS animations should render correctly',
    async ({ page }) => {
      // Define common breakpoints to test
      const breakpoints = [
        { width: 375, height: 667, name: 'mobile' },
        { width: 768, height: 1024, name: 'tablet' },
        { width: 1280, height: 800, name: 'desktop' },
        { width: 1920, height: 1080, name: 'large-desktop' },
      ];

      for (const bp of breakpoints) {
        // Set viewport size
        await page.setViewportSize({ width: bp.width, height: bp.height });

        // Navigate to the page
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1500); // Wait for any responsive adjustments

        // Take full page screenshot
        const fullPageScreenshot = await page.screenshot({ fullPage: true });
        await expect(fullPageScreenshot).toMatchSnapshot(`responsive-${bp.name}.png`, {
          maxDiffPixelRatio: 0.3, // Allow up to 30% of pixels to be different
          threshold: 0.5, // Very tolerant threshold for animations/ThreeJS
        });
      }
    }
  );

  // Projects section test with ThreeJS
  dynamicTest(
    'projects section with ThreeJS animations should maintain appearance',
    async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500); // Wait for animations

      // Look for a projects section or projects link
      const projectsSection = page.locator('section:has-text("Projects")');

      // Only run this test if projects section exists
      if ((await projectsSection.count()) > 0) {
        // Take screenshot in initial theme
        const initialTheme = await getCurrentTheme(page);

        const projectsSectionScreenshot = await projectsSection.screenshot();
        await expect(projectsSectionScreenshot).toMatchSnapshot(
          `projects-section-${initialTheme}.png`,
          {
            maxDiffPixelRatio: 0.3, // Allow up to 30% of pixels to be different
            threshold: 0.5, // More tolerant threshold for animations
          }
        );

        // Toggle theme
        const newTheme = await toggleTheme(page);
        await page.waitForTimeout(1500); // Wait for theme transition

        // Take screenshot in new theme
        const projectsSectionAfterToggle = await projectsSection.screenshot();
        await expect(projectsSectionAfterToggle).toMatchSnapshot(
          `projects-section-${newTheme}.png`,
          {
            maxDiffPixelRatio: 0.3, // Allow up to 30% of pixels to be different
            threshold: 0.5, // More tolerant threshold for animations
          }
        );
      } else {
        console.log('Projects section not found, skipping test');
        dynamicTest.skip();
      }
    }
  );
});
