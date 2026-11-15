import './world.js';

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
