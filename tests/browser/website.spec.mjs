import {test,expect} from '@playwright/test';

test.beforeEach(async ({context}) => {
  // CI must never reach real analytics or the live payment provider.
  await context.route('**/*', route => {
    const url=new URL(route.request().url());
    return url.origin==='http://127.0.0.1:5197'?route.continue():route.abort();
  });
});

async function visit(page,path='/') {
  await page.addInitScript(() => {
    localStorage.setItem('meerkatta.websiteAnalytics.v1','deny');
  });
  await page.goto(path);
}

function tabKey(browserName) {
  // macOS WebKit uses Option-Tab to include links with default keyboard settings.
  return browserName==='webkit' && process.platform==='darwin'?'Alt+Tab':'Tab';
}

async function revealWork(page) {
  await page.locator('#work').evaluate(element => window.scrollTo({top:element.getBoundingClientRect().top + scrollY,behavior:'instant'}));
  const cue=page.locator('#work [data-more-cue]');
  const pinned=await page.evaluate(() => matchMedia('(min-width: 900px) and (min-height: 700px)').matches);
  if (pinned && await cue.getAttribute('aria-expanded') !== 'true') await cue.click();
  await expect(cue).toHaveAttribute('aria-expanded','true');
}

test('Skip navigation works on English and localized pages', async ({page,browserName}) => {
  for (const path of ['/','/zh-Hans/','/welcome/?checkout=success&plan=yearly']) {
    await visit(page,path);
    await page.keyboard.press(tabKey(browserName));
    await expect(page.locator('.skip-link')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('#main-content')).toBeFocused();
  }
});

test('Device tabs expose only the selected panel and support keyboard switching', async ({page}) => {
  await visit(page);
  await expect(page.locator('.mac-injection-demo')).toHaveAttribute('data-mac-phase',/done|listening|polishing/);
  const tabs=page.locator('[data-injection-tabs] [role="tab"]');
  await revealWork(page);
  await expect(tabs.first()).toBeVisible();
  await tabs.first().focus();
  await expect(tabs.first()).toBeFocused();
  await page.keyboard.press('Home');
  await expect(tabs.first()).toHaveAttribute('aria-selected','true');
  await expect(page.locator('#inject-ios')).toBeHidden();
  await expect(page.locator('#inject-ios')).toHaveJSProperty('inert',true);
  await page.keyboard.press('ArrowRight');
  await expect(tabs.last()).toBeFocused();
  await expect(tabs.last()).toHaveAttribute('aria-selected','true');
  await expect(page.locator('#inject-mac')).toBeHidden();
  await expect(page.locator('#inject-mac')).toHaveJSProperty('inert',true);
});

test('Reduced motion leaves the Mac demonstration in its finished state', async ({page}) => {
  await page.emulateMedia({reducedMotion:'reduce'});
  await visit(page);
  await revealWork(page);
  await page.locator('[data-injection-tabs] [role="tab"]').first().focus();
  await page.keyboard.press('Home');
  await expect(page.locator('.mac-injection-demo')).toHaveAttribute('data-mac-phase','done');
});

test('Main content remains available when the homepage enhancement is blocked', async ({page}) => {
  await page.route('**/assets/*.js',route => route.abort());
  await visit(page);
  await expect(page.locator('main h1')).toBeVisible();
  await expect(page.locator('.w-nav-links')).toBeVisible();
  await expect(page.locator('#work')).toContainText('Quick');
});

test('Mobile menu, billing switch and primary layouts remain usable', async ({page}) => {
  await page.setViewportSize({width:390,height:844});
  await visit(page,'/about/');
  await page.locator('.w-menu-toggle').click();
  await page.locator('.w-nav-links').getByRole('link',{name:'Pricing',exact:true}).click();
  await expect(page).toHaveURL(/\/pricing\/$/);
  await expect(page.locator('.w-menu-toggle')).toHaveAttribute('aria-expanded','false');
  await page.getByRole('button',{name:'Monthly',exact:true}).click();
  await expect(page.getByRole('link',{name:'Subscribe monthly',exact:true})).toHaveAttribute('href','/pay/?plan=monthly');
  await page.getByRole('button',{name:'Yearly Save $19.89',exact:true}).click();
  await expect(page.getByRole('link',{name:'Subscribe yearly',exact:true})).toHaveAttribute('href','/pay/?plan=yearly');
  for (const path of ['/','/pricing/','/use-cases/ai-dictation-for-mac/']) {
    await visit(page,path);
    for (const width of [320,390,768,1440]) {
      await page.setViewportSize({width,height:900});
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth<=document.documentElement.clientWidth), {message:`Overflow on ${path} at ${width}px`}).toBe(true);
    }
  }
});

test('Analytics choices persist and can be withdrawn without external tracking', async ({page}) => {
  await page.goto('/privacy/');
  await page.getByRole('button',{name:'Allow analytics',exact:true}).click();
  await expect.poll(() => page.evaluate(() => localStorage.getItem('meerkatta.websiteAnalytics.v1'))).toBe('allow');
  await page.reload();
  await expect(page.getByRole('button',{name:'Allow analytics',exact:true})).toBeHidden();
  await page.getByRole('link',{name:'website analytics preferences',exact:true}).click();
  await page.getByRole('button',{name:'No thanks',exact:true}).click();
  await expect.poll(() => page.evaluate(() => localStorage.getItem('meerkatta.websiteAnalytics.v1'))).toBe('deny');
  await expect(page.locator('script[src*="googletagmanager"]')).toHaveCount(0);
});

