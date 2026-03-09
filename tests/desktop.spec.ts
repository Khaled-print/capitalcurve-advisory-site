import { test, expect } from '@playwright/test';

test.describe('Desktop Chrome only', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    if (testInfo.project.name !== 'Desktop Chrome') test.skip();
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('desktop nav is visible, hamburger is hidden', async ({ page }) => {
    const navLinks = page.locator('.nav-links');
    await expect(navLinks).toBeVisible();
    const hamburger = page.locator('#nav-hamburger');
    await expect(hamburger).toBeHidden();
  });

  test('floating CTA is hidden on desktop', async ({ page }) => {
    const floatingCta = page.locator('#floating-cta');
    await expect(floatingCta).toBeHidden();
  });
});
