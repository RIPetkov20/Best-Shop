import { loadComponent } from "./utils/loadComponent.js";

// HEADER  –  hamburger, active nav, cart counter

document.addEventListener('DOMContentLoaded', async () => {

  await loadComponent(
    'header-placeholder',
    '/src/html/components/header.html'
  );

  initHamburger();
  setActiveNavLink();
  initCartCounter();
  initAccountModal();
});

// HAMBURGER / MOBILE MENU
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

// ACTIVE NAV LINK  (matches current page filename)
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

// CART COUNTER  –  reads from localStorage key "cart"
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

// ACCOUNT MODAL
function initAccountModal(): void {
  document.querySelectorAll<HTMLElement>('.js-account-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('openLoginModal'));
    });
  });
}