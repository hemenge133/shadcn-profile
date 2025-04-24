import { Page } from '@playwright/test';

/**
 * Toggles the theme between light and dark
 * @param page The Playwright page object
 * @returns Promise with the new theme ('light' or 'dark')
 */
export async function toggleTheme(page: Page): Promise<'light' | 'dark'> {
  const initialTheme = await getCurrentTheme(page);

  // Find the theme toggle button
  const themeToggle = page.getByRole('button', { name: /light theme|dark theme/i });
  await themeToggle.waitFor({ state: 'visible' });

  // Wait for the loading animation to complete
  await page.waitForSelector('button[aria-label*="theme"]:not([disabled])');
  await page.waitForTimeout(1000);

  // Click theme toggle
  await themeToggle.click({ force: true });

  // Wait for the theme to change
  await page.waitForFunction((initialTheme: string) => {
    const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    return currentTheme !== initialTheme;
  }, initialTheme);

  // Return the new theme
  return getCurrentTheme(page);
}

/**
 * Gets the current theme
 * @param page The Playwright page object
 * @returns Promise with the current theme ('light' or 'dark')
 */
export async function getCurrentTheme(page: Page): Promise<'light' | 'dark'> {
  return page.evaluate(() => {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  });
}

/**
 * Toggles theme with Firefox-specific handling
 * @param page The Playwright page object
 * @returns Promise with the new theme ('light' or 'dark')
 */
export async function toggleThemeFirefox(page: Page): Promise<'light' | 'dark'> {
  // Get initial theme
  const initialTheme = await getCurrentTheme(page);
  console.log(`Initial theme in Firefox: ${initialTheme}`);

  // Toggle theme using JavaScript
  await page.evaluate(() => {
    // Try different selectors to find the theme button
    const selectors = [
      'button[aria-label*="theme"]',
      'header button:has(svg)',
      'button:has(svg)',
      'header button',
    ];

    let buttonFound = false;
    for (const selector of selectors) {
      const buttons = document.querySelectorAll(selector);
      for (const button of buttons) {
        console.log('Clicking button in Firefox:', selector);
        (button as HTMLButtonElement).click();
        buttonFound = true;
        break;
      }
      if (buttonFound) break;
    }

    // Force theme toggle via localStorage as a last resort
    if (!buttonFound) {
      console.log('No button found, forcing theme toggle via localStorage');
      const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
      if (currentTheme === 'dark') {
        localStorage.setItem('theme', 'light');
        document.documentElement.classList.remove('dark');
      } else {
        localStorage.setItem('theme', 'dark');
        document.documentElement.classList.add('dark');
      }
    }
  });

  // Wait for theme change to settle
  await page.waitForTimeout(2000);

  // Get new theme
  const newTheme = await getCurrentTheme(page);
  console.log(`New theme in Firefox: ${newTheme}, Initial: ${initialTheme}`);

  return newTheme;
}
