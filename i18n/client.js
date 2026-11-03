import './styles.css';
import {appReturnLink} from './return-link.mjs';

document.querySelectorAll('[data-language-switch]').forEach(select => {
  select.addEventListener('change', () => {
    const destination = new URL(select.value, location.origin);
    destination.search = location.search;
    destination.hash = location.hash;
    location.assign(destination.href);
  });
});

const confirmation = document.querySelector('[data-payment-confirmation]');
const params = new URLSearchParams(location.search);
if (confirmation && params.get('checkout') === 'success') {
  confirmation.hidden = false;
  // Keep one H1 in either entry state, including ordinary visits to the tips page.
  const intro = document.querySelector('[data-tips-intro] h1');
  if (intro) {
    const heading = document.createElement('h2');
    heading.textContent = intro.textContent;
    intro.replaceWith(heading);
  }
  const successTitle = confirmation.querySelector('h2');
  const title = document.createElement('h1');
  title.textContent = successTitle.textContent;
  successTitle.replaceWith(title);
  confirmation.querySelector('a').href = appReturnLink(params);
}
