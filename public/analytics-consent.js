(() => {
  'use strict'

  const measurementId = 'G-TL3JS3LP0W'
  const storageKey = 'meerkatta.websiteAnalytics.v1'
  const denied = {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  }
  const translations = {
    en: ['Website analytics', 'May we use Google Analytics to understand page views, outbound clicks, and downloads? We do not use ad tracking. You can change this choice in our', 'privacy policy', 'Allow analytics', 'No thanks'],
    es: ['Analíticas del sitio', '¿Podemos usar Google Analytics para conocer las visitas, los clics a sitios externos y las descargas? No usamos seguimiento publicitario. Puedes cambiar tu elección en nuestra', 'política de privacidad', 'Permitir analíticas', 'No, gracias'],
    'zh-Hans': ['网站分析', '我们可以使用 Google Analytics 了解页面浏览、外部链接点击和下载情况吗？我们不使用广告追踪。你可以在', '隐私政策', '允许分析', '暂不允许'],
    'zh-Hant': ['網站分析', '我們可以使用 Google Analytics 了解頁面瀏覽、外部連結點擊和下載情況嗎？我們不使用廣告追蹤。你可以在', '隱私權政策', '允許分析', '暫不允許'],
    ja: ['ウェブサイトの分析', 'ページ閲覧、外部リンクのクリック、ダウンロードを把握するために Google Analytics を使用してもよいですか？広告の追跡は行いません。選択は', 'プライバシーポリシー', '分析を許可', '許可しない'],
    de: ['Website-Analyse', 'Dürfen wir Google Analytics nutzen, um Seitenaufrufe, Klicks auf externe Links und Downloads zu verstehen? Wir verwenden kein Werbetracking. Sie können Ihre Auswahl in unserer', 'Datenschutzerklärung', 'Analyse erlauben', 'Nein, danke'],
    fr: ['Analyse du site', 'Pouvons-nous utiliser Google Analytics pour comprendre les pages vues, les clics vers des sites externes et les téléchargements ? Nous ne faisons pas de suivi publicitaire. Vous pouvez modifier ce choix dans notre', 'politique de confidentialité', 'Autoriser l’analyse', 'Non merci'],
    ko: ['웹사이트 분석', '페이지 조회, 외부 링크 클릭, 다운로드를 파악하기 위해 Google Analytics를 사용해도 될까요? 광고 추적은 하지 않습니다. 선택은', '개인정보 처리방침', '분석 허용', '허용 안 함'],
    'pt-BR': ['Análise do site', 'Podemos usar o Google Analytics para entender visualizações de páginas, cliques em links externos e downloads? Não usamos rastreamento de anúncios. Você pode mudar sua escolha na nossa', 'política de privacidade', 'Permitir análise', 'Agora não'],
  }

  let storedChoice = null
  try { storedChoice = window.localStorage.getItem(storageKey) } catch { /* Show a choice each visit. */ }

  // Google must see the default before any measurement command. No Google script
  // or request is made while the visitor has not opted in.
  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() { window.dataLayer.push(arguments) }
  window.gtag('consent', 'default', denied)

  let tagStarted = false
  function safePageLocation() {
    // Never send arbitrary query parameters (notably checkout email prefills).
    // Keep only campaign parameters with values that cannot be email addresses.
    const safe = new URL(window.location.pathname, window.location.origin)
    const original = new URLSearchParams(window.location.search)
    for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'utm_id']) {
      const value = original.get(key)
      if (value && /^[A-Za-z0-9._-]{1,80}$/.test(value)) safe.searchParams.set(key, value)
    }
    return safe.href
  }

  function safePageReferrer() {
    try {
      const referrer = new URL(document.referrer)
      return referrer.origin + referrer.pathname
    } catch {
      return ''
    }
  }

  function startAnalytics() {
    if (tagStarted) return
    if (!/^(?:www\.)?meerkatta\.com$/.test(window.location.hostname)) return
    tagStarted = true
    window.gtag('consent', 'update', { ...denied, analytics_storage: 'granted' })
    window.gtag('js', new Date())
    // Apply sanitized URLs to automatic events as well as the initial page view.
    window.gtag('set', 'page_location', safePageLocation())
    window.gtag('set', 'page_referrer', safePageReferrer())
    window.gtag('config', measurementId, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      page_location: safePageLocation(),
    })
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`
    document.head.appendChild(script)
  }

  if (storedChoice === 'allow') startAnalytics()

  function removeAnalyticsCookies() {
    document.cookie.split(';').forEach(part => {
      const name = part.trim().split('=')[0]
      if (!/^_ga(?:_|$)/.test(name)) return
      for (const domain of ['', '; domain=' + location.hostname, '; domain=.' + location.hostname.replace(/^www\./, '')]) {
        document.cookie = `${name}=; Max-Age=0; path=/${domain}; SameSite=Lax`
      }
    })
  }

  function renderChoice() {
    const [title, message, policy, allow, refuse] = translations[document.documentElement.lang] || translations.en
    const panel = document.createElement('section')
    panel.className = 'analytics-choice'
    panel.setAttribute('role', 'dialog')
    panel.setAttribute('aria-label', title)

    const heading = document.createElement('h2')
    heading.textContent = title
    const paragraph = document.createElement('p')
    paragraph.append(document.createTextNode(message + ' '))
    const link = document.createElement('a')
    link.href = '/privacy/#website-analytics-preferences'
    link.textContent = policy
    paragraph.append(link, document.createTextNode('.'))
    const actions = document.createElement('div')
    actions.className = 'analytics-choice-actions'
    const allowButton = document.createElement('button')
    allowButton.type = 'button'
    allowButton.dataset.choice = 'allow'
    allowButton.textContent = allow
    const refuseButton = document.createElement('button')
    refuseButton.type = 'button'
    refuseButton.dataset.choice = 'deny'
    refuseButton.textContent = refuse
    actions.append(allowButton, refuseButton)
    panel.append(heading, paragraph, actions)
    document.body.appendChild(panel)

    panel.addEventListener('click', event => {
      const choice = event.target.closest('button[data-choice]')?.dataset.choice
      if (!choice) return
      try { window.localStorage.setItem(storageKey, choice) } catch { /* Choice is session-only. */ }
      panel.hidden = true
      if (choice === 'allow') {
        startAnalytics()
      } else if (tagStarted) {
        window.gtag('consent', 'update', denied)
        removeAnalyticsCookies()
        // The already-loaded tag is removed by reloading with denied consent.
        window.location.reload()
      }
    })
    return panel
  }

  function ready() {
    let panel
    if (storedChoice !== 'allow' && storedChoice !== 'deny') panel = renderChoice()
    const manage = document.getElementById('website-analytics-preferences')
    manage?.addEventListener('click', event => {
      event.preventDefault()
      panel ||= renderChoice()
      panel.hidden = false
      panel.querySelector('button')?.focus()
    })
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready, { once: true })
  else ready()
})()
