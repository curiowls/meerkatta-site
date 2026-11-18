document.documentElement.classList.add('chrome-ready');
const nav = document.querySelector('.w-nav');
const toggle = nav.querySelector('.w-menu-toggle');
const links = nav.querySelector('.w-nav-links');
const logo = nav.querySelector('.w-logo');
const language = nav.querySelector('.language-picker');
let compact = false;
let resizeFrame = 0;
function closeMenu() {
  nav.classList.remove('menu-open');
  toggle.setAttribute('aria-expanded', 'false');
  links.inert = compact;
}
function resizeMenu() {
  resizeFrame = 0;
  // Measure the real links in their desktop layout, even while the menu is closed.
  // The temporary style is restored synchronously, before the browser paints.
  nav.classList.add('nav-measuring');
  const linkWidth = links.getBoundingClientRect().width;
  nav.classList.remove('nav-measuring');
  const style = getComputedStyle(nav);
  const available = nav.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
  const needed = logo.getBoundingClientRect().width + language.getBoundingClientRect().width
    + linkWidth + 2 * parseFloat(style.columnGap);
  const nextCompact = needed + (compact ? 24 : 12) > available;
  if (nextCompact !== compact) {
    const focusInLinks = links.contains(document.activeElement);
    const focusOnToggle = document.activeElement === toggle;
    compact = nextCompact;
    nav.classList.toggle('is-compact', compact);
    toggle.hidden = !compact;
    closeMenu();
    if (compact && focusInLinks) toggle.focus({preventScroll:true});
    if (!compact && focusOnToggle) links.querySelector('a')?.focus({preventScroll:true});
  }
}
function scheduleResize() {
  if (!resizeFrame) resizeFrame = requestAnimationFrame(resizeMenu);
}
toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  nav.classList.toggle('menu-open', open);
  toggle.setAttribute('aria-expanded', String(open));
  links.inert = !open;
});
links.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && nav.classList.contains('menu-open')) {
    closeMenu(); toggle.focus();
  }
});
nav.addEventListener('focusout', event => {
  if (event.relatedTarget && !nav.contains(event.relatedTarget)) closeMenu();
});
document.addEventListener('click', event => { if (!nav.contains(event.target)) closeMenu(); });
const observer = new ResizeObserver(scheduleResize);
[nav, logo, language].forEach(element => observer.observe(element));
window.addEventListener('resize', scheduleResize);
document.fonts.ready.then(scheduleResize);
document.fonts.addEventListener('loadingdone', scheduleResize);
resizeMenu();
