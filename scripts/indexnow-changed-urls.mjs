import {execFileSync} from 'node:child_process'

const siteOrigin = 'https://meerkatta.com'
const [before, after = 'HEAD'] = process.argv.slice(2)

if (!before) {
  console.error('Usage: node scripts/indexnow-changed-urls.mjs <before-ref> [after-ref]')
  process.exit(2)
}

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

function sitemapUrls(ref) {
  const xml = fileAt(ref, 'public/sitemap.xml')
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

const oldSitemap = sitemapUrls(before)
const newSitemap = sitemapUrls(after)
const knownPublicPages = new Set([...oldSitemap, ...newSitemap])
const urls = new Set()
const files = changedFiles(before, after)

for (const path of files) {
  const url = pageUrl(path)
  if (url && knownPublicPages.has(url)) urls.add(url)
}

if (files.includes('public/sitemap.xml')) {
  for (const url of knownPublicPages) {
    if (oldSitemap.has(url) !== newSitemap.has(url)) urls.add(url)
  }
}

process.stdout.write([...urls].sort().join('\n'))
if (urls.size) process.stdout.write('\n')
