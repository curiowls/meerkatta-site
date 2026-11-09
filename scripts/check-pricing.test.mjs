import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {languages} from '../i18n/config.mjs';
import {catalogs, renderPage} from '../i18n/render.mjs';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('Public pricing and structured offers match the approved USD prices', () => {
  const home = read('index.html');
  const pricing = read('pricing/index.html');
  const graph = JSON.parse(home.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
  const offers = graph.find(item => item['@type'] === 'SoftwareApplication').offers;
  assert.deepEqual(offers.map(offer => offer.price), ['33.00', '99.99', '9.99']);
  for (const html of [home, pricing]) {
    assert.ok(html.includes('$33'));
    assert.ok(html.includes('$49'));
    assert.ok(html.includes('$99.99'));
    assert.ok(html.includes('$9.99'));
    assert.ok(html.includes('$8.33'));
    assert.ok(!/\$90\b|\$9(?![\d.])|\$7\.50/.test(html));
  }
  assert.ok(pricing.includes('Save $19.89'));
  assert.equal((9.99 * 12 - 99.99).toFixed(2), '19.89');
});

test('All localized pricing pages display the same prices and annual equivalent', () => {
  for (const {code} of languages) {
    const html = renderPage(code, 'pricing');
    const usd = value => new Intl.NumberFormat(code, {style:'currency', currency:'USD', currencyDisplay:'code', maximumFractionDigits:2}).format(value);
    for (const price of [33, 9.99, 99.99]) assert.ok(html.includes(usd(price)), `${code}: ${price}`);
    const note = catalogs[code].pricing.annualNote.replaceAll(',', '.');
    assert.ok(note.includes('99.99'), code);
    assert.ok(note.includes('8.33'), code);
  }
});

test('Billing switch preserves prices and approved checkout plan links', () => {
  const price = {};
  const note = {};
  const checkout = {dataset:{}, tagName:'A'};
  const buttons = ['yearly', 'monthly'].map(option => ({
    dataset:{billingOption:option}, classList:{toggle() {}}, setAttribute() {},
    addEventListener(event, handler) { this.click = handler; },
  }));
  const plan = {
    querySelector: selector => ({'[data-managed-price]':price, '[data-managed-note]':note, '[data-managed-checkout]':checkout})[selector],
    querySelectorAll: () => buttons,
  };
  const document = {
    querySelector: () => null,
    querySelectorAll: selector => selector === '[data-managed-plan]' ? [plan] : [],
  };
  runInNewContext(read('main.js').replace("import './style.css';", ''), {document});
  buttons[1].click();
  assert.equal(price.innerHTML, '$9.99 <span>/mo</span>');
  assert.equal(checkout.href, '/pay/?plan=monthly');
  buttons[0].click();
  assert.equal(price.innerHTML, '$8.33 <span>/mo</span>');
  assert.ok(note.textContent.includes('$99.99'));
  assert.equal(checkout.href, '/pay/?plan=yearly');
});

test('Lifetime still opens its approved Paddle price with the launch discount', () => {
  let opened;
  const Paddle = {Initialize() {}, Checkout:{open(value) { opened = value; }}};
  runInNewContext(read('pay/pay.js').replaceAll('import.meta.env', 'env'), {
    env:{}, URLSearchParams, console,
    document:{body:{dataset:{}}, querySelector: () => null},
    window:{Paddle, location:{origin:'https://meerkatta.com', search:'?plan=lifetime'}},
  });
  assert.equal(opened.items[0].priceId, 'pri_01kw6am7fp2zvg5jztgd7qmasp');
  assert.equal(opened.discountCode, 'launch');
  assert.equal(opened.settings.allowDiscountRemoval, false);
});
