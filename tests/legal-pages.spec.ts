import { test, expect } from '@playwright/test';

// Guards the privacy policy page required by the WHOOP developer app
// registration. If a future migration drops this route, CI fails here.
test('/whoop/privacy returns 200 and renders', async ({ page }) => {
  const response = await page.goto('/whoop/privacy');
  expect(response?.status(), '/whoop/privacy should return HTTP 200').toBe(200);
  await expect(
    page.locator('h1').filter({ hasText: /Privacy Policy/i })
  ).toBeVisible();
});
