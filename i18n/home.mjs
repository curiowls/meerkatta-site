import {readFileSync} from 'node:fs';
import {languages, pagePath, origin, appStore, macDownload, languagePicker, alternates, openGraphLocales, escapeHtml as e} from './config.mjs';

const read = file => readFileSync(new URL(file, import.meta.url), 'utf8');
const english = JSON.parse(read('./home/en.json'));
const sharedKeys = ['t0','t138','t140'];
const fieldNotes = JSON.parse(read('./home/journal.json'));
const voiceCopy = JSON.parse(read('./home/voice.json'));
const injectionCopy = JSON.parse(read('./home/injection.json'));
const demoGuidance = {
  en:['Use your configured shortcut.','Listening…','Polishing…','Inserted','Switch to MeerKatta keyboard.','Tap the microphone and speak.','Stop. The cleaned-up text appears automatically.'],
  es:['Usa el atajo que hayas configurado.','Escuchando…','Puliendo…','Insertado','Cambia al teclado MeerKatta.','Toca el micrófono y habla.','Detén la grabación. El texto depurado aparece automáticamente.'],
  'zh-Hans':['使用你设置的快捷键。','正在聆听…','正在整理…','已填入','切换到 MeerKatta 键盘。','点麦克风，说出想法。','停止录音，整理后的文字会自动填入。'],
  'zh-Hant':['使用你設定的快捷鍵。','正在聆聽…','正在整理…','已填入','切換到 MeerKatta 鍵盤。','點麥克風，說出想法。','停止錄音，整理後的文字會自動填入。'],
  ja:['設定したショートカットを使います。','聞き取り中…','文章を整理中…','入力しました','MeerKattaキーボードに切り替える。','マイクをタップして話す。','録音を止めると、整えた文章が自動で入ります。'],
  de:['Nutze deinen eingerichteten Kurzbefehl.','Hört zu…','Wird geglättet…','Eingefügt','Zur MeerKatta-Tastatur wechseln.','Mikrofon antippen und sprechen.','Aufnahme stoppen. Der geglättete Text erscheint automatisch.'],
  fr:['Utilisez votre raccourci configuré.','À l’écoute…','Clarification…','Texte inséré','Passez au clavier MeerKatta.','Touchez le micro et parlez.','Arrêtez l’enregistrement. Le texte clarifié apparaît automatiquement.'],
  ko:['설정한 단축키를 사용하세요.','듣는 중…','다듬는 중…','입력 완료','MeerKatta 키보드로 전환하세요.','마이크를 누르고 말하세요.','녹음을 멈추면 다듬은 글이 자동으로 입력돼요.'],
  'pt-BR':['Use o atalho que você configurou.','Ouvindo…','Organizando…','Inserido','Mude para o teclado MeerKatta.','Toque no microfone e fale.','Pare a gravação. O texto organizado aparece automaticamente.'],
};
const skipLabels = {en:'Skip to content', es:'Saltar al contenido', 'zh-Hans':'跳至主要内容', 'zh-Hant':'跳至主要內容', ja:'本文へ移動', de:'Zum Inhalt springen', fr:'Aller au contenu', ko:'본문으로 건너뛰기', 'pt-BR':'Pular para o conteúdo'};

