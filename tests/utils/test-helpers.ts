import { Page } from '@playwright/test';

/**
 * Waits for page to be fully stable - DOM content, images, fonts loaded, and animations complete
 * @param page The Playwright page object
 */
export async function waitForPageStable(page: Page): Promise<void> {
  // Wait for network to be idle (no requests for 500ms)
  await page.waitForLoadState('networkidle');

  // Wait for fonts to load
  await page.evaluate(() => document.fonts.ready);

  // Wait for any remaining images to load
  await page.evaluate(async () => {
    const selectors = Array.from(document.querySelectorAll('img'));
    await Promise.all(
      selectors.map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.addEventListener('load', resolve);
          img.addEventListener('error', resolve); // also handle broken images
        });
      })
    );
  });

  // Wait a moment for any final rendering
  await page.waitForTimeout(500);
}

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

export async function getTheme(page: Page): Promise<'light' | 'dark'> {
  return page.evaluate(() => {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  });
}

export async function setTheme(page: Page, theme: 'light' | 'dark'): Promise<void> {
  await page.evaluate((targetTheme) => {
    // Get current theme
    const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    
    // Only change if needed
    if (currentTheme !== targetTheme) {
      // Try to find theme toggle button
      const themeButton = document.querySelector('button[aria-label*="theme" i]');
      if (themeButton instanceof HTMLButtonElement) {
        themeButton.click();
      } else {
        // Fallback: Directly modify theme
        if (targetTheme === 'dark') {
          document.documentElement.classList.add('dark');
          localStorage.setItem('theme', 'dark');
        } else {
          document.documentElement.classList.remove('dark');
          localStorage.setItem('theme', 'light');
        }
        
        // Dispatch storage event to notify any listeners
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'theme',
          newValue: targetTheme,
          oldValue: currentTheme,
          storageArea: localStorage
        }));
      }
    }
  }, theme);
  
  // Wait for theme change to take effect
  await page.waitForTimeout(1000);
}
