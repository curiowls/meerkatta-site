import {renderHomepage} from '../i18n/home.mjs';
import {catalogs} from '../i18n/render.mjs';
import {languages, pages, pagePath} from '../i18n/config.mjs';

// Reuse the homepage markup, including localized labels, without its scene or demos.
export function applySiteChrome(html, path) {
  if (html.includes('data-world-home') || path.startsWith('/docs/')) return html;
  if (!html.includes('class="site-nav"')) return html;
  const segments = path.replace(/index\.html$/, '').split('/').filter(Boolean);
  const code = languages.find(l => l.code === segments[0])?.code || 'en';
  const page = segments.slice(code === 'en' ? 0 : 1).join('/');
  const home = renderHomepage(code, catalogs[code]);
  let nav = home.match(/<nav class="w-nav"[\s\S]*?<\/nav>/)[0];
  nav = nav.replace('href="#pricing"', `href="${pagePath(code, 'pricing')}"`)
    .replace('href="#downloads"', `href="${pagePath(code)}#downloads"`);
  if (pages.includes(page)) {
    for (const language of languages) nav = nav.replace(`value="${pagePath(language.code)}"`, `value="${pagePath(language.code,page)}"`);
  }
  const footer = home.match(/<footer class="w-foot"[\s\S]*?<\/footer>/)[0];
  html = html.replace(/<nav class="site-nav"[\s\S]*?<\/nav>/, nav)
    .replace(/<footer class="site-footer"[\s\S]*?<\/footer>/, footer);
  html = html.replace(/<body([^>]*)>/, (_, attrs) => attrs.includes('class="')
    ? '<body' + attrs.replace('class="', 'class="site-chrome ') + '>'
    : '<body class="site-chrome"' + attrs + '>');
  // Some authored articles already have the ID inserted by the locale plugin.
  html = html.replace('id="main-content" tabindex="-1" id="main-content"', 'id="main-content" tabindex="-1"');
  const fonts = html.includes('fonts.googleapis.com/css2') ? '' : (home.match(/<link href="https:\/\/fonts.googleapis.com[^>]+>/)?.[0] || '');
  return html.replace('</head>', fonts + '<link rel="stylesheet" href="/world/chrome.css"></head>')
    .replace('</body>', '<script type="module" src="/world/chrome.js"></script></body>');
}
export function siteChromePlugin() {
  return {name:'meerkatta-site-chrome', transformIndexHtml:{order:'pre', handler(html, context) {
    return applySiteChrome(html, context.path);
  }}};
}