export function homepageCopy(code, c) {
  const local = code === 'en' ? {...english, p0:'Zero cloud data retention', p1:'Never trained on your data'} : JSON.parse(read(`./home/${code}.json`));
  const marked = text => code === 'en' ? text : `${text} (${c.common.english})`;
  const copy = {
    ...Object.fromEntries(sharedKeys.map(key => [key, english[key]])),
    t1:e(c.nav[0]), t2:e(marked(c.common.journal)), t3:e(c.nav[2]), t4:e(c.nav[5]),
    t11:e(c.common.tagline), t14:e(c.common.mac), t15:e(c.common.ios),
    t135:e(c.common.mac), t136:e(c.common.ios), t139:e(c.common.tagline),
    t142:e(c.nav[3]), t143:e(c.nav[0]), t144:e(c.nav[2]), t145:e(c.common.watch),
    t147:e(marked(c.common.journal)), t148:e(c.nav[1]), t149:e(c.nav[4]),
    t151:e(marked(c.common.privacy)), t152:e(marked(c.common.terms)), t153:e(marked(c.common.refund)),
    ...local,
    ...voiceCopy[code],
    ...injectionCopy[code],
    ...Object.fromEntries(['macShortcutNote','macListening','macPolishing','macDone','mobileStep1','mobileStep2','mobileStep3'].map((key,i)=>[key,demoGuidance[code][i]])),
    keyboardMic: english.t42.slice(0, english.t42.indexOf('</svg>') + 6),
    t30:({en:'On iPhone + Apple Watch',es:'En iPhone + Apple Watch','zh-Hans':'在 iPhone + Apple Watch 上','zh-Hant':'在 iPhone + Apple Watch 上',ja:'iPhone + Apple Watchで',de:'Auf iPhone + Apple Watch',fr:'Sur iPhone + Apple Watch',ko:'iPhone + Apple Watch에서','pt-BR':'No iPhone + Apple Watch'})[code],
  };
  Object.assign(copy, {t145:e(c.common.watch), a0:c.menu, a1:'MeerKatta', a9:'MeerKatta', a10:copy.t141, a11:copy.t146, a12:copy.t150});
  for (const key of ['t80', 't84']) copy[key] = copy[key].replace('Ohlalarm', '<a class="quiet-product-link" href="https://ohlalarm.com/?utm_source=meerkatta&amp;utm_medium=referral&amp;utm_campaign=voice_example&amp;utm_content=homepage">Ohlalarm</a>');
  // Artwork and control geometry belong to the template, not to translators.
  if (code !== 'en') {
    copy.t38 = english.t38.slice(0, english.t38.indexOf('>') + 1) + copy.t38;
    copy.t42 = english.t42.slice(0, english.t42.indexOf('</svg>') + 6) + copy.t42;
    copy.t65 += '<i class="caret" aria-hidden="true"></i>';
  }
  return copy;
}

