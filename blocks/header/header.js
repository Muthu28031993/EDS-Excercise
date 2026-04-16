import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/* ===========================
   Media Query
   =========================== */
const isDesktop = window.matchMedia('(min-width: 900px)');

/* ===========================
   Utility Functions
   =========================== */
function toggleAllNavSections(sections, expanded = false) {
  if (!sections) return;
  sections
    .querySelectorAll('.default-content-wrapper > ul > li')
    .forEach((section) =>
      section.setAttribute('aria-expanded', expanded)
    );
}

function isTrueExit(element, event) {
  return !element.contains(event.relatedTarget);
}

/* ===========================
   Keyboard / Focus Handlers
   =========================== */
function closeOnEscape(e) {
  if (e.code !== 'Escape') return;

  const nav = document.getElementById('nav');
  const navSections = nav.querySelector('.nav-sections');
  if (!navSections) return;

  const expanded = navSections.querySelector('[aria-expanded="true"]');

  if (expanded && isDesktop.matches) {
    toggleAllNavSections(navSections);
    expanded.focus();
  } else if (!isDesktop.matches) {
    toggleMenu(nav, navSections);
    nav.querySelector('button').focus();
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (nav.contains(e.relatedTarget)) return;

  const navSections = nav.querySelector('.nav-sections');
  if (!navSections) return;

  if (isDesktop.matches) {
    toggleAllNavSections(navSections);
  } else {
    toggleMenu(nav, navSections, false);
  }
}

function openOnKeydown(e) {
  const el = document.activeElement;
  const isDrop = el.classList.contains('nav-drop');

  if (isDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const expanded = el.getAttribute('aria-expanded') === 'true';
    toggleAllNavSections(el.closest('.nav-sections'));
    el.setAttribute('aria-expanded', !expanded);
  }
}

function enableKeyboardFocus(el) {
  el.addEventListener('keydown', openOnKeydown);
}

/* ===========================
   Menu Toggle
   =========================== */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded =
    forceExpanded !== null
      ? !forceExpanded
      : nav.getAttribute('aria-expanded') === 'true';

  const button = nav.querySelector('.nav-hamburger button');

  document.body.style.overflowY =
    expanded || isDesktop.matches ? '' : 'hidden';

  nav.setAttribute('aria-expanded', !expanded);
  toggleAllNavSections(navSections, expanded || isDesktop.matches);
  button.setAttribute(
    'aria-label',
    expanded ? 'Open navigation' : 'Close navigation'
  );

  const drops = navSections?.querySelectorAll('.nav-drop') || [];

  if (isDesktop.matches) {
    drops.forEach((drop) => {
      drop.setAttribute('tabindex', 0);
      drop.addEventListener('focus', enableKeyboardFocus);
    });
  } else {
    drops.forEach((drop) => {
      drop.removeAttribute('tabindex');
      drop.removeEventListener('focus', enableKeyboardFocus);
    });
  }

  if (!expanded || isDesktop.matches) {
    window.addEventListener('keydown', closeOnEscape);
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

/* ===========================
   ✅ SAFE Hover Logic
   =========================== */
function addSafeHover(navItem, parentSections) {
  navItem.addEventListener('mouseenter', () => {
    if (!isDesktop.matches) return;
    toggleAllNavSections(parentSections);
    navItem.setAttribute('aria-expanded', 'true');
  });

  navItem.addEventListener('mouseleave', (e) => {
    if (!isDesktop.matches) return;
    if (!isTrueExit(navItem, e)) return;
    navItem.setAttribute('aria-expanded', 'false');
  });
}

function addSubNavHover(navItem) {
  navItem.addEventListener('mouseenter', () => {
    if (!isDesktop.matches) return;
    navItem.setAttribute('aria-expanded', 'true');
  });

  navItem.addEventListener('mouseleave', (e) => {
    if (!isDesktop.matches) return;
    if (!isTrueExit(navItem, e)) return;
    navItem.setAttribute('aria-expanded', 'false');
  });
}

/* ===========================
   Header Decorator
   =========================== */
export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta
    ? new URL(navMeta, window.location).pathname
    : '/nav';

  const fragment = await loadFragment(navPath);
  block.textContent = '';

  const nav = document.createElement('nav');
  nav.id = 'nav';

  while (fragment.firstElementChild) {
    nav.append(fragment.firstElementChild);
  }

  ['brand', 'sections', 'tools'].forEach((name, i) => {
    nav.children[i]?.classList.add(`nav-${name}`);
  });

  const navBrand = nav.querySelector('.nav-brand');
  navBrand?.querySelector('.button-container')?.replaceWith(
    navBrand.querySelector('.button')
  );

  const navSections = nav.querySelector('.nav-sections');

  // Add class to <li> elements with <a> and no class
  // Top-level nav-link-item
  navSections
    ?.querySelectorAll('.default-content-wrapper > ul > li')
    .forEach((li) => {
      if (
        li.querySelector('a') &&
        li.classList.length === 0
      ) {
        li.classList.add('nav-link-item');
      }
    });
  // Subnav nav-sublink-item
  navSections
    ?.querySelectorAll('.default-content-wrapper > ul > li ul > li')
    .forEach((li) => {
      if (
        li.querySelector('a') &&
        li.classList.length === 0
      ) {
        li.classList.add('nav-sublink-item');
      }
    });

  /* ===========================
     Top Level Nav
     =========================== */
  navSections
    ?.querySelectorAll('.default-content-wrapper > ul > li')
    .forEach((item) => {
      if (!item.querySelector('ul')) return;

      item.classList.add('nav-drop');
      item.setAttribute('aria-expanded', 'false');

      item.addEventListener('click', () => {
        if (!isDesktop.matches) return;
        const expanded = item.getAttribute('aria-expanded') === 'true';
        toggleAllNavSections(navSections);
        item.setAttribute('aria-expanded', !expanded);
      });

      addSafeHover(item, navSections);
    });

  /* ===========================
     Third Level Nav
     =========================== */
  navSections
    ?.querySelectorAll(
      '.default-content-wrapper > ul > li ul > li'
    )
    .forEach((subItem) => {
      if (!subItem.querySelector(':scope > ul')) return;

      subItem.classList.add('nav-drop');
      subItem.setAttribute('aria-expanded', 'false');
      addSubNavHover(subItem);
    });

  /* ===========================
     Hamburger
     =========================== */
  const hamburger = document.createElement('div');
  hamburger.className = 'nav-hamburger';
  hamburger.innerHTML = `
    <button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>
  `;

  hamburger.addEventListener('click', () =>
    toggleMenu(nav, navSections)
  );

  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');

  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () =>
    toggleMenu(nav, navSections, isDesktop.matches)
  );

  const wrapper = document.createElement('div');
  wrapper.className = 'nav-wrapper';
  wrapper.append(nav);
  block.append(wrapper);
}
