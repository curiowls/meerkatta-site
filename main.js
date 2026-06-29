import './style.css';

document.querySelectorAll('.faq-question').forEach(question => {
  question.addEventListener('click', () => {
    const answer = question.nextElementSibling;
    const isExpanded = question.getAttribute('aria-expanded') === 'true';

    question.setAttribute('aria-expanded', String(!isExpanded));
    answer.hidden = isExpanded;
  });
});

const sectionRail = document.querySelector('[data-section-rail]');
const sectionAnchors = sectionRail
  ? Array.from(sectionRail.querySelectorAll('[data-section-anchor]'))
  : [];
const sectionTargets = sectionAnchors
  .map(anchor => document.getElementById(anchor.dataset.sectionAnchor))
  .filter(Boolean);

if (sectionRail && sectionAnchors.length && sectionTargets.length) {
  const main = document.querySelector('main');
  let activeSectionId = '';
  let railTicking = false;

  const getActiveSection = () => {
    const checkpoint = window.innerHeight * 0.36;

    return sectionTargets.find(target => {
      const rect = target.getBoundingClientRect();
      return rect.top <= checkpoint && rect.bottom > checkpoint;
    });
  };

  const positionRail = target => {
    const slot = target.querySelector('[data-section-anchor-slot]');
    if (!slot || !main) return;

    const mainRect = main.getBoundingClientRect();
    const slotRect = slot.getBoundingClientRect();
    const x = Math.round(slotRect.left - mainRect.left);
    const y = Math.round(slotRect.top - mainRect.top);

    sectionRail.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };

  const setActiveSection = (target, forcePosition = false) => {
    if (!target) {
      activeSectionId = '';
      sectionRail.classList.remove('is-visible');
      sectionAnchors.forEach(anchor => anchor.removeAttribute('aria-current'));
      return;
    }

    if (!forcePosition && target.id === activeSectionId) return;

    activeSectionId = target.id;
    positionRail(target);
    sectionRail.classList.add('is-visible');

    sectionAnchors.forEach(anchor => {
      if (anchor.dataset.sectionAnchor === target.id) {
        anchor.setAttribute('aria-current', 'true');
      } else {
        anchor.removeAttribute('aria-current');
      }
    });
  };

  const updateSectionRail = (forcePosition = false) => {
    setActiveSection(getActiveSection(), forcePosition);
  };

  const requestSectionRailUpdate = () => {
    if (railTicking) return;

    railTicking = true;
    window.requestAnimationFrame(() => {
      updateSectionRail();
      railTicking = false;
    });
  };

  updateSectionRail(true);
  window.addEventListener('scroll', requestSectionRailUpdate, { passive: true });
  window.addEventListener('resize', () => updateSectionRail(true));
}

document.querySelectorAll('[data-managed-plan]').forEach(plan => {
  const price = plan.querySelector('[data-managed-price]');
  const note = plan.querySelector('[data-managed-note]');
  const checkout = plan.querySelector('[data-managed-checkout]');
  const buttons = plan.querySelectorAll('[data-billing-option]');

  const billing = {
    yearly: {
      price: '$7.50 <span>/mo</span>',
      note: 'Billed yearly at $90. No provider setup, no API keys.',
      cta: 'Subscribe yearly',
      href: checkout?.dataset.yearlyHref || '/pay/?plan=yearly',
    },
    monthly: {
      price: '$9 <span>/mo</span>',
      note: 'Billed monthly. No provider setup, no API keys.',
      cta: 'Subscribe monthly',
      href: checkout?.dataset.monthlyHref || '/pay/?plan=monthly',
    },
  };

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const option = button.dataset.billingOption;
      const next = billing[option];
      if (!next) return;

      buttons.forEach(item => {
        const isActive = item === button;
        item.classList.toggle('active', isActive);
        item.setAttribute('aria-pressed', String(isActive));
      });

      if (price) price.innerHTML = next.price;
      if (note) note.textContent = next.note;
      if (checkout) {
        checkout.textContent = next.cta;
        if (checkout.tagName === 'A') {
          checkout.href = next.href;
        }
      }
    });
  });
});
