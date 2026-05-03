// ═══════════════════════════════════════════════════════════
// MAIN  –  loads header + footer partials, then inits UI
// ═══════════════════════════════════════════════════════════

import { initLoginModal } from './loginModal.js';

document.addEventListener('DOMContentLoaded', () => {
  // Load both partials in parallel, then init all UI features
  void Promise.all([loadPartial('header'), loadPartial('footer')]).then(() => {
    initHamburger();
    setActiveNavLink();
    initCartCounter();
    initAccountModal();
    initLoginModal();
  });
});

// ───────────────────────────────────────────────────────────
// PARTIAL LOADER
// Resolves the correct relative path based on URL depth,
// fetches the HTML partial, and replaces the placeholder.
// ───────────────────────────────────────────────────────────
async function loadPartial(name: 'header' | 'footer'): Promise<void> {
  const placeholder = document.getElementById(`${name}-placeholder`);
  if (!placeholder) return;

  try {
    // Depth: src/index.html = 2 segments → prefix ''
    //        src/html/page.html = 3 segments → prefix '../'
    const segments = window.location.pathname.split('/').filter(Boolean);
    const prefix   = segments.length <= 2 ? '' : '../';
    const url      = `${prefix}html/components/${name}.html`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`${name} fetch failed: ${response.status}`);

    const html = await response.text();
    placeholder.outerHTML = html;
  } catch (err) {
    console.error(`Could not load ${name} partial:`, err);
    placeholder.remove();
  }
}

// ───────────────────────────────────────────────────────────
// HAMBURGER / MOBILE MENU
// ───────────────────────────────────────────────────────────
function initHamburger(): void {
  const hamburger  = document.querySelector<HTMLButtonElement>('.hamburger');
  const mobileMenu = document.querySelector<HTMLElement>('#mobile-menu');
  const overlay    = document.querySelector<HTMLElement>('.mobile-overlay');

  if (!hamburger || !mobileMenu || !overlay) return;

  const MOBILE_BP = 768;

  const openMenu = (): void => {
    hamburger.setAttribute('aria-expanded', 'true');
    mobileMenu.classList.add('is-open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    overlay.classList.add('is-visible');
    document.body.style.overflow = 'hidden';
  };

  const closeMenu = (): void => {
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    overlay.classList.remove('is-visible');
    document.body.style.overflow = '';
  };

  hamburger.addEventListener('click', () => {
    hamburger.getAttribute('aria-expanded') === 'true' ? closeMenu() : openMenu();
  });

  overlay.addEventListener('click', closeMenu);

  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape') closeMenu();
  });

  // Close when a mobile nav link is clicked
  mobileMenu.querySelectorAll<HTMLElement>('.mobile-nav__link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close + reset body scroll when resized back to desktop
  let resizeTimer: ReturnType<typeof setTimeout>;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (window.innerWidth > MOBILE_BP) closeMenu();
    }, 100);
  });
}

// ───────────────────────────────────────────────────────────
// ACTIVE NAV LINK  (matches current page filename)
// ───────────────────────────────────────────────────────────
function setActiveNavLink(): void {
  const filename = window.location.pathname.split('/').pop() || 'index.html';

  const pageMap: Record<string, string> = {
    'index.html': 'home',
    '':           'home',
    'catalog.html': 'catalog',
    'about.html':   'about',
    'contact.html': 'contact',
  };

  const page = pageMap[filename];
  if (!page) return;

  document.querySelectorAll<HTMLElement>(`[data-page="${page}"]`).forEach(el => {
    el.classList.add('active');
    if (el.tagName === 'A') el.setAttribute('aria-current', 'page');
  });
}

// ───────────────────────────────────────────────────────────
// CART COUNTER  –  reads from localStorage key "cart"
// ───────────────────────────────────────────────────────────
export function updateCartCounter(): void {
  const stored = localStorage.getItem('cart');
  const cart: unknown[] = stored ? (JSON.parse(stored) as unknown[]) : [];
  const count = cart.length;

  document.querySelectorAll<HTMLElement>('.cart-count').forEach(badge => {
    badge.textContent = count.toString();
    badge.dataset['count'] = count.toString();
  });
}

function initCartCounter(): void {
  updateCartCounter();
  window.addEventListener('storage', (e: StorageEvent) => {
    if (e.key === 'cart') updateCartCounter();
  });
}

// ───────────────────────────────────────────────────────────
// ACCOUNT MODAL  –  dispatches event for modal module
// ───────────────────────────────────────────────────────────
function initAccountModal(): void {
  document.querySelectorAll<HTMLElement>('.js-account-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('openLoginModal'));
    });
  });
}