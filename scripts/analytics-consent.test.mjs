import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import { analyticsConsentPlugin } from './analytics-consent-plugin.mjs'

const source = readFileSync(new URL('../public/analytics-consent.js', import.meta.url), 'utf8')
const key = 'meerkatta.websiteAnalytics.v1'
const id = 'G-TL3JS3LP0W'

// The Google script is recorded, never fetched. These doubles exercise consent
// transitions and storage failures without sending test traffic to production.
function visit({ choice, lang = 'en', url = 'https://meerkatta.com/', referrer = '', writeBlocked = false } = {}) {
  class Element {
    constructor(tag) { this.tag = tag; this.children = []; this.dataset = {}; this.listeners = {}; this.hidden = false }
    append(...items) { this.children.push(...items) }
    appendChild(item) { this.append(item) }
    setAttribute(name, value) { this[name] = value }
    addEventListener(name, callback) { this.listeners[name] = callback }
    querySelector(tag) { return this.children.flatMap(item => [item, ...(item.children || [])]).find(item => item.tag === tag) }
    closest() { return this.tag === 'button' ? this : null }
    focus() { this.focused = true }
  }
  const head = new Element('head'), body = new Element('body'), manage = new Element('a')
  const values = new Map(choice ? [[key, choice]] : [])
  const expiredCookies = []
  let cookies = '_ga=example; _ga_STREAM=example; feature_vote=keep'
  const document = {
    documentElement: { lang }, readyState: 'complete', head, body, referrer,
    createElement: tag => new Element(tag), createTextNode: text => ({ textContent: text }),
    getElementById: name => name === 'website-analytics-preferences' ? manage : null,
    get cookie() { return cookies }, set cookie(value) { expiredCookies.push(value) },
  }
  const location = new URL(url)
  location.reload = () => { location.reloads = (location.reloads || 0) + 1 }
  const window = { location, localStorage: {
    getItem: name => values.get(name) || null,
    setItem(name, value) { if (writeBlocked) throw new Error('Storage unavailable'); values.set(name, value) },
  } }
  vm.runInNewContext(source, { window, document, location, URL, URLSearchParams })
  const panel = () => body.children.find(child => child.className === 'analytics-choice')
  return { window, location, values, head, body, expiredCookies, panel,
    commands: () => (window.dataLayer || []).map(command => JSON.parse(JSON.stringify(Array.from(command)))),
    reopen() { manage.listeners.click({ preventDefault() {} }) },
    choose(value) {
      const target = panel().children.at(-1).children.find(button => button.dataset.choice === value)
      assert.ok(target, 'Missing consent button')
      panel().listeners.click({ target })
    },
  }
}

test('No Google tag before opt-in; decline persists without analytics', () => {
  const first = visit()
  assert.equal(first.head.children.length, 0)
  assert.equal(first.commands()[0][2].analytics_storage, 'denied')
  first.choose('deny')
  assert.equal(first.values.get(key), 'deny')
  assert.equal(first.head.children.length, 0)
  const next = visit({ choice: first.values.get(key) })
  assert.equal(next.panel(), undefined)
  assert.equal(next.head.children.length, 0)
  next.reopen()
  assert.equal(next.panel().hidden, false)
})

test('Explicit opt-in loads one tag, keeps advertising denied and sanitizes URLs', () => {
  const page = visit({ url: 'https://meerkatta.com/welcome/?email=person%40example.test&supabaseUserId=secret&returnScheme=meerkatta-debug&utm_source=family&utm_campaign=launch&utm_term=person%40example.test#private', referrer: 'https://meerkatta.com/pay/?email=person%40example.test#private' })
  page.choose('allow')
  assert.equal(page.head.children.length, 1)
  assert.equal(page.head.children[0].src, `https://www.googletagmanager.com/gtag/js?id=${id}`)
  const commands = page.commands()
  assert.equal(commands[1][2].analytics_storage, 'granted')
  assert.equal(commands[1][2].ad_storage, 'denied')
  assert.equal(commands[1][2].ad_user_data, 'denied')
  assert.equal(commands[1][2].ad_personalization, 'denied')
  assert.deepEqual(commands.find(command => command[0] === 'set' && command[1] === 'page_location'), ['set', 'page_location', 'https://meerkatta.com/welcome/?utm_source=family&utm_campaign=launch'])
  assert.deepEqual(commands.find(command => command[0] === 'set' && command[1] === 'page_referrer'), ['set', 'page_referrer', 'https://meerkatta.com/pay/'])
  const config = commands.find(command => command[0] === 'config')
  assert.equal(config[2].allow_google_signals, false)
  assert.equal(config[2].allow_ad_personalization_signals, false)
  page.reopen(); page.choose('allow')
  assert.equal(page.head.children.length, 1)
})

test('Withdrawal hard-disables measurement, expires only GA cookies, and reloads denied', () => {
  const page = visit({ choice: 'allow' })
  page.reopen(); page.choose('deny')
  assert.equal(page.window[`ga-disable-${id}`], true)
  assert.equal(page.values.get(key), 'deny')
  assert.equal(page.location.reloads, 1)
  assert.equal(page.commands().at(-1)[2].analytics_storage, 'denied')
  assert.ok(page.expiredCookies.some(cookie => cookie.startsWith('_ga=')))
  assert.ok(page.expiredCookies.some(cookie => cookie.startsWith('_ga_STREAM=')))
  assert.ok(page.expiredCookies.every(cookie => !cookie.startsWith('feature_vote=')))
  assert.equal(visit({ choice: page.values.get(key) }).head.children.length, 0)
})

test('Readable but unwritable storage cannot automatically reactivate an old opt-in', () => {
  const page = visit({ choice: 'allow', writeBlocked: true })
  assert.equal(page.head.children.length, 0)
  page.choose('allow')
  assert.equal(page.head.children.length, 1)
  page.reopen(); page.choose('deny')
  assert.equal(page.window[`ga-disable-${id}`], true)
  assert.equal(page.values.get(key), 'allow')
  const next = visit({ choice: page.values.get(key), writeBlocked: true })
  assert.equal(next.head.children.length, 0)
  assert.ok(next.panel())
})

test('Local preview never loads Google, even with saved consent', () => {
  assert.equal(visit({ choice:'allow', url:'http://127.0.0.1:5173/' }).head.children.length, 0)
})

test('Checkout paths are excluded at build time and runtime', () => {
  const plugin = analyticsConsentPlugin()
  for (const path of ['/pay', '/pay/', '/pay/index.html', '/padsandbox', '/padsandbox/']) {
    assert.deepEqual(plugin.transformIndexHtml.handler('', {path}), [])
    const page = visit({ choice:'allow', url:`https://meerkatta.com${path}?email=person%40example.test` })
    assert.equal(page.commands().length, 0)
    assert.equal(page.head.children.length, 0)
  }
  assert.equal(plugin.transformIndexHtml.handler('', {path:'/pt-BR/welcome/index.html'}).length, 2)
})

test('Asian-language preference sentences are complete', () => {
  for (const [lang, ending] of [['zh-Hans','中更改选择。'], ['zh-Hant','中更改選擇。'], ['ja','から変更できます。'], ['ko','에서 변경할 수 있습니다.']]) {
    const page = visit({lang})
    assert.equal(page.panel().children[1].children.at(-1).textContent, ending)
    assert.equal(page.panel().children[1].children[1].hreflang, 'en')
  }
})