function paddleFixture(nextEvent) {
  let callback;
  const probe={opens:[],nextEvent,emit:name => callback?.({name})};
  window.__paddleProbe=probe;
  window.Paddle={
    Environment:{set:value => {probe.environment=value;}},
    Initialize(config) {
      callback=config.eventCallback;probe.token=config.token;
      if (location.search.includes('_ptxn=')) queueMicrotask(() => probe.emit('checkout.loaded'));
    },
    Checkout:{
      open(options) {
        probe.opens.push(options);
        if (probe.nextEvent==='throw') throw new Error('Fixture SDK failure');
        if (probe.nextEvent!=='wait') queueMicrotask(() => probe.emit(probe.nextEvent));
      },
      close() {queueMicrotask(() => probe.emit('checkout.closed'));},
    },
  };
}
async function mockPaddle(page,event='checkout.loaded') {
  await page.route('https://cdn.paddle.com/paddle/v2/paddle.js',route => route.fulfill({contentType:'text/javascript',body:`(${paddleFixture.toString()})(${JSON.stringify(event)});`}));
}

for (const [plan,price] of Object.entries({monthly:'pri_01kw6arnrm45wz6cvspds1cxej',yearly:'pri_01kw6at943hce5922bdw52e0bh',lifetime:'pri_01kw6am7fp2zvg5jztgd7qmasp'})) {
  test(`Mocked ${plan} checkout preserves approved pricing and account contract`, async ({page}) => {
    await mockPaddle(page);
    await page.goto(`/pay/?plan=${plan}&priceId=pri_unapproved&email=fixture%40example.test&supabaseUserId=fixture-account&returnScheme=meerkatta-debug`);
    await expect(page.getByRole('heading',{name:'Secure checkout is ready',exact:true})).toBeVisible();
    const options=await page.evaluate(() => window.__paddleProbe.opens[0]);
    expect(options.items).toEqual([{priceId:price,quantity:1}]);
    expect(options.customer.email).toBe('fixture@example.test');
    expect(options.customData).toEqual({plan,supabaseUserId:'fixture-account'});
    expect(options.settings.successUrl).toContain('returnScheme=meerkatta-debug');
    expect(options.discountCode).toBe(plan==='lifetime'?'launch':undefined);
    await expect(page.locator('#checkout-retry')).toBeHidden();
  });
}

test('SDK error and close recover through deliberate retries only', async ({page}) => {
  await mockPaddle(page,'checkout.error');
  await page.goto('/pay/?plan=yearly');
  await expect(page.getByRole('heading',{name:'Checkout could not open',exact:true})).toBeVisible();
  await expect(page.getByRole('button',{name:'Try checkout again',exact:true})).toBeVisible();
  expect(await page.evaluate(() => window.__paddleProbe.opens.length)).toBe(1);
  await page.evaluate(() => {window.__paddleProbe.nextEvent='checkout.loaded';});
  await page.getByRole('button',{name:'Try checkout again',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Secure checkout is ready',exact:true})).toBeVisible();
  await page.evaluate(() => window.__paddleProbe.emit('checkout.closed'));
  await expect(page.getByRole('heading',{name:'Checkout closed',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Try checkout again',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Secure checkout is ready',exact:true})).toBeVisible();
  expect(await page.evaluate(() => window.__paddleProbe.opens.length)).toBe(3);
  await expect(page.locator('script[src*="analytics-consent"]')).toHaveCount(0);
});

test('Stalled and throwing SDKs recover without creating repeated payments', async ({page}) => {
  await page.clock.install();
  await mockPaddle(page,'wait');
  await page.goto('/pay/?plan=monthly');
  await page.clock.fastForward(21_000);
  await expect(page.getByRole('heading',{name:'Checkout is taking longer than expected',exact:true})).toBeVisible();
  expect(await page.evaluate(() => window.__paddleProbe.opens.length)).toBe(1);
  await page.evaluate(() => {window.__paddleProbe.nextEvent='throw';});
  await page.getByRole('button',{name:'Try checkout again',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Checkout could not open',exact:true})).toBeVisible();
});

test('Sandbox failure recovery stays in the sandbox', async ({page}) => {
  await mockPaddle(page,'checkout.payment.error');
  await page.goto('/padsandbox/?plan=monthly&priceId=pri_fixture');
  await expect(page.locator('#checkout-retry')).toBeVisible();
  expect(await page.evaluate(() => window.__paddleProbe.environment)).toBe('sandbox');
  expect(await page.evaluate(() => window.__paddleProbe.token.startsWith('test_'))).toBe(true);
  expect(await page.evaluate(() => window.__paddleProbe.opens[0].items[0].priceId)).toBe('pri_fixture');
});

test('Transaction-link recovery reopens the same existing transaction', async ({page}) => {
  await mockPaddle(page);
  await page.goto('/pay/?_ptxn=txn_fixture');
  await expect(page.getByRole('heading',{name:'Secure checkout is ready',exact:true})).toBeVisible();
  expect(await page.evaluate(() => window.__paddleProbe.opens.length)).toBe(0);
  await page.evaluate(() => window.__paddleProbe.emit('checkout.closed'));
  await page.getByRole('button',{name:'Try checkout again',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Secure checkout is ready',exact:true})).toBeVisible();
  expect(await page.evaluate(() => window.__paddleProbe.opens[0])).toEqual({transactionId:'txn_fixture'});
});
