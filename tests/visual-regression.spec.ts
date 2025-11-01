import { test, expect } from '@playwright/test';
import {
  toggleTheme,
  getCurrentTheme,
  toggleThemeFirefox,
  waitForPageStable,
  getTheme,
  setTheme,
} from './utils/test-helpers';

// Add a custom declaration for the test environment flag
declare global {
  interface Window {
    IS_VISUAL_TEST?: boolean;
  }
}

// Define a separate test group for tests with animated/dynamic content
const dynamicTest = test.extend({});

// Set up test context to disable animations
test.beforeEach(async ({ page }) => {
  // Disable ALL animations and transitions before running visual tests
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        transition-duration: 0s !important;
        animation-delay: 0s !important;
        transition-delay: 0s !important;
        animation: none !important;
        transition: none !important;
        animation-play-state: paused !important;
        animation-fill-mode: forwards !important;
        transition-property: none !important;
      }
      
      /* Completely freeze any SVG animations */
      svg * {
        animation: none !important;
        transition: none !important;
      }
      
      /* Stop any canvas animations */
      canvas {
        animation: none !important;
      }
    `,
  });
  
  // Disable any additional animated components (WebGL/ThreeJS-related, if any)
  await page.evaluate(() => {
    // Capture any requestAnimationFrame calls and prevent them
    const originalRAF = window.requestAnimationFrame;
    window.requestAnimationFrame = function(callback) {
      // Execute once and don't continue animation loop
      return setTimeout(callback, 0);
    };
    
    // Flag for test environment
    window.IS_VISUAL_TEST = true;
  });
});

test.describe('Visual Regression Tests', () => {
  // Set a longer timeout for visual regression tests
  test.setTimeout(60000);

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for initial page load and animations
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Increased wait time for animations
  });

  test('should maintain consistent UI appearance after theme toggle', async ({ page, browserName }) => {
    // Higher tolerance for Firefox
    const isFirefox = browserName === 'firefox';
    console.log(`Using ${browserName}-specific approach for visual regression test`);

    // Get initial theme
    const initialTheme = await getTheme(page);
    
    // Wait for main content to be visible
    await page.waitForSelector('main', { state: 'visible', timeout: 30000 });
    
    // Take screenshot before toggle
    const beforeScreenshot = await page.screenshot();
    
    // Toggle theme
    await setTheme(page, initialTheme === 'dark' ? 'light' : 'dark');
    await page.waitForTimeout(3000); // Increased wait for transition
    
    // Take screenshot after toggle
    const afterScreenshot = await page.screenshot();
    
    // Compare screenshots with browser-specific thresholds
    await expect(beforeScreenshot).toMatchSnapshot(`before-toggle-${initialTheme}.png`, {
      maxDiffPixelRatio: isFirefox ? 0.25 : 0.15,
      threshold: isFirefox ? 0.8 : 0.6,
      maxDiffPixels: isFirefox ? 5000 : 2000
    });
    
    await expect(afterScreenshot).toMatchSnapshot(`after-toggle-${initialTheme === 'dark' ? 'light' : 'dark'}.png`, {
      maxDiffPixelRatio: isFirefox ? 0.25 : 0.15,
      threshold: isFirefox ? 0.8 : 0.6,
      maxDiffPixels: isFirefox ? 5000 : 2000
    });
  });

  // New test: Header appearance in both themes
  test('header should maintain consistent appearance in both themes', async ({ page }) => {
    await page.waitForTimeout(3000); // Wait for any animations and images to fully load

    // Capture the header
    const header = page.locator('header');
    await expect(header).toBeVisible();

    // Take screenshot of header in initial theme
    const initialTheme = await getCurrentTheme(page);
    const headerScreenshot = await header.screenshot();

    // Compare with baseline
    await expect(headerScreenshot).toMatchSnapshot(`header-${initialTheme}.png`, {
      maxDiffPixelRatio: 0.05, // Allow up to 5% of pixels to be different
      threshold: 0.2, // More tolerant threshold for subtle animations
      maxDiffPixels: 300, // Allow absolute pixel difference for different resolutions
    });

    // Toggle theme
    const newTheme = await toggleTheme(page);
    await page.waitForTimeout(3000); // Wait for theme transition

    // Take screenshot of header in new theme
    const headerScreenshotAfterToggle = await header.screenshot();

    // Compare with baseline
    await expect(headerScreenshotAfterToggle).toMatchSnapshot(`header-${newTheme}.png`, {
      maxDiffPixelRatio: 0.05,
      threshold: 0.2,
      maxDiffPixels: 300, // Allow absolute pixel difference for different resolutions
    });
  });

  test('main page sections should render correctly in both themes', async ({ page, browserName }) => {
    const isFirefox = browserName === 'firefox';
    const initialTheme = await getTheme(page);
    console.log(`Initial theme in ${browserName}: ${initialTheme}`);

    // Wait for main content with more reliable selector
    await page.waitForSelector('main[class*="flex"]', { state: 'visible', timeout: 30000 });
    const mainContent = page.locator('main[class*="flex"]');

    // Take screenshot of main content in initial theme
    const mainContentScreenshot = await mainContent.screenshot();
    await expect(mainContentScreenshot).toMatchSnapshot(`main-content-${initialTheme}.png`, {
      maxDiffPixelRatio: isFirefox ? 0.25 : 0.15,
      threshold: isFirefox ? 0.8 : 0.6,
      maxDiffPixels: isFirefox ? 5000 : 2000
    });

    // Toggle theme
    const newTheme = initialTheme === 'dark' ? 'light' : 'dark';
    await setTheme(page, newTheme);
    await page.waitForTimeout(3000); // Increased wait for transition

    console.log(`New theme in ${browserName}: ${newTheme}, Initial: ${initialTheme}`);

    // Take screenshot in new theme
    const newThemeScreenshot = await mainContent.screenshot();
    await expect(newThemeScreenshot).toMatchSnapshot(`main-content-${newTheme}.png`, {
      maxDiffPixelRatio: isFirefox ? 0.25 : 0.15,
      threshold: isFirefox ? 0.8 : 0.6,
      maxDiffPixels: isFirefox ? 5000 : 2000
    });
  });

  test('should render correctly at different viewport sizes', async ({ page, browserName }) => {
    const isFirefox = browserName === 'firefox';
    
    // Define breakpoints
    const breakpoints = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1280, height: 800 },
      { name: 'large-desktop', width: 1920, height: 1080 }
    ];

    // Test each breakpoint
    for (const bp of breakpoints) {
      // Set viewport size
      await page.setViewportSize({ width: bp.width, height: bp.height });
      await page.waitForTimeout(3000); // Increased wait for layout to stabilize

      // Take full page screenshot
      const fullPageScreenshot = await page.screenshot({ fullPage: true });
      await expect(fullPageScreenshot).toMatchSnapshot(`responsive-${bp.name}.png`, {
        maxDiffPixelRatio: isFirefox ? (bp.name === 'mobile' ? 0.3 : 0.25) : (bp.name === 'mobile' ? 0.2 : 0.15),
        threshold: isFirefox ? (bp.name === 'mobile' ? 0.85 : 0.8) : (bp.name === 'mobile' ? 0.7 : 0.6),
        maxDiffPixels: isFirefox ? (bp.name === 'mobile' ? 6000 : 5000) : (bp.name === 'mobile' ? 3000 : 2000)
      });
    }
  });

  test('projects section should maintain consistent appearance', async ({ page, browserName }) => {
    const isFirefox = browserName === 'firefox';
    const initialTheme = await getTheme(page);

    // Wait for projects section with more reliable selector
    await page.waitForSelector('section[id="projects"]', { state: 'visible', timeout: 30000 });
    const projectsSection = page.locator('section[id="projects"]');

    // Take screenshot of projects section in initial theme
    const projectsSectionScreenshot = await projectsSection.screenshot();
    await expect(projectsSectionScreenshot).toMatchSnapshot(
      `projects-section-${initialTheme}.png`,
      {
        maxDiffPixelRatio: isFirefox ? 0.25 : 0.15,
        threshold: isFirefox ? 0.8 : 0.6,
        maxDiffPixels: isFirefox ? 5000 : 2000
      }
    );

    // Toggle theme
    const newTheme = initialTheme === 'dark' ? 'light' : 'dark';
    await setTheme(page, newTheme);
    await page.waitForTimeout(3000); // Increased wait for transition

    // Take screenshot in new theme
    const newThemeScreenshot = await projectsSection.screenshot();
    await expect(newThemeScreenshot).toMatchSnapshot(
      `projects-section-${newTheme}.png`,
      {
        maxDiffPixelRatio: isFirefox ? 0.25 : 0.15,
        threshold: isFirefox ? 0.8 : 0.6,
        maxDiffPixels: isFirefox ? 5000 : 2000
      }
    );
  });
});

// Separate test group for tests with dynamic/animated content
// Use annotation to mark as unstable rendering tests
dynamicTest.describe('Visual Regression Tests - Dynamic Content @unstable-rendering', () => {
  test.setTimeout(90000);

  dynamicTest.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Increased wait for animations
  });

  dynamicTest(
    'main page sections with ThreeJS animations should render correctly',
    async ({ page, browserName }) => {
      const isFirefox = browserName === 'firefox';
      const initialTheme = await getTheme(page);

      // Wait for main content with more reliable selector
      await page.waitForSelector('main[class*="flex"]', { state: 'visible', timeout: 30000 });
      const mainContent = page.locator('main[class*="flex"]');

      // Take screenshot of main content in initial theme
      const mainContentScreenshot = await mainContent.screenshot();
      await expect(mainContentScreenshot).toMatchSnapshot(`main-content-${initialTheme}.png`, {
        maxDiffPixelRatio: isFirefox ? 0.25 : 0.1,
        threshold: isFirefox ? 0.8 : 0.5,
        maxDiffPixels: isFirefox ? 5000 : 500
      });

      // Toggle theme
      const newTheme = initialTheme === 'dark' ? 'light' : 'dark';
      await setTheme(page, newTheme);
      await page.waitForTimeout(3000); // Increased wait for transition and animations

      // Take screenshot in new theme
      const newThemeScreenshot = await mainContent.screenshot();
      await expect(newThemeScreenshot).toMatchSnapshot(`main-content-${newTheme}.png`, {
        maxDiffPixelRatio: isFirefox ? 0.25 : 0.1,
        threshold: isFirefox ? 0.8 : 0.5,
        maxDiffPixels: isFirefox ? 5000 : 500
      });
    }
  );

  test('responsive layouts with ThreeJS animations should render correctly', async ({ page, browserName }) => {
    const isFirefox = browserName === 'firefox';
    
    // Define breakpoints
    const breakpoints = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1280, height: 800 },
      { name: 'large-desktop', width: 1920, height: 1080 }
    ];

    // Test each breakpoint
    for (const bp of breakpoints) {
      // Set viewport size
      await page.setViewportSize({ width: bp.width, height: bp.height });
      await page.waitForTimeout(3000); // Increased wait for layout and animations

      // Take full page screenshot
      const fullPageScreenshot = await page.screenshot({ fullPage: true });
      await expect(fullPageScreenshot).toMatchSnapshot(`responsive-${bp.name}.png`, {
        maxDiffPixelRatio: isFirefox ? (bp.name === 'mobile' ? 0.3 : 0.25) : (bp.name === 'mobile' ? 0.15 : 0.1),
        threshold: isFirefox ? (bp.name === 'mobile' ? 0.85 : 0.8) : (bp.name === 'mobile' ? 0.6 : 0.4),
        maxDiffPixels: isFirefox ? (bp.name === 'mobile' ? 6000 : 5000) : (bp.name === 'mobile' ? 2000 : 1000)
      });
    }
  });

  test('projects section with ThreeJS animations should maintain appearance', async ({ page, browserName }) => {
    const isFirefox = browserName === 'firefox';
    const initialTheme = await getTheme(page);

    // Wait for projects section with more reliable selector
    await page.waitForSelector('section[id="projects"]', { state: 'visible', timeout: 30000 });
    const projectsSection = page.locator('section[id="projects"]');

    // Take screenshot of projects section in initial theme
    const projectsSectionScreenshot = await projectsSection.screenshot();
    await expect(projectsSectionScreenshot).toMatchSnapshot(
      `projects-section-${initialTheme}.png`,
      {
        maxDiffPixelRatio: isFirefox ? 0.25 : 0.1,
        threshold: isFirefox ? 0.8 : 0.5,
        maxDiffPixels: isFirefox ? 5000 : 500
      }
    );

    // Toggle theme
    const newTheme = initialTheme === 'dark' ? 'light' : 'dark';
    await setTheme(page, newTheme);
    await page.waitForTimeout(3000); // Increased wait for transition and animations

    // Take screenshot in new theme
    const newThemeScreenshot = await projectsSection.screenshot();
    await expect(newThemeScreenshot).toMatchSnapshot(
      `projects-section-${newTheme}.png`,
      {
        maxDiffPixelRatio: isFirefox ? 0.25 : 0.1,
        threshold: isFirefox ? 0.8 : 0.5,
        maxDiffPixels: isFirefox ? 5000 : 500
      }
    );
  });
});
