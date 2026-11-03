import {readFileSync, mkdirSync, writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {languages, pages, origin, appStore, macDownload, pagePath, languagePicker, alternates, openGraphLocales, escapeHtml as e} from './config.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
export const catalogs = Object.fromEntries(languages.map(({code}) => [code, JSON.parse(readFileSync(resolve(root, `i18n/locales/${code}.json`), 'utf8'))]));
const link = (href, text, cls = '') => `<a href="${e(href)}"${cls ? ` class="${cls}"` : ''}>${e(text)}</a>`;
const cards = (items, cls = 'about-card-grid') => `<div class="${cls}">${items.map(([title, text]) => `<article><h3>${e(title)}</h3><p>${e(text)}</p></article>`).join('')}</div>`;
const section = (title, body, cls = '') => `<section class="locale-section ${cls}"><h2>${e(title)}</h2>${body}</section>`;
const faq = items => `<div class="faq-list">${items.map(([q, a]) => `<div class="faq-item"><button class="faq-question" aria-expanded="false"><span>${e(q)}</span><span class="faq-icon" aria-hidden="true">+</span></button><div class="faq-answer" hidden><p>${e(a)}</p></div></div>`).join('')}</div>`;
const downloads = c => `<div class="hero-actions" id="downloads">${link(macDownload, c.common.mac, 'btn-primary')}${link(appStore, c.common.ios, 'btn-secondary')}</div><p class="hero-download-details">${e(c.common.trial)}</p><p class="platform-release-note">${e(c.common.watch)}</p>`;
const lockIllustration = c => `<figure><div class="capture-film-phone widget-guide locale-widget" data-done="true" role="img" aria-label="${e(c.welcome.lockTitle)}"><div class="widget-wallpaper"></div><div class="widget-island"></div><div class="widget-lock-title"><strong>12:27</strong></div><span class="widget-installed"><img src="/assets/meerkat-widget-light.png" alt=""></span><span class="widget-home-bar"></span></div></figure>`;

function navigation(code, c) {
  const items = ['use-cases', 'about', 'pricing', 'welcome', 'help'].map((page, i) => link(pagePath(code, page), c.nav[i])).join('') + link(pagePath(code) + '#downloads', c.nav[5], 'nav-cta');
  return `<nav class="site-nav" aria-label="MeerKatta"><div class="nav-inner"><a class="logo-link" href="${pagePath(code)}" aria-label="MeerKatta"><img class="app-logo" src="/app-icon.png" width="44" height="44" alt=""><img class="type-logo" src="/assets/MeerKatta-typelogo-dark.svg" width="150" height="30" alt="MeerKatta"></a><div class="nav-links">${items}</div><details class="mobile-menu"><summary aria-label="${e(c.menu)}"><span></span><span></span><span></span></summary><div class="mobile-menu-panel">${items}</div></details></div></nav>`;
}

function footer(code, c) {
  const english = text => `${text} (${c.common.english})`;
  return `<footer class="site-footer"><div class="footer-inner"><div><a class="footer-logo" href="${pagePath(code)}"><img class="footer-type-logo" src="/assets/MeerKatta-typelogo-dark.svg" width="140" height="28" alt="MeerKatta"></a><p>${e(c.common.tagline)}</p>${link(pagePath(code, 'welcome'), c.nav[3], 'footer-primary-link')}${link(appStore, c.common.ios, 'footer-primary-link')}</div><div class="footer-links">${link(pagePath(code, 'about'), c.nav[1])}${link(pagePath(code, 'pricing'), c.nav[2])}${link(pagePath(code, 'help'), c.nav[4])}${link('/journal/', english(c.common.journal))}${link('/privacy/', english(c.common.privacy))}${link('/terms/', english(c.common.terms))}${link('/refund/', english(c.common.refund))}${link('mailto:hello@meerkatta.com', c.common.support)}</div></div></footer>`;
}

function content(code, page, c) {
  const path = name => pagePath(code, name);
  if (page === '') return `<section class="locale-section locale-hero"><div><p class="eyebrow">${e(c.common.tagline)}</p><h1>${e(c.home.title)}</h1><p class="locale-lead">${e(c.home.lead)}</p>${downloads(c)}</div><div class="locale-example"><p class="eyebrow">${e(c.home.rawLabel)}</p><p>${e(c.home.raw)}</p><hr><p class="eyebrow">${e(c.home.resultLabel)}</p><h2>${e(c.home.resultTitle)}</h2><p>${e(c.home.result)}</p></div></section>${section(c.home.captureTitle, `<div class="locale-capture-demo"><p class="locale-lead">${e(c.home.captureText)}</p><figure><video controls playsinline preload="none" poster="/media/lock-capture-poster.jpg" aria-label="${e(c.home.captureTitle)}"><source src="/media/lock-capture.mp4" type="video/mp4"></video><figcaption>${e(c.common.imageNote)}</figcaption></figure></div>${cards(c.home.features, 'about-trust-grid')}`)}${section(c.nav[4], faq(c.home.faq))}${section(c.common.next, `<p>${e(c.welcome.lead)}</p>${link(path('welcome'), c.common.getStarted, 'btn-secondary')}`)}`;
  if (page === 'about') return `<section class="locale-section locale-prose"><h1>${e(c.about.title)}</h1><p class="locale-lead">${e(c.about.lead)}</p>${c.about.paragraphs.map(text => `<p>${e(text)}</p>`).join('')}</section>${section(c.about.visionTitle, `<p class="locale-lead">${e(c.about.visionLead)}</p>${cards(c.about.principles)}`)}${section(c.about.founderTitle, `<div class="founder-grid"><div><p>${e(c.about.founderText)}</p>${link('https://lugugul.com/', 'Lugugul Design')}</div><blockquote class="founder-quote"><p>“${e(c.about.quote)}”</p><cite>${e(c.about.quoteCredit)}</cite></blockquote></div>`)}${section(c.common.next, downloads(c))}`;
  if (page === 'pricing') {
    const p = c.pricing;
    const usd = value => new Intl.NumberFormat(code, {style:'currency', currency:'USD', currencyDisplay:'code', maximumFractionDigits:2}).format(value);
    return `<section class="locale-section"><h1>${e(p.title)}</h1><p class="locale-lead">${e(p.lead)}</p>${link(appStore, c.common.ios, 'btn-secondary')}<p class="locale-notice">${e(p.checkoutNote)}</p><div class="plan-grid"><article class="plan-card featured"><h2>${e(p.ownTitle)}</h2><p>${e(p.ownText)}</p><p class="price">${e(usd(33))}</p><p>${e(p.launch)}</p>${link('/pay/?plan=lifetime', p.buy, 'btn-primary')}</article><article class="plan-card"><h2>${e(p.managedTitle)}</h2><p>${e(p.managedText)}</p><p class="price">${e(usd(9))} <span>/ ${e(p.month)}</span></p>${link('/pay/?plan=monthly', p.monthly, 'btn-secondary')}<p class="price">${e(usd(90))} <span>/ ${e(p.year)}</span></p><p>${e(p.annualNote)}</p>${link('/pay/?plan=yearly', p.yearly, 'btn-primary')}</article></div><p class="hero-download-details">${e(c.common.trial)}</p></section>${section(c.nav[4], faq(p.faq))}`;
  }
  if (page === 'welcome') return `<section class="locale-section locale-payment" data-payment-confirmation hidden><p class="payment-success-label">${e(c.welcome.paymentComplete)}</p><h2>${e(c.welcome.successTitle)}</h2><p class="locale-lead">${e(c.welcome.licensePrepared)}</p>${link('meerkatta://checkout/success?plan=lifetime', c.welcome.openApp, 'btn-primary locale-open-app')}<p>${e(c.welcome.licenseHint)}</p></section><section class="locale-section" data-tips-intro><h1>${e(c.welcome.title)}</h1><p class="locale-lead">${e(c.welcome.lead)}</p>${cards(c.welcome.first, 'decision-grid')}${link(appStore, c.common.ios, 'btn-secondary')}</section>${section(c.welcome.setupTitle, cards(c.welcome.setup, 'about-trust-grid'))}${section(c.welcome.lockTitle, `<div class="locale-lock-guide">${lockIllustration(c)}<ol>${c.welcome.lockSteps.map(text => `<li>${e(text)}</li>`).join('')}</ol></div>`)}${section(c.welcome.habitsTitle, cards(c.welcome.habits, 'decision-grid'))}`;
  if (page === 'use-cases') return `<section class="locale-section"><h1>${e(c.useCases.title)}</h1><p class="locale-lead">${e(c.useCases.lead)}</p>${cards(c.useCases.cards, 'about-trust-grid')}${link(path('welcome'), c.common.getStarted, 'btn-primary')}</section>${section(c.useCases.englishGuide, `<ul class="locale-guide-links">${[['ai-dictation-for-mac','Mac · AI'],['thought-capture', c.home.features[0][0]],['custom-vocabulary', c.home.features[2][0]],['ai-workflows','AI']].map(([slug, title]) => `<li>${link(`/use-cases/${slug}/`, `${title} (${c.common.english})`)}</li>`).join('')}</ul>`)}${section(c.common.next, downloads(c))}`;
  return `<section class="locale-section"><h1>${e(c.help.title)}</h1><p class="locale-lead">${e(c.help.lead)}</p><div class="hero-actions">${link(path('welcome'), c.nav[3], 'btn-primary')}${link('mailto:hello@meerkatta.com', c.common.support, 'btn-secondary')}</div>${faq(c.help.faq)}</section>`;
}

export function renderPage(code, page) {
  const c = catalogs[code];
  const data = c[page === '' ? 'home' : page === 'use-cases' ? 'useCases' : page];
  const url = origin + pagePath(code, page);
  const title = `${data.title} | MeerKatta`;
  const schema = {'@context':'https://schema.org', '@type':'WebPage', '@id':url+'#webpage', url, name:title, description:data.lead, inLanguage:code, isPartOf:{'@id':origin+'/#website'}};
  return `<!doctype html><html lang="${code}" data-localized><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${e(title)}</title><meta name="description" content="${e(data.lead)}"><meta name="robots" content="max-image-preview:large"><link rel="canonical" href="${url}"><meta property="og:url" content="${url}"><meta property="og:title" content="${e(title)}"><meta property="og:description" content="${e(data.lead)}"><meta property="og:type" content="website"><meta property="og:site_name" content="MeerKatta"><meta property="og:locale" content="${openGraphLocales[code]}"><meta property="og:image" content="${origin}/assets/meerkatta-curious-search.jpg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="1200"><meta property="og:image:alt" content="MeerKatta"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${e(title)}"><meta name="twitter:description" content="${e(data.lead)}"><meta name="twitter:image" content="${origin}/assets/meerkatta-curious-search.jpg"><link rel="icon" href="/favicon.ico" sizes="128x128"><link rel="icon" type="image/png" href="/favicon-lbg.png" media="(prefers-color-scheme: light)"><link rel="icon" type="image/png" href="/favicon-dbg.png" media="(prefers-color-scheme: dark)"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><link rel="stylesheet" href="/style.css"><script type="application/ld+json">${JSON.stringify(schema).replaceAll('<','\\u003c')}</script></head><body class="localized-page">${navigation(code,c)}<main>${content(code,page,c)}</main>${footer(code,c)}<script type="module" src="/main.js"></script></body></html>`;
}

// These files are derived artifacts. Catalogs and this template are the editable source.
export function generateLocalizedPages() {
  const inputs = {};
  for (const {code} of languages.filter(language => language.code !== 'en')) {
    for (const page of pages) {
      const destination = resolve(root, '.' + pagePath(code, page), 'index.html');
      mkdirSync(resolve(destination, '..'), {recursive:true});
      writeFileSync(destination, renderPage(code, page));
      inputs[`locale-${code}-${page || 'home'}`] = destination;
    }
  }
  return inputs;
}

export function localizationPlugin() {
  let outDir;
  return {
    name:'meerkatta-localization',
    configResolved(config) { outDir = resolve(config.root, config.build.outDir); },
    transformIndexHtml: {
      order:'pre',
      handler(html, context) {
        const segments = context.path.replace(/index\.html$/, '').split('/').filter(Boolean);
        const code = languages.find(language => language.code === segments[0])?.code || 'en';
        const page = segments.slice(code === 'en' ? 0 : 1).join('/');
        if (!html.includes('class="nav-inner"')) return html;
        const translated = pages.includes(page);
        const c = catalogs[code];
        html = html.replace('<details class="mobile-menu">', `${languagePicker(code, translated ? page : '', c.language)}<details class="mobile-menu">`);
        const fallbackLinks = languages.map(language => link(pagePath(language.code, translated ? page : ''), language.name)).join(' · ');
        html = html.replace('</body>', `<noscript><nav class="locale-noscript" aria-label="${e(c.language)}">${fallbackLinks}</nav></noscript><script type="module" src="/i18n/client.js"></script></body>`);
        return {html, tags:translated ? alternates(page) : []};
      },
    },
    closeBundle() {
      const sitemapPath = resolve(outDir, 'sitemap.xml');
      const sitemap = readFileSync(resolve(root, 'public/sitemap.xml'), 'utf8');
      const extra = languages.filter(language => language.code !== 'en').flatMap(({code}) => pages.map(page => `  <url><loc>${origin + pagePath(code,page)}</loc></url>`));
      writeFileSync(sitemapPath, sitemap.replace('</urlset>', extra.join('\n') + '\n</urlset>'));
    },
  };
}
