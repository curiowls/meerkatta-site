import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {applySiteChrome} from './site-chrome-plugin.mjs';
import {renderPage} from '../i18n/render.mjs';
import {languages, pages, pagePath} from '../i18n/config.mjs';

test('English-only field notes follow localized navigation in every language', () => {
  for (const {code} of languages) {
    for (const page of ['', 'about']) {
      const html = applySiteChrome(renderPage(code, page), pagePath(code, page));
      const links = html.match(/<div class="w-nav-links"[^>]*>([\s\S]*?)<\/div>/)[1];
      assert.match(links, /<a href="\/journal\/">[^<]+<\/a>\s*$/);
    }
  }
});

test('Inner pages share homepage navigation and footer in all nine languages', () => {
  for (const {code} of languages) for (const page of pages.filter(Boolean)) {
    const input = renderPage(code, page);
    const html = applySiteChrome(input, pagePath(code, page));
    assert.equal((html.match(/class="w-nav"/g) || []).length, 1);
    assert.equal((html.match(/class="w-foot"/g) || []).length, 1);
    assert.ok(!html.includes('class="site-nav"'));
    assert.ok(!html.includes('class="site-footer"'));
    assert.ok(html.includes(`href="${pagePath(code, 'pricing')}"`));
    assert.ok(html.includes(`href="${pagePath(code)}#downloads"`));
    for (const language of languages) assert.ok(html.includes(`value="${pagePath(language.code, page)}"`));
    assert.equal(html.match(/<main[\s\S]*?<\/main>/)[0], input.match(/<main[\s\S]*?<\/main>/)[0]);
    assert.ok(!html.includes('src="/world/home.js"'));
  }
});

test('Homepage, checkout and review drafts retain their behavior', () => {
  const home = renderPage('en', '');
  assert.equal(applySiteChrome(home, '/'), home);
  for (const path of ['pay/index.html', 'padsandbox/index.html']) {
    const html = readFileSync(new URL('../' + path, import.meta.url), 'utf8');
    assert.equal(applySiteChrome(html, '/' + path), html);
  }
  const draft = '<html><body><nav class="site-nav"></nav><main>Review only</main></body></html>';
  assert.equal(applySiteChrome(draft, '/docs/field-notes/drafts/example.html'), draft);
});

test('English-only articles link language choices to localized homes, not nonexistent translations', () => {
  const path = 'journal/keep-the-words-you-would-use/index.html';
  const html = applySiteChrome(readFileSync(new URL('../' + path, import.meta.url), 'utf8'), '/' + path);
  assert.ok(html.includes('value="/zh-Hans/"'));
  assert.ok(!html.includes('value="/zh-Hans/journal/'));
  assert.ok(html.includes('rel="canonical" href="https://meerkatta.com/journal/keep-the-words-you-would-use/"'));
});
