import assert from 'node:assert/strict'
import {test} from 'node:test'
import {collectChangedUrls, snapshotAt} from './indexnow-changed-urls.mjs'

const origin = 'https://meerkatta.com'
const config = (codes = ['en', 'fr', 'ja']) => `
export const languages = ${JSON.stringify(codes.map(code => ({code})))};
export const pages = ['', 'about', 'pricing', 'use-cases', 'welcome', 'help'];
export const pagePath = (code, page = '') => (code === 'en' ? '/' : '/' + code + '/') + (page ? page + '/' : '');
`
const catalog = {language: 'Language', common: {trial: 'Seven days'}, home: {title: 'Home'}, pricing: {title: 'Pricing'}}

async function fixture(overrides = {}) {
  const files = {
    'public/sitemap.xml': `<urlset><url><loc>${origin}/</loc></url><url><loc>${origin}/privacy/</loc></url></urlset>`,
    'i18n/config.mjs': config(),
    ...Object.fromEntries(['en', 'fr', 'ja'].map(code => [`i18n/locales/${code}.json`, JSON.stringify(catalog)])),
    ...overrides,
  }
  return snapshotAt('fixture', (_, path) => files[path] || '')
}

test('tracks public English HTML but excludes checkout and unrelated files', async () => {
  const snapshot = await fixture()
  assert.deepEqual(collectChangedUrls(['privacy/index.html', 'pay/index.html', 'padsandbox/index.html', 'docs/note.md', 'style.css'], snapshot, snapshot), [`${origin}/privacy/`])
})

test('includes all six generated pages for a shared locale-copy change', async () => {
  const before = await fixture()
  const after = await fixture({'i18n/locales/fr.json': JSON.stringify({...catalog, common: {trial: 'Updated'}})})
  const urls = collectChangedUrls(['i18n/locales/fr.json'], before, after)
  assert.equal(urls.length, 6)
  assert.ok(urls.every(url => url.startsWith(`${origin}/fr/`)))
})

test('limits a page-specific locale change to that page', async () => {
  const before = await fixture()
  const after = await fixture({'i18n/locales/fr.json': JSON.stringify({...catalog, pricing: {title: 'New pricing'}})})
  assert.deepEqual(collectChangedUrls(['i18n/locales/fr.json'], before, after), [`${origin}/fr/pricing/`])
})

test('ignores catalog formatting-only changes', async () => {
  const before = await fixture()
  const after = await fixture({'i18n/locales/fr.json': JSON.stringify(catalog, null, 2)})
  assert.deepEqual(collectChangedUrls(['i18n/locales/fr.json'], before, after), [])
})

test('English catalog copy is not mistaken for authored English HTML', async () => {
  const before = await fixture()
  const after = await fixture({'i18n/locales/en.json': JSON.stringify({...catalog, pricing: {title: 'New'}})})
  assert.deepEqual(collectChangedUrls(['i18n/locales/en.json'], before, after), [])
})

test('English picker label updates select English public routes', async () => {
  const before = await fixture()
  const after = await fixture({'i18n/locales/en.json': JSON.stringify({...catalog, language: 'New label'})})
  assert.deepEqual(collectChangedUrls(['i18n/locales/en.json'], before, after), [`${origin}/`, `${origin}/privacy/`])
})

test('shared renderer changes include generated and transformed English pages', async () => {
  const snapshot = await fixture()
  const urls = collectChangedUrls(['i18n/render.mjs'], snapshot, snapshot)
  assert.equal(urls.length, 14)
  assert.ok(urls.includes(`${origin}/fr/welcome/`))
  assert.ok(urls.includes(`${origin}/privacy/`))
  assert.ok(!urls.some(url => url.includes('/pay/')))
})

test('retains removed generated URLs for deletion notifications', async () => {
  const before = await fixture()
  const after = await fixture({'i18n/config.mjs': config(['en', 'ja'])})
  const urls = collectChangedUrls(['i18n/config.mjs'], before, after)
  assert.ok(urls.includes(`${origin}/fr/`))
  assert.ok(urls.includes(`${origin}/fr/help/`))
  assert.equal(urls.length, new Set(urls).size)
})

test('first deployment includes the full generated public inventory', async () => {
  const empty = await snapshotAt('zero', () => '')
  const after = await fixture()
  assert.equal(collectChangedUrls(['public/sitemap.xml', 'i18n/config.mjs'], empty, after).length, 14)
})

test('sitemap-only deletions are included', async () => {
  const before = await fixture()
  const after = await fixture({'public/sitemap.xml': `<urlset><url><loc>${origin}/</loc></url></urlset>`})
  assert.deepEqual(collectChangedUrls(['public/sitemap.xml'], before, after), [`${origin}/privacy/`])
})

test('homepage renderer and locale home catalog changes select affected homepages', async () => {
  const snapshot = await fixture()
  assert.deepEqual(collectChangedUrls(['i18n/home.mjs'], snapshot, snapshot), [`${origin}/`, `${origin}/fr/`, `${origin}/ja/`])
  assert.deepEqual(collectChangedUrls(['i18n/home/en.json'], snapshot, snapshot), [`${origin}/`])
})
