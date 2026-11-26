import {execFileSync} from 'node:child_process'
import {pathToFileURL} from 'node:url'
import {isDeepStrictEqual} from 'node:util'

const siteOrigin = 'https://meerkatta.com'
function git(args, options = {}) {
  return execFileSync('git', args, {encoding: 'utf8', ...options})
}

function fileAt(ref, path) {
  if (/^0+$/.test(ref)) return ''
  try {
    return git(['show', `${ref}:${path}`], {stdio: ['ignore', 'pipe', 'ignore']})
  } catch {
    return ''
  }
}

function sitemapUrls(xml) {
  return new Set(
    [...xml.matchAll(/<loc>\s*(https:\/\/meerkatta\.com\/[^<]*)\s*<\/loc>/g)]
      .map((match) => match[1].trim()),
  )
}

function changedFiles(from, to) {
  if (/^0+$/.test(from)) {
    return git(['ls-tree', '-r', '--name-only', to]).trim().split('\n').filter(Boolean)
  }

  return git(['diff', '--name-only', '-z', from, to])
    .split('\0')
    .filter(Boolean)
}

function pageUrl(path) {
  if (path === 'index.html') return `${siteOrigin}/`
  const match = path.match(/^(.+)\/index\.html$/)
  return match ? `${siteOrigin}/${match[1]}/` : null
}

export async function snapshotAt(ref, read = fileAt) {
  const publicPages = sitemapUrls(read(ref, 'public/sitemap.xml'))
  const localized = new Map()
  const catalogs = new Map()
  const source = read(ref, 'i18n/config.mjs')
  if (source) {
    // The self-contained route config is the same source used by the build.
    const config = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)
    for (const {code} of config.languages) {
      const routes = new Map()
      for (const page of config.pages) {
        const url = siteOrigin + config.pagePath(code, page)
        if (code !== 'en') publicPages.add(url)
        routes.set(page === '' ? 'home' : page === 'use-cases' ? 'useCases' : page, url)
      }
      localized.set(code, routes)
      const text = read(ref, `i18n/locales/${code}.json`)
      if (text) catalogs.set(code, JSON.parse(text))
    }
  }
  return {publicPages, localized, catalogs}
}

export function collectChangedUrls(files, oldSnapshot, newSnapshot) {
  const knownPublicPages = new Set([...oldSnapshot.publicPages, ...newSnapshot.publicPages])
  const generatedPages = new Set([oldSnapshot, newSnapshot].flatMap(snapshot =>
    [...snapshot.localized.entries()].filter(([code]) => code !== 'en').flatMap(([, routes]) => [...routes.values()]),
  ))
  const urls = new Set()
  for (const path of files) {
    const url = pageUrl(path)
    if (url && knownPublicPages.has(url)) urls.add(url)

    // The renderer also adds language navigation/alternates to English HTML.
    if (['i18n/config.mjs', 'i18n/render.mjs'].includes(path)) {
      for (const target of knownPublicPages) urls.add(target)
    }
    if (['i18n/home.mjs', 'world/home.html', 'i18n/home/journal.json', 'i18n/home/voice.json', 'i18n/home/injection.json'].includes(path)) {
      for (const snapshot of [oldSnapshot, newSnapshot]) {
        for (const routes of snapshot.localized.values()) {
          const home = routes.get('home')
          if (home) urls.add(home)
        }
      }
    }
    const homeCatalog = path.match(/^i18n\/home\/([^/]+)\.json$/)
    if (homeCatalog) {
      for (const snapshot of [oldSnapshot, newSnapshot]) {
        const home = snapshot.localized.get(homeCatalog[1])?.get('home')
        if (home) urls.add(home)
      }
    }
    const catalog = path.match(/^i18n\/locales\/([^/]+)\.json$/)
    if (!catalog) continue
    const code = catalog[1]
    const oldCatalog = oldSnapshot.catalogs.get(code) || {}
    const newCatalog = newSnapshot.catalogs.get(code) || {}
    const changedKeys = [...new Set([...Object.keys(oldCatalog), ...Object.keys(newCatalog)])]
      .filter(key => !isDeepStrictEqual(oldCatalog[key], newCatalog[key]))
    if (!changedKeys.length) continue
    for (const snapshot of [oldSnapshot, newSnapshot]) {
      const routes = snapshot.localized.get(code)
      if (!routes) continue
      if (code === 'en') {
        // English page copy is authored in HTML; only its picker label is read here.
        if (changedKeys.includes('language')) {
          for (const target of knownPublicPages) {
            if (!generatedPages.has(target)) urls.add(target)
          }
        }
      } else {
        const sharedChange = changedKeys.some(key => !routes.has(key))
        for (const [section, target] of routes) {
          if (sharedChange || changedKeys.includes(section)) urls.add(target)
        }
      }
    }
  }
  // Include generated route additions/removals, even though they aren't in Git.
  if (files.some(path => ['public/sitemap.xml', 'i18n/config.mjs'].includes(path))) {
    for (const url of knownPublicPages) {
      if (oldSnapshot.publicPages.has(url) !== newSnapshot.publicPages.has(url)) urls.add(url)
    }
  }
  return [...urls].sort()
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [before, after = 'HEAD'] = process.argv.slice(2)
  if (!before) {
    console.error('Usage: node scripts/indexnow-changed-urls.mjs <before-ref> [after-ref]')
    process.exit(2)
  }
  const urls = collectChangedUrls(changedFiles(before, after), await snapshotAt(before), await snapshotAt(after))
  process.stdout.write(urls.join('\n'))
  if (urls.length) process.stdout.write('\n')
}
