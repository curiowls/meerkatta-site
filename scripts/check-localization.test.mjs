import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {languages, pages, pagePath, alternates} from '../i18n/config.mjs';
import {catalogs, renderPage} from '../i18n/render.mjs';
import {appReturnLink} from '../i18n/return-link.mjs';

function shape(value) {
  if (Array.isArray(value)) return value.map(shape);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key,item]) => [key,shape(item)]));
  assert.equal(typeof value, 'string');
  assert.ok(value.trim(), 'Empty translation');
  assert.ok(!/TODO|TRANSLATE|undefined/.test(value), 'Unfinished translation');
  return 'string';
}

const appLanguagePath = new URL('../../../meerkatta/localization/AppLanguage.swift', import.meta.url);
test('Website matches the app interface languages plus Brazilian Portuguese', {skip:!existsSync(appLanguagePath)}, () => {
  const source = readFileSync(appLanguagePath,'utf8');
  const appCodes = [...source.matchAll(/case \w+ = "([\w-]+)"/g)].map(match=>match[1]);
  assert.deepEqual(new Set(languages.map(item=>item.code)), new Set([...appCodes,'pt-BR']));
});

test('Every language has complete, nonempty contextual copy', () => {
  const reference = shape(catalogs.en);
  for (const {code} of languages) assert.deepEqual(shape(catalogs[code]), reference, code);
});

test('Apple Watch release is reflected in every language and English metadata', () => {
  const appStore = 'https://apps.apple.com/app/meerkatta/id6766122029';
  for (const {code} of languages) {
    const c = catalogs[code];
    assert.ok(c.common.tagline.includes('Apple Watch'), code);
    assert.ok(c.common.watch.includes('App Store'), code);
    assert.ok(c.home.faq[1][1].includes('Apple Watch'), code);
    assert.ok(!`${c.common.watch} ${c.home.faq[1][1]}`.includes('2026'), `${code}: stale launch date`);
    assert.ok(renderPage(code, '').includes(`<a href="${appStore}">${c.common.watch}</a>`), `${code}: Watch download link`);
  }
  const home = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.ok(home.includes('macOS, iOS, iPadOS, watchOS'));
  assert.ok(home.includes('Now on the App Store'));
  assert.ok(!/planned for November|Coming November/.test(home));
  const help = readFileSync(new URL('../help/index.html', import.meta.url), 'utf8');
  assert.ok(help.includes('How does Apple Watch capture work?'));
  assert.ok(!help.includes('planned for November'));
});

test('Routes and reciprocal alternates preserve English URLs', () => {
  assert.equal(pagePath('en','pricing'), '/pricing/');
  for (const page of pages) {
    const links = alternates(page);
    assert.equal(links.length, 10);
    assert.equal(new Set(links.map(link=>link.attrs.hreflang)).size,10);
    assert.equal(links.at(-1).attrs.href, 'https://meerkatta.com'+pagePath('en',page));
  }
});

test('Localized main pages have translated content and stable purchase links', () => {
  for (const {code} of languages.filter(item=>item.code !== 'en')) {
    for (const page of pages) {
      const html = renderPage(code,page);
      assert.equal((html.match(/<h1[ >]/g)||[]).length,1, `${code}/${page} H1`);
      assert.ok(html.includes(`lang="${code}"`));
      assert.ok(html.includes(`href="https://meerkatta.com${pagePath(code,page)}"`));
      assert.ok(html.includes('/privacy/'));
      assert.ok(html.includes(catalogs[code].common.english));
      if (page==='pricing') {
        for (const plan of ['monthly','yearly','lifetime']) assert.ok(html.includes(`/pay/?plan=${plan}`));
        assert.ok(!html.includes('priceId='));
      }
    }
  }
});

test('App return keeps supported schemes, plans and sandbox state', () => {
  assert.equal(appReturnLink(new URLSearchParams('plan=annual&returnScheme=meerkatta-debug&sandbox=1')), 'meerkatta-debug://checkout/success?plan=yearly&sandbox=1');
  assert.equal(appReturnLink(new URLSearchParams('plan=monthly')), 'meerkatta://checkout/success?plan=monthly');
  assert.equal(appReturnLink(new URLSearchParams('plan=unknown&returnScheme=javascript')), 'meerkatta://checkout/success?plan=lifetime');
});
