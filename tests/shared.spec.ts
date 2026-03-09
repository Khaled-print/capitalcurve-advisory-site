import { test, expect } from '@playwright/test';

test.describe('Shared — all viewports', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('no page-level horizontal overflow', async ({ page }) => {
    // Scroll through the page to trigger lazy-loaded content
    await page.evaluate(async () => {
      const step = window.innerHeight;
      const max = document.body.scrollHeight;
      for (let y = 0; y < max; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 100));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(300);

    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(overflow, 'page has horizontal overflow').toBe(false);
  });

  test('hero title is visible', async ({ page }) => {
    const title = page.locator('.hero-title');
    await expect(title).toBeVisible();
  });

  test('footer is visible with mailto link', async ({ page }) => {
    const footer = page.locator('footer.footer');
    await footer.scrollIntoViewIfNeeded();
    await expect(footer).toBeVisible();
    const mailto = footer.locator('a[href="mailto:khaled@capitalcurve.io"]');
    await expect(mailto).toBeVisible();
    await expect(mailto).toHaveText('khaled@capitalcurve.io');
  });

  test('pricing section has Diagnostic row with Complimentary text', async ({ page }) => {
    const pricing = page.locator('#pricing');
    await pricing.scrollIntoViewIfNeeded();
    await expect(pricing).toBeVisible();
    const complimentary = pricing.locator('.price', { hasText: 'Complimentary' });
    await expect(complimentary).toBeVisible();
  });

  test('scroll-to-section navigation works', async ({ page }) => {
    await page.evaluate(() => {
      const pricingSection = document.getElementById('pricing');
      if (pricingSection) pricingSection.scrollIntoView({ behavior: 'instant' });
    });
    await page.waitForTimeout(300);
    const pricing = page.locator('#pricing');
    await expect(pricing).toBeInViewport();
  });

  test('viewport meta includes viewport-fit=cover', async ({ page }) => {
    const content = await page.getAttribute('meta[name="viewport"]', 'content');
    expect(content).toContain('viewport-fit=cover');
  });

  test('no element uses background-attachment: fixed', async ({ page }) => {
    const hasFixed = await page.evaluate(() => {
      const all = document.querySelectorAll('*');
      for (const el of all) {
        if (getComputedStyle(el).backgroundAttachment === 'fixed') return true;
      }
      return false;
    });
    expect(hasFixed, 'found element with background-attachment: fixed').toBe(false);
  });

  test('hero fills viewport without initial vertical scrollbar', async ({ page }) => {
    const hero = page.locator('.hero');
    await expect(hero).toBeVisible();
    const heroHeight = await hero.evaluate((el) => el.getBoundingClientRect().height);
    const viewportHeight = await page.evaluate(() => window.innerHeight);
    // Allow 1px tolerance for sub-pixel rounding
    expect(heroHeight).toBeGreaterThanOrEqual(viewportHeight - 1);
  });
});
