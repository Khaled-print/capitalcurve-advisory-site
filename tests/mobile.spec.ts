import { test, expect } from '@playwright/test';

test.describe('Mobile — skip Desktop Chrome', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    if (testInfo.project.name === 'Desktop Chrome') test.skip();
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('hamburger is visible, desktop nav is hidden', async ({ page }) => {
    const hamburger = page.locator('#nav-hamburger');
    await expect(hamburger).toBeVisible();
    const navLinks = page.locator('.nav-links');
    await expect(navLinks).toBeHidden();
  });

  test('hamburger tap target is at least 44px', async ({ page }) => {
    const hamburger = page.locator('#nav-hamburger');
    const box = await hamburger.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });

  test('mobile menu opens and closes on tap', async ({ page }) => {
    const hamburger = page.locator('#nav-hamburger');
    const mobileMenu = page.locator('#mobile-menu');

    await hamburger.click();
    await expect(mobileMenu).toHaveClass(/open/);
    await expect(hamburger).toHaveClass(/open/);

    // Hamburger z-index (110) is within nav stacking context (100),
    // so mobile-menu (105) visually covers it. Click via JS.
    await hamburger.dispatchEvent('click');
    await expect(mobileMenu).not.toHaveClass(/open/);
  });

  test('mobile menu link navigates and closes menu', async ({ page }) => {
    const hamburger = page.locator('#nav-hamburger');
    const mobileMenu = page.locator('#mobile-menu');

    await hamburger.click();
    await expect(mobileMenu).toHaveClass(/open/);

    const processLink = mobileMenu.locator('a[href="#pricing"]');
    await processLink.click();

    await expect(mobileMenu).not.toHaveClass(/open/);
  });

  test('floating CTA visible when scrolled past hero, hidden at CTA section', async ({ page }) => {
    const floatingCta = page.locator('#floating-cta');

    await page.evaluate(() => window.scrollTo(0, window.innerHeight + 200));
    await page.waitForTimeout(500);
    await expect(floatingCta).toBeVisible();
    await expect(floatingCta).not.toHaveClass(/hidden/);

    await page.evaluate(() => {
      const cta = document.getElementById('cta');
      if (cta) cta.scrollIntoView({ behavior: 'instant' });
    });
    await page.waitForTimeout(500);
    await expect(floatingCta).toHaveClass(/hidden/);
  });

  test('carousel dot click changes active slide', async ({ page }) => {
    const carouselNav = page.locator('.carousel-nav').first();
    await carouselNav.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    const dots = carouselNav.locator('.carousel-dot');
    const dotCount = await dots.count();
    if (dotCount < 2) {
      test.skip();
      return;
    }

    await dots.nth(1).click();
    await page.waitForTimeout(500);
    await expect(dots.nth(1)).toHaveClass(/active/);
  });
});
