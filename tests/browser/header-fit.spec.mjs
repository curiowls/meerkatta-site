import {test, expect} from '@playwright/test';

for (const code of ['en','es','zh-Hans','zh-Hant','ja','de','fr','ko','pt-BR']) {
  test(`Header fits available space: ${code}`, async ({page}) => {
    await page.addInitScript(() => localStorage.setItem('meerkatta.websiteAnalytics.v1','deny'));
    await page.setViewportSize({width:1440,height:900});
    await page.goto(`${code === 'en' ? '' : '/' + code}/about/`);
    await page.evaluate(() => document.fonts.ready);
    const nav = page.locator('.w-nav');
    const toggle = page.locator('.w-menu-toggle');
    await expect(toggle).toBeHidden();
    for (const width of [1200,1100,1000,900,800,760,640,390,320]) {
      await page.setViewportSize({width,height:900});
      await page.waitForTimeout(80);
      const geometry = await nav.evaluate(n => {
        const compact = n.classList.contains('is-compact');
        const logo = n.querySelector('.w-logo').getBoundingClientRect();
        const language = n.querySelector('.language-picker').getBoundingClientRect();
        const links = n.querySelector('.w-nav-links').getBoundingClientRect();
        return {overflow:document.documentElement.scrollWidth > innerWidth,
          overlap:logo.right > language.left || (!compact && language.right > links.left),
          compact};
      });
      expect(geometry.overflow).toBe(false);
      expect(geometry.overlap).toBe(false);
      if (code === 'en' && width === 1100) expect(geometry.compact).toBe(false);
    }
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded','true');
    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded','false');
    await expect(page.locator('.w-nav-links')).toHaveJSProperty('inert',true);
    await page.setViewportSize({width:1440,height:900});
    await expect(toggle).toBeHidden();
    await expect(page.locator('.w-nav-links')).toHaveJSProperty('inert',false);
  });
}

test('Header remeasures when text metrics change', async ({page}) => {
  await page.setViewportSize({width:1200,height:900});
  await page.goto('/about/');
  await expect(page.locator('.w-menu-toggle')).toBeHidden();
  await page.locator('.language-display').evaluate(n => n.style.fontSize = '150px');
  await expect(page.locator('.w-menu-toggle')).toBeVisible();
  await page.locator('.language-display').evaluate(n => n.style.fontSize = '');
  await expect(page.locator('.w-menu-toggle')).toBeHidden();
});
