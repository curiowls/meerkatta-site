import './world.js';

const injectionTabs = [...document.querySelectorAll('[data-injection-tabs] [role="tab"]')];
let injectionManual = false;
function selectInjection(tab) {
  if (tab.getAttribute('aria-selected') === 'true' && document.getElementById('inject-mac').hidden !== document.getElementById('inject-ios').hidden) return;
  injectionTabs.forEach(item => {
    const selected = item === tab;
    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;
    document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
    document.getElementById(item.getAttribute('aria-controls')).inert = !selected;
  });
}
injectionTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => { injectionManual = true; selectInjection(tab); });
  tab.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    injectionManual = true;
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? 1 : (index + 1) % 2;
    injectionTabs[next].focus();
    selectInjection(injectionTabs[next]);
  });
});
selectInjection(injectionTabs[matchMedia('(max-width: 760px)').matches ? 1 : 0]);
document.getElementById('work').addEventListener('world:progress', event => {
  if (injectionManual || document.querySelector('#work .stop-visual').contains(document.activeElement)) return;
  if (event.detail > 0.62) selectInjection(injectionTabs[1]);
  else if (event.detail < 0.50) selectInjection(injectionTabs[0]);
});

// One short hotkey demonstration per visit; hidden tabs never keep animating.
const macDemo = document.querySelector('.mac-injection-demo');
const macPanel = document.getElementById('inject-mac');
const macStatus = macDemo.querySelector('[data-mac-status]');
const demoReducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let demoVisible = false;
let demoTimers = [];
function macPhase(phase) {
  macDemo.dataset.macPhase = phase;
  macStatus.textContent = macStatus.dataset[phase];
}
function updateMacDemo() {
  demoTimers.forEach(clearTimeout);
  demoTimers = [];
  macPhase('done');
  if (!demoVisible || macPanel.hidden || demoReducedMotion.matches || document.hidden) return;
  macPhase('listening');
  demoTimers = [setTimeout(() => macPhase('polishing'), 3200), setTimeout(() => macPhase('done'), 4500)];
}
new IntersectionObserver(entries => {
  const visible = entries[0].isIntersecting;
  if (visible === demoVisible) return;
  demoVisible = visible;
  updateMacDemo();
}, {threshold: 0.35}).observe(macDemo);
new MutationObserver(updateMacDemo).observe(macPanel, {attributes: true, attributeFilter: ['hidden']});
demoReducedMotion.addEventListener('change', updateMacDemo);
document.addEventListener('visibilitychange', updateMacDemo);

document.querySelector('[data-language-switch]').addEventListener('change', event => {
  const destination = new URL(event.target.value, location.origin);
  destination.search = location.search;
  destination.hash = location.hash;
  location.assign(destination);
});

const nav = document.querySelector('.w-nav');
const toggle = nav.querySelector('.w-menu-toggle');
const links = nav.querySelector('.w-nav-links');
const compact = matchMedia('(max-width: 1280px)');
function closeMenu() {
  nav.classList.remove('menu-open');
  toggle.setAttribute('aria-expanded', 'false');
  links.inert = compact.matches;
}
function resizeMenu() {
  toggle.hidden = !compact.matches;
  closeMenu();
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
compact.addEventListener('change', resizeMenu);
resizeMenu();

// Keep older homepage bookmarks useful after the new section names ship.
const legacyAnchors = {capture:'lookout', 'personal-voice':'voice', 'get-started':'ready'};
function resolveLegacyAnchor() {
  const id = legacyAnchors[location.hash.slice(1)];
  if (!id) return;
  history.replaceState(null, '', `${location.pathname}${location.search}#${id}`);
  document.getElementById(id)?.scrollIntoView();
}
addEventListener('hashchange', resolveLegacyAnchor);
resolveLegacyAnchor();

// Scrolling must not collapse a section containing keyboard focus.
document.querySelectorAll('[data-expand]').forEach(section => {
  section.addEventListener('focusin', () => { section.dataset.held = 'true'; });
  section.addEventListener('focusout', event => {
    if (!section.contains(event.relatedTarget)) delete section.dataset.held;
  });
});
