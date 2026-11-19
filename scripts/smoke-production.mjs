import assert from 'node:assert/strict';

const origin=new URL(process.env.SMOKE_ORIGIN || 'https://meerkatta.com');
assert.ok(['https://meerkatta.com','http://127.0.0.1:5197','http://127.0.0.1:5191'].includes(origin.origin),'Use production or the isolated local preview');
async function fetchText(path) {
  const response=await fetch(new URL(path,origin),{signal:AbortSignal.timeout(15_000),headers:{'cache-control':'no-cache'}});
  assert.equal(response.status,200,`${path}: HTTP ${response.status}`);
  if (path.startsWith('/assets/')) {
    assert.match(response.headers.get('content-type') || '',/(?:text|application)\/(?:javascript|ecmascript)/,`${path}: expected a JavaScript asset, not an HTML fallback`);
  }
  return response.text();
}
for (const path of ['/','/pricing/','/use-cases/ai-dictation-for-mac/','/zh-Hans/','/pay/','/padsandbox/']) {
  const html=await fetchText(path);
  assert.ok(/<h1[\s>]/.test(html),`${path}: missing H1`);
  if (path==='/pay/' || path==='/padsandbox/') {
    assert.ok(/name="robots"[^>]*noindex/.test(html),`${path}: missing noindex`);
    assert.ok(html.includes('id="checkout-retry"'),`${path}: missing recovery control`);
    assert.ok(!html.includes('analytics-consent.js'),`${path}: analytics must remain excluded`);
  } else {
    const canonical=html.match(/<link\b[^>]*\brel="canonical"[^>]*>/)?.[0];
    assert.ok(canonical?.includes(`href="https://meerkatta.com${path}"`),`${path}: missing canonical URL`);
    assert.ok(/class="[^"]*\bskip-link\b[^"]*"/.test(html),`${path}: missing skip link`);
  }
  const localScripts=[...html.matchAll(/<script\b[^>]*src="([^"#]+)"/g)].map(match=>match[1]).filter(src=>src.startsWith('/assets/'));
  for (const script of localScripts) await fetchText(script);
  console.log(`PASS ${path}`);
}
const sitemap=await fetchText('/sitemap.xml');
assert.ok(sitemap.includes('https://meerkatta.com/pricing/'));
console.log('PASS public route/asset smoke checks; no Paddle SDK or payment was executed.');
