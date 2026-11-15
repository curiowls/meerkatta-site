import {test, expect} from '@playwright/test';
const locales=['en','es','zh-Hans','zh-Hant','ja','de','fr','ko','pt-BR'];
test.setTimeout(60_000);

test.beforeEach(async ({context})=>{
  await context.route('**/*', route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
  await context.addInitScript(()=>localStorage.setItem('meerkatta.websiteAnalytics.v1','deny'));
});

for (const code of locales) {
  test(`${code}: full homepage at desktop and mobile widths`, async ({page},testInfo)=>{
    const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(code==='en'?'/':`/${code}/`);
    await expect(page.locator('html')).toHaveAttribute('lang',code);
    await expect(page.locator('html')).toHaveClass('js');
    await expect(page.locator('[data-language-switch] option')).toHaveCount(9);
    await expect(page.locator('[data-expand]')).toHaveCount(4);
    await expect(page.locator('#faq details')).toHaveCount(4);
    for(const width of [1440,1280,1101,768,390,320]) {
      await page.setViewportSize({width,height:900});
      await page.waitForTimeout(150);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow ${code} ${width}`).toBe(true);
      const overlaps=await page.evaluate(()=>{
        const logo=document.querySelector('.w-logo').getBoundingClientRect();
        const select=document.querySelector('.language-picker').getBoundingClientRect();
        return logo.right>select.left;
      });
      expect(overlaps,`header overlap ${code} ${width}`).toBe(false);
    }
    await page.setViewportSize({width:390,height:844});
    await page.locator('.w-menu-toggle').click();
    await expect(page.locator('.w-nav-links')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('.w-nav-links')).toBeHidden();
    await page.locator('#lookout').scrollIntoViewIfNeeded();
    await expect(page.locator('#lookout')).toHaveClass(/is-open/);
    await page.locator('#tab-mac').click();
    await expect(page.locator('#cap-mac')).toBeVisible();
    await expect(page.locator('#cap-iphone')).toBeHidden();
    await page.locator('#tab-iphone').click();
    await expect(page.locator('#cap-iphone')).toBeVisible();
    await page.locator('#lookout details summary').click();
    await expect(page.locator('#lookout details')).toHaveAttribute('open','');
    await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
    await page.screenshot({path:testInfo.outputPath(`${code}-mobile.png`)});
    await page.setViewportSize({width:1440,height:900});
    await page.waitForTimeout(300);
    await page.screenshot({path:testInfo.outputPath(`${code}-desktop.png`)});
    expect(errors).toEqual([]);
  });
}

test('Language switching preserves the section and localized navigation',async({page})=>{
  await page.goto('/#voice');
  await page.locator('[data-language-switch]').selectOption('/ja/');
  await expect(page).toHaveURL(/\/ja\/#voice$/);
  await expect(page.locator('.w-nav a[href="/ja/welcome/"]')).toHaveCount(1);
});

test('Content and language links work without JavaScript',async({browser})=>{
  const context=await browser.newContext({javaScriptEnabled:false});
  const page=await context.newPage();
  await page.goto('http://127.0.0.1:5197/de/');
  await expect(page.locator('#cap-mac')).toBeVisible();
  await expect(page.locator('#cap-iphone')).toBeVisible();
  await expect(page.locator('.w-language-fallback a')).toHaveCount(9);
  await context.close();
});
