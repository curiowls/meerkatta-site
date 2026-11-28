import './style.css';

document.querySelectorAll('.mobile-menu').forEach(menu => {
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => { menu.open = false; });
  });
});

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
    // Keep the rail stable until keyboard focus leaves it.
    if (sectionRail.contains(document.activeElement)) return;
    if (!target) {
      activeSectionId = '';
      sectionRail.inert = true;
      sectionRail.classList.remove('is-visible');
      sectionAnchors.forEach(anchor => anchor.removeAttribute('aria-current'));
      return;
    }

    if (!forcePosition && target.id === activeSectionId) return;

    activeSectionId = target.id;
    positionRail(target);
    sectionRail.inert = false;
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
  sectionRail.addEventListener('focusout', () => {
    window.requestAnimationFrame(() => updateSectionRail(true));
  });
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
      price: '$8.33 <span>/mo</span>',
      note: 'Billed yearly at $99.99. No provider setup, no API keys.',
      cta: 'Subscribe yearly',
      href: checkout?.dataset.yearlyHref || '/pay/?plan=yearly',
    },
    monthly: {
      price: '$9.99 <span>/mo</span>',
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

// Reusable floating in-page navigation ([data-page-nav]).
document.querySelectorAll('[data-page-nav]').forEach(pageNav => {
  const links = Array.from(pageNav.querySelectorAll('a[href^="#"]'));
  const items = links
    .map(link => {
      const id = link.getAttribute('href').slice(1);
      const target = id ? document.getElementById(id) : null;
      return target ? { id, link, target } : null;
    })
    .filter(Boolean);

  if (!items.length) return;

  const list = pageNav.querySelector('.page-nav-list');
  const root = document.documentElement;
  if (root?.classList) root.classList.add('has-page-nav');

  let activeId = '';
  let navTicking = false;
  let lockedId = '';
  let lockTimer = 0;

  const getSiteNavHeight = () => {
    const siteNav = document.querySelector('.w-nav') || document.querySelector('.site-nav');
    if (!siteNav || typeof siteNav.getBoundingClientRect !== 'function') return 60;
    const height = Math.round(siteNav.getBoundingClientRect().height);
    return height > 0 ? height : 60;
  };

  const syncOffsets = () => {
    const topOffset = getSiteNavHeight() + 6;
    const barHeight = typeof pageNav.getBoundingClientRect === 'function'
      ? Math.round(pageNav.getBoundingClientRect().height)
      : 48;
    if (pageNav.style?.setProperty) {
      pageNav.style.setProperty('--page-nav-top', `${topOffset}px`);
    }
    if (root?.style?.setProperty) {
      root.style.setProperty('--page-nav-scroll-padding', `${topOffset + barHeight + 12}px`);
    }
    return topOffset;
  };

  let topOffset = syncOffsets();

  // Sentinel above the sticky bar toggles the lighter floating capsule without oscillation.
  let sentinel = pageNav.previousElementSibling;
  if ((!sentinel || !sentinel.matches?.('[data-page-nav-sentinel]'))
    && typeof document.createElement === 'function'
    && pageNav.parentNode) {
    sentinel = document.createElement('div');
    sentinel.className = 'page-nav-sentinel';
    sentinel.setAttribute('data-page-nav-sentinel', '');
    sentinel.setAttribute('aria-hidden', 'true');
    pageNav.parentNode.insertBefore(sentinel, pageNav);
  }

  const updateFloatingState = () => {
    if (!sentinel || typeof sentinel.getBoundingClientRect !== 'function') return;
    const isFloating = sentinel.getBoundingClientRect().bottom <= topOffset + 1;
    pageNav.classList.toggle('is-floating', isFloating);
  };

  const centerActiveLink = activeLink => {
    if (!list || !activeLink || typeof list.scrollTo !== 'function') return;
    if (list.scrollWidth <= list.clientWidth + 1) return;
    const targetLeft = activeLink.offsetLeft - (list.clientWidth - activeLink.offsetWidth) / 2;
    const reducedMotion = typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    list.scrollTo({
      left: Math.max(0, targetLeft),
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
  };

  const applyActive = nextId => {
    if (nextId === activeId) return;
    activeId = nextId;
    let activeLink = null;
    items.forEach(({ id, link }) => {
      if (id === activeId) {
        link.setAttribute('aria-current', 'location');
        activeLink = link;
      } else {
        link.removeAttribute('aria-current');
      }
    });
    if (activeLink) centerActiveLink(activeLink);
  };

  const resolveActiveId = () => {
    const scrollY = window.scrollY || 0;
    const innerHeight = window.innerHeight || 0;
    const docHeight = document.documentElement?.scrollHeight || 0;

    // Near the bottom of the page, highlight the final section even if short.
    if (docHeight > innerHeight && scrollY + innerHeight >= docHeight - 24) {
      return items[items.length - 1].id;
    }

    const barHeight = typeof pageNav.getBoundingClientRect === 'function'
      ? Math.round(pageNav.getBoundingClientRect().height)
      : 48;
    const readingLine = Math.max(topOffset + barHeight + 48, innerHeight * 0.32);

    let current = '';
    for (const item of items) {
      if (item.target.getBoundingClientRect().top <= readingLine) {
        current = item.id;
      } else {
        break;
      }
    }
    return current;
  };

  const releaseClickLock = () => {
    if (!lockedId) return;
    lockedId = '';
    if (lockTimer) {
      clearTimeout(lockTimer);
      lockTimer = 0;
    }
  };

  const updatePageNav = (recomputeOffsets = false) => {
    if (recomputeOffsets) topOffset = syncOffsets();
    updateFloatingState();
    if (lockedId) {
      applyActive(lockedId);
      return;
    }
    applyActive(resolveActiveId());
  };

  const requestPageNavUpdate = () => {
    if (navTicking) return;
    navTicking = true;
    window.requestAnimationFrame(() => {
      updatePageNav(false);
      navTicking = false;
    });
  };

  items.forEach(({ id, link }) => {
    link.addEventListener('click', () => {
      lockedId = id;
      applyActive(id);
      if (lockTimer) clearTimeout(lockTimer);
      lockTimer = setTimeout(() => {
        lockedId = '';
        lockTimer = 0;
        updatePageNav(false);
      }, 900);
    });
  });

  updatePageNav(true);
  window.addEventListener('scroll', requestPageNavUpdate, { passive: true });
  window.addEventListener('wheel', releaseClickLock, { passive: true });
  window.addEventListener('touchstart', releaseClickLock, { passive: true });
  window.addEventListener('resize', () => updatePageNav(true));
});
