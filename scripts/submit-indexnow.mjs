const host = 'meerkatta.com'
const key = '9084875F-2271-4957-88C3-82EEDA1AF021'
const keyLocation = `https://${host}/${key}.txt`
const urls = (process.env.INDEXNOW_URLS || '')
  .split(/\r?\n/)
  .map((url) => url.trim())
  .filter(Boolean)

if (!urls.length) {
  console.log('No changed public URLs to submit.')
  process.exit(0)
}

if (urls.length > 10_000) throw new Error('IndexNow accepts at most 10,000 URLs per request')

for (const url of urls) {
  const parsed = new URL(url)
  if (parsed.protocol !== 'https:' || parsed.hostname !== host) {
    throw new Error(`Refusing to submit URL outside ${host}: ${url}`)
  }
}

const keyResponse = await fetch(keyLocation, {headers: {'cache-control': 'no-cache'}})
const liveKey = keyResponse.ok ? (await keyResponse.text()).trim() : ''
if (liveKey !== key) {
  throw new Error(`IndexNow verification key is not live at ${keyLocation}`)
}

const response = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: {'content-type': 'application/json; charset=utf-8'},
  body: JSON.stringify({host, key, keyLocation, urlList: urls}),
})

if (![200, 202].includes(response.status)) {
  const body = (await response.text()).trim()
  throw new Error(`IndexNow returned HTTP ${response.status}${body ? `: ${body}` : ''}`)
}

console.log(`IndexNow accepted ${urls.length} changed URL${urls.length === 1 ? '' : 's'} (HTTP ${response.status}):`)
for (const url of urls) console.log(`- ${url}`)
