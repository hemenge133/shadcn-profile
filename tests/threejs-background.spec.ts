import { test, expect, Page } from '@playwright/test';

// Helper functions for theme handling
async function getCurrentTheme(page: Page): Promise<'light' | 'dark'> {
  return page.evaluate(() => {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  });
}

async function setTheme(page: Page, targetTheme: 'light' | 'dark'): Promise<void> {
  const currentTheme = await getCurrentTheme(page);
  console.log(`Current theme: ${currentTheme}, setting to: ${targetTheme}`);

  if (
    (currentTheme === 'dark' && targetTheme === 'dark') ||
    (currentTheme !== 'dark' && targetTheme === 'light')
  ) {
    console.log('Theme already matches target theme, no change needed');
    return;
  }

  // Try to find and click the theme toggle button
  try {
    const themeToggle = page.getByRole('button', { name: /light theme|dark theme/i });
    await themeToggle.waitFor({ state: 'visible', timeout: 2000 });
    await themeToggle.click({ force: true });

    // Wait for theme to change
    await page.waitForFunction(
      (expectedTheme: string) => {
        const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
        return currentTheme === expectedTheme;
      },
      targetTheme,
      { timeout: 5000 }
    );
  } catch (error) {
    console.log('Error clicking theme toggle, using localStorage fallback');
    console.log(error);
    // Force theme via localStorage as fallback
    await page.evaluate((theme: string) => {
      localStorage.setItem('theme-preference', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }, targetTheme);
  }

  // Verify theme was set correctly
  const newTheme = await getCurrentTheme(page);
  console.log(`Theme after change: ${newTheme}`);
  expect(newTheme).toBe(targetTheme);
}

// Create a dynamic test for unstable rendering tests
//const dynamicTest = test.extend({});

test.describe('ThreeJS Background Visual Tests', () => {
  // Add annotation to mark these tests as unstable due to random rendering
  test.describe.parallel('@unstable-rendering', () => {
    test('captures baseline images in light and dark mode', async ({ page, browserName }) => {
      // Skip this test in Firefox as it has different rendering of ThreeJS
      test.skip(browserName === 'firefox', 'ThreeJS renders differently in Firefox');

      // Navigate to homepage
      await page.goto('/');

      // Wait for ThreeJS to initialize (longer wait for animation to stabilize)
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000); // Wait for particle animation to stabilize

      // Make sure we can access the local storage (sometimes needed in test environment)
      await page.addInitScript(() => {
        Object.defineProperty(window, 'localStorage', {
          value: window.localStorage || { getItem: () => null, setItem: () => {} },
        });
      });

      // First capture light mode
      await setTheme(page, 'light');
      await page.waitForTimeout(2000); // Wait for theme transition

      // Take screenshot with a descriptive name (named by test and theme)
      const lightModeScreenshot = await page.screenshot({
        fullPage: false,
        clip: { x: 0, y: 0, width: 1280, height: 720 },
      });

      // Compare with baseline, or update baseline if it doesn't exist
      await expect(lightModeScreenshot).toMatchSnapshot(
        `threejs-background-light-${browserName}.png`,
        {
          maxDiffPixelRatio: 0.1, // Allow up to 10% of pixels to be different (animations will vary)
        }
      );

      // Now capture dark mode
      await setTheme(page, 'dark');
      await page.waitForTimeout(2000); // Wait for theme transition

      const darkModeScreenshot = await page.screenshot({
        fullPage: false,
        clip: { x: 0, y: 0, width: 1280, height: 720 },
      });

      // Compare with baseline, or update baseline if it doesn't exist
      await expect(darkModeScreenshot).toMatchSnapshot(
        `threejs-background-dark-${browserName}.png`,
        {
          maxDiffPixelRatio: 0.1, // Allow up to 10% of pixels to be different
        }
      );
    });

    test('navbar remains transparent with ThreeJS background visible', async ({
      page,
      browserName,
    }) => {
      // Skip this test in Firefox as it has different rendering of ThreeJS
      test.skip(browserName === 'firefox', 'ThreeJS renders differently in Firefox');

      // Navigate to homepage
      await page.goto('/');

      // Wait for ThreeJS to initialize
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);

      // Capture only the navbar area
      const navbarScreenshot = await page.screenshot({
        fullPage: false,
        clip: { x: 0, y: 0, width: 1280, height: 80 }, // Just the navbar height
      });

      // Compare with baseline, or update baseline if it doesn't exist
      await expect(navbarScreenshot).toMatchSnapshot(`navbar-transparency-${browserName}.png`, {
        maxDiffPixelRatio: 0.05, // Stricter threshold for navbar since it should be very consistent
      });

      // Toggle theme
      const currentTheme = await getCurrentTheme(page);
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      await setTheme(page, newTheme);
      await page.waitForTimeout(2000);

      // Capture navbar in other theme
      const navbarScreenshotNewTheme = await page.screenshot({
        fullPage: false,
        clip: { x: 0, y: 0, width: 1280, height: 80 },
      });

      // Compare with baseline, or update baseline if it doesn't exist
      await expect(navbarScreenshotNewTheme).toMatchSnapshot(
        `navbar-transparency-${newTheme}-${browserName}.png`,
        {
          maxDiffPixelRatio: 0.05,
        }
      );
    });
  });
});
