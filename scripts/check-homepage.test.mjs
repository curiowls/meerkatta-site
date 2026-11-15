import test from 'node:test';
import assert from 'node:assert/strict';
import {languages, pagePath} from '../i18n/config.mjs';
import {catalogs, renderPage} from '../i18n/render.mjs';
import {homepageCopy} from '../i18n/home.mjs';

test('All nine homepages have full copy, demos, navigation and indexable metadata', () => {
  const reference = Object.keys(homepageCopy('en', catalogs.en)).sort();
  for (const {code} of languages) {
    const copy = homepageCopy(code, catalogs[code]);
    assert.deepEqual(Object.keys(copy).sort(), reference, `${code}: copy parity`);
    for (const [key, value] of Object.entries(copy)) {
      assert.ok(value.trim(), `${code}.${key}: empty`);
      assert.ok(!/<script|\son\w+\s*=|javascript:/i.test(value), `${code}.${key}: unexpected active markup`);
    }
    const html = renderPage(code, '');
    for (const id of ['dunes','lookout','work','voice','home','pricing','faq','ready','cap-iphone','cap-mac']) assert.ok(html.includes(`id="${id}"`), `${code}: missing ${id}`);
    assert.equal((html.match(/data-expand/g)||[]).length,4);
    assert.equal((html.match(/hreflang=/g)||[]).length,12);
    assert.ok(html.includes('class="panel w-journal"'));
    assert.ok(html.includes('class="language-display"'));
    assert.ok(!html.includes('Português (Brasil)'));
    assert.ok(html.includes(`rel="canonical" href="https://meerkatta.com${pagePath(code)}"`));
    assert.ok(html.includes('data-language-switch'));
    assert.ok(html.includes(`href="${pagePath(code,'welcome')}"`));
    assert.ok(!/\{\{|noindex|In the making|Prototype note|experience prototype/.test(html));
    assert.ok(html.includes('macOS, iOS, iPadOS, watchOS'));
    assert.equal((html.match(/<h1[ >]/g)||[]).length,1);
    const graph = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1])['@graph'];
    const app = graph.find(item=>item['@type']==='SoftwareApplication');
    assert.equal(app['@id'],'https://meerkatta.com/#software');
    assert.deepEqual(app.offers.map(offer=>offer.price),['33.00','99.99','9.99']);
    assert.equal(graph.find(item=>item['@type']==='FAQPage').mainEntity.length,4);
  }
});

test('No English fallback for translated demo and journey copy', () => {
  const en = homepageCopy('en', catalogs.en);
  for (const {code} of languages.filter(l=>l.code!=='en')) {
    const c = homepageCopy(code, catalogs[code]);
    for (const key of ['t12','t13','t19','t28','t29','t41','t47','t58','t62','t80','t84','t92','t99','t126','t128','t130','a5','a6','a7','a8']) assert.notEqual(c[key], en[key], `${code}.${key}`);
  }
});
