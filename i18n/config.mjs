export const languages = [
  {code: 'en', name: 'English'},
  {code: 'es', name: 'Español'},
  {code: 'zh-Hans', name: '简体中文'},
  {code: 'zh-Hant', name: '繁體中文'},
  {code: 'ja', name: '日本語'},
  {code: 'de', name: 'Deutsch'},
  {code: 'fr', name: 'Français'},
  {code: 'ko', name: '한국어'},
  {code: 'pt-BR', name: 'Português (Brasil)'},
];
export const pages = ['', 'about', 'pricing', 'use-cases', 'welcome', 'help'];
export const origin = 'https://meerkatta.com';
export const appStore = 'https://apps.apple.com/app/meerkatta/id6766122029';
export const openGraphLocales = {en:'en_US', es:'es_ES', 'zh-Hans':'zh_CN', 'zh-Hant':'zh_TW', ja:'ja_JP', de:'de_DE', fr:'fr_FR', ko:'ko_KR', 'pt-BR':'pt_BR'};
export const macDownload = 'https://github.com/curiowls/meerkattasparkle/releases/latest/download/MeerKatta-latest.dmg';
export const pagePath = (code, page = '') => `${code === 'en' ? '/' : `/${code}/`}${page ? `${page}/` : ''}`;
export const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[char]));

export function languagePicker(code, page = '', label = 'Language') {
  return `<label class="language-picker"><span class="sr-only">${escapeHtml(label)}</span><select data-language-switch aria-label="${escapeHtml(label)}">${languages.map(language => `<option lang="${language.code}" value="${pagePath(language.code, page)}"${code === language.code ? ' selected' : ''}>${language.name}</option>`).join('')}</select></label>`;
}

export function alternates(page) {
  return [...languages.map(language => ({tag:'link', attrs:{rel:'alternate', hreflang:language.code, href:origin + pagePath(language.code, page)}})),
    {tag:'link', attrs:{rel:'alternate', hreflang:'x-default', href:origin + pagePath('en', page)}}];
}
