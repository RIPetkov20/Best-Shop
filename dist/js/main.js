// ═══════════════════════════════════════════════════════════
// MAIN  –  loads header + footer partials, then inits UI
// ═══════════════════════════════════════════════════════════
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
document.addEventListener('DOMContentLoaded', () => {
    // Load both partials in parallel, then init all UI features
    void Promise.all([loadPartial('header'), loadPartial('footer')]).then(() => {
        initHamburger();
        setActiveNavLink();
        initCartCounter();
        initAccountModal();
    });
});
// ───────────────────────────────────────────────────────────
// PARTIAL LOADER
// Resolves the correct relative path based on URL depth,
// fetches the HTML partial, and replaces the placeholder.
// ───────────────────────────────────────────────────────────
function loadPartial(name) {
    return __awaiter(this, void 0, void 0, function* () {
        const placeholder = document.getElementById(`${name}-placeholder`);
        if (!placeholder)
            return;
        try {
            // Depth: src/index.html = 2 segments → prefix ''
            //        src/html/page.html = 3 segments → prefix '../'
            const segments = window.location.pathname.split('/').filter(Boolean);
            const prefix = segments.length <= 2 ? '' : '../';
            const url = `${prefix}html/components/${name}.html`;
            const response = yield fetch(url);
            if (!response.ok)
                throw new Error(`${name} fetch failed: ${response.status}`);
            const html = yield response.text();
            placeholder.outerHTML = html;
        }
        catch (err) {
            console.error(`Could not load ${name} partial:`, err);
            placeholder.remove();
        }
    });
}
// ───────────────────────────────────────────────────────────
// HAMBURGER / MOBILE MENU
// ───────────────────────────────────────────────────────────
function initHamburger() {
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('#mobile-menu');
    const overlay = document.querySelector('.mobile-overlay');
    if (!hamburger || !mobileMenu || !overlay)
        return;
    const MOBILE_BP = 768;
    const openMenu = () => {
        hamburger.setAttribute('aria-expanded', 'true');
        mobileMenu.classList.add('is-open');
        mobileMenu.setAttribute('aria-hidden', 'false');
        overlay.classList.add('is-visible');
        document.body.style.overflow = 'hidden';
    };
    const closeMenu = () => {
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
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape')
            closeMenu();
    });
    // Close when a mobile nav link is clicked
    mobileMenu.querySelectorAll('.mobile-nav__link').forEach(link => {
        link.addEventListener('click', closeMenu);
    });
    // Close + reset body scroll when resized back to desktop
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (window.innerWidth > MOBILE_BP)
                closeMenu();
        }, 100);
    });
}
// ───────────────────────────────────────────────────────────
// ACTIVE NAV LINK  (matches current page filename)
// ───────────────────────────────────────────────────────────
function setActiveNavLink() {
    const filename = window.location.pathname.split('/').pop() || 'index.html';
    const pageMap = {
        'index.html': 'home',
        '': 'home',
        'catalog.html': 'catalog',
        'about.html': 'about',
        'contact.html': 'contact',
    };
    const page = pageMap[filename];
    if (!page)
        return;
    document.querySelectorAll(`[data-page="${page}"]`).forEach(el => {
        el.classList.add('active');
        if (el.tagName === 'A')
            el.setAttribute('aria-current', 'page');
    });
}
// ───────────────────────────────────────────────────────────
// CART COUNTER  –  reads from localStorage key "cart"
// ───────────────────────────────────────────────────────────
export function updateCartCounter() {
    const stored = localStorage.getItem('cart');
    const cart = stored ? JSON.parse(stored) : [];
    const count = cart.length;
    document.querySelectorAll('.cart-count').forEach(badge => {
        badge.textContent = count.toString();
        badge.dataset['count'] = count.toString();
    });
}
function initCartCounter() {
    updateCartCounter();
    window.addEventListener('storage', (e) => {
        if (e.key === 'cart')
            updateCartCounter();
    });
}
// ───────────────────────────────────────────────────────────
// ACCOUNT MODAL  –  dispatches event for modal module
// ───────────────────────────────────────────────────────────
function initAccountModal() {
    document.querySelectorAll('.js-account-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.dispatchEvent(new CustomEvent('openLoginModal'));
        });
    });
}
