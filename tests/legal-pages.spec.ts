import { test, expect } from '@playwright/test';

// Guards the pages required by the WHOOP developer app registration.
// If a future migration (e.g. the v2 rewrite) drops these routes, CI fails here.
const requiredPages = [
  { path: '/privacy', heading: /Privacy Policy/i },
  { path: '/openwhoop', heading: /OpenWhoop/i },
];

test.describe('WHOOP developer app pages', () => {
  for (const { path, heading } of requiredPages) {
    test(`${path} returns 200 and renders`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status(), `${path} should return HTTP 200`).toBe(200);
      await expect(page.locator('h1').filter({ hasText: heading })).toBeVisible();
    });
  }
});