export function renderHomepage(code, c) {
  const copy = homepageCopy(code, c);
  const path = page => pagePath(code, page);
  let body = read('../world/home.html').replace(/\{\{(\w+)\}\}/g, (_, key) => {
    if (typeof copy[key] !== 'string' || !copy[key].trim()) throw new Error(`Missing homepage translation: ${code}.${key}`);
    return key.startsWith('a') ? e(copy[key]) : copy[key];
  });
  body = body.replace('<main>', '<main id="main-content" tabindex="-1">');
  body = `<a class="w-skip skip-link" href="#main-content">${e(skipLabels[code])}</a>${body}`;
  body = body.replace('<div class="w-nav-links">', `${languagePicker(code, '', c.language)}<button class="w-menu-toggle" type="button" aria-label="${e(c.menu)}" aria-controls="world-navigation" aria-expanded="false" hidden><span aria-hidden="true"></span></button><div class="w-nav-links" id="world-navigation">`);
  body = body.replace('<a href="#pricing">', `<a href="${path('welcome')}">${e(c.nav[3])}</a><a href="#pricing">`);
  for (const page of ['', 'use-cases', 'about', 'pricing', 'welcome', 'help']) {
    body = body.replaceAll(`href="${pagePath('en', page)}"`, `href="${path(page)}"`);
  }
  const selectedLanguage = languages.find(l => l.code === code).name;
  body = body.replace('<label class="language-picker">', `<label class="language-picker"><span class="language-display" aria-hidden="true">${e(selectedLanguage)}</span>`);
  const note = fieldNotes[code];
  const englishLabel = code === 'en' ? '' : ` (${c.common.english})`;
  const cards = ['catch-an-unfinished-thought', 'return-to-what-you-capture'].map((slug, i) => `<article><p class="eyebrow">${e(note.cards[i][0])}</p><h3>${e(note.cards[i][1])}</h3><p>${e(note.cards[i][2])}</p><a href="/journal/${slug}/" hreflang="en">${e(note.read + englishLabel)} <span aria-hidden="true">→</span></a></article>`).join('');
  body = body.replace('<!-- field-notes -->', `<section class="panel w-journal" aria-labelledby="journal-title"><div class="w-head"><p class="eyebrow">${e(note.eyebrow)}</p><h2 id="journal-title">${e(note.title)}</h2><p>${e(note.lead)}</p></div><div class="w-journal-grid">${cards}</div><p class="w-journal-links"><a href="/journal/">${e(note.all + englishLabel)} →</a><a href="${path('use-cases')}">${e(note.workflows)} →</a></p></section>`);
  const languageLinks = languages.map(l => `<a lang="${l.code}" href="${pagePath(l.code)}">${e(l.name)}</a>`).join(' · ');
  body += `<noscript><nav class="w-language-fallback" aria-label="${e(c.language)}">${languageLinks}</nav></noscript><script type="module" src="/world/home.js"></script>`;
  const url = origin + path('');
  const title = code === 'en' ? 'MeerKatta — AI Dictation & Thought Capture for Mac, iPhone, iPad, and Apple Watch' : `MeerKatta | ${c.home.title}`;
  const description = code === 'en' ? 'MeerKatta is an AI dictation and thought-capture app for Mac, iPhone, iPad, and Apple Watch. Speak into your work, or save an idea before it slips away.' : c.home.lead;
  const schema = {'@context':'https://schema.org', '@graph':[
    {'@type':'WebSite','@id':origin+'/#website',url:origin+'/',name:'MeerKatta',inLanguage:languages.map(l=>l.code),publisher:{'@id':origin+'/#organization'},about:{'@id':origin+'/#software'}},
    {'@type':'Organization','@id':origin+'/#organization',name:'MeerKatta',url:origin+'/',email:'hello@meerkatta.com',logo:origin+'/assets/meerkatta-app-icon.png',parentOrganization:{'@id':'https://lugugul.com/#organization'}},
    {'@type':'Organization','@id':'https://lugugul.com/#organization',name:'Lugugul Design',url:'https://lugugul.com/'},
    {'@type':'WebPage','@id':url+'#webpage',url,name:title,description,inLanguage:code,isPartOf:{'@id':origin+'/#website'},about:{'@id':origin+'/#software'},primaryImageOfPage:{'@type':'ImageObject',contentUrl:origin+'/assets/meerkatta-curious-search.jpg',width:1200,height:1200}},
    {'@type':'SoftwareApplication','@id':origin+'/#software',name:'MeerKatta',applicationCategory:'ProductivityApplication',applicationSubCategory:'AI dictation and thought capture',operatingSystem:'macOS, iOS, iPadOS, watchOS',url:origin+'/',sameAs:appStore,downloadUrl:macDownload,image:origin+'/assets/meerkatta-curious-search.jpg',description,publisher:{'@id':'https://lugugul.com/#organization'},offers:[
      {'@type':'Offer',name:copy.t101,price:'33.00',priceCurrency:'USD',availability:'https://schema.org/InStock',url:origin+path('pricing')},
      {'@type':'Offer',name:copy.t111,price:'99.99',priceCurrency:'USD',availability:'https://schema.org/InStock',url:origin+path('pricing'),description:copy.t114},
      {'@type':'Offer',name:copy.t111,price:'9.99',priceCurrency:'USD',url:origin+path('pricing'),description:copy.t118},
    ]},
    {'@type':'FAQPage',mainEntity:[125,127,129,131].map(n=>({'@type':'Question',name:copy[`t${n}`],acceptedAnswer:{'@type':'Answer',text:copy[`t${n+1}`]}}))},
  ]};
  const alternateTags = alternates('').map(({attrs})=>`<link rel="alternate" hreflang="${attrs.hreflang}" href="${attrs.href}">`).join('');
  return `<!doctype html><html lang="${code}" data-world-home><head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${e(title)}</title><meta name="description" content="${e(description)}">
  <meta name="robots" content="max-image-preview:large"><meta name="theme-color" content="#f4ede2">
  <link rel="canonical" href="${url}">${alternateTags}
  <meta property="og:type" content="website"><meta property="og:site_name" content="MeerKatta">
  <meta property="og:url" content="${url}"><meta property="og:title" content="${e(title)}">
  <meta property="og:description" content="${e(description)}"><meta property="og:locale" content="${openGraphLocales[code]}">
  <meta property="og:image" content="${origin}/assets/meerkatta-curious-search.jpg"><meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="1200"><meta property="og:image:height" content="1200"><meta property="og:image:alt" content="MeerKatta">
  <meta name="twitter:card" content="summary_large_image"><meta name="twitter:site" content="@qianhuang">
  <meta name="twitter:title" content="${e(title)}"><meta name="twitter:description" content="${e(description)}">
  <meta name="twitter:image" content="${origin}/assets/meerkatta-curious-search.jpg"><meta name="twitter:image:alt" content="MeerKatta">
  <link rel="image_src" href="${origin}/assets/meerkatta-curious-search.jpg">
  <link rel="icon" href="/favicon.ico" sizes="128x128">
  <link rel="icon" type="image/png" href="/favicon-lbg.png" media="(prefers-color-scheme: light)">
  <link rel="icon" type="image/png" href="/favicon-dbg.png" media="(prefers-color-scheme: dark)">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="256x256">
  <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/world/world.css"><link rel="stylesheet" href="/world/home.css"><link rel="stylesheet" href="/world/chrome.css">
  <script type="application/ld+json">${JSON.stringify(schema).replaceAll('<','\\u003c')}</script>
  </head><body>${body}</body></html>`;
}
