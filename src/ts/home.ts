// ═══════════════════════════════════════════════════════════
// HOME PAGE
// ═══════════════════════════════════════════════════════════

import { Product, getCart, addToCart, updateCartBadges } from './cart.js';

// ═══════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  initDiscountBtn();
  initTravelSlider();
  void loadSelectedProducts();
  void loadNewProducts();
  // Sync cart badge on page load
  updateCartBadges(getCart().length);
});

// ───────────────────────────────────────────────────────────
// DISCOUNT BUTTON
// ───────────────────────────────────────────────────────────
function initDiscountBtn(): void {
  const btn = document.querySelector<HTMLButtonElement>(
    '.promo-card--discount .btn'
  );
  btn?.addEventListener('click', () => {
    window.location.href = '/src/html/catalog.html';
  });
}

// ───────────────────────────────────────────────────────────
// SELECTED PRODUCTS  –  load from data.json, render cards
// ───────────────────────────────────────────────────────────
async function loadSelectedProducts(): Promise<void> {
  const grid = document.getElementById('selected-products-grid');
  if (!grid) return;

  // Show loading state
  grid.innerHTML = '<p style="text-align:center;padding:40px;color:#888;">Loading...</p>';

  try {
    // Path relative to the HTML file location (src/index.html)
    const response = await fetch('assets/data.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const json = (await response.json()) as { data: Product[] };

    // Filter to only "Selected Products" block
    const selected = json.data.filter(p =>
      p.blocks.includes('Selected Products')
    );

    if (selected.length === 0) {
      grid.innerHTML = '<p style="text-align:center;padding:40px;">No products found.</p>';
      return;
    }

    // Render cards
    grid.innerHTML = selected.map(product => buildProductCard(product)).join('');

    // Attach Add To Cart listeners
    grid.querySelectorAll<HTMLButtonElement>('.product-card__btn').forEach(btn => {
      btn.addEventListener('click', (e: MouseEvent) => {
        e.stopPropagation(); // don't navigate to product page
        const id = (btn.closest('[data-product-id]') as HTMLElement)?.dataset['productId'];
        const product = selected.find(p => p.id === id);
        if (product) addToCart(product);
      });
    });

    // Clicking the card itself → product details page
    grid.querySelectorAll<HTMLElement>('.product-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset['productId'];
        if (id) window.location.href = `/src/html/product-details.html?id=${id}`;
      });
    });

  } catch (err) {
    console.error('Failed to load products:', err);
    grid.innerHTML = '<p style="text-align:center;padding:40px;color:#888;">Could not load products.</p>';
  }
}

// ─── Build a single product card HTML string ──────────────
function buildProductCard(product: Product): string {
  const badge = product.salesStatus
    ? `<div class="product-card__badge" aria-label="Sale"><span>SALE</span></div>`
    : '';

  // path is relative to src/index.html → src/assets/homepage/
  const imgSrc = `assets/images/homepage/${product.imageUrl}`;

  return `
    <article
      class="product-card"
      data-product-id="${product.id}"
      aria-label="${product.name}"
      tabindex="0"
    >
      <div class="product-card__img-wrap">
        ${badge}
        <img
          class="product-card__img"
          src="${imgSrc}"
          alt="${product.name}"
          loading="lazy"
          onerror="this.style.display='none'"
        />
      </div>
      <div class="product-card__body">
        <h3 class="product-card__name">${product.name}</h3>
        <p class="product-card__price">$${product.price}</p>
        <button class="product-card__btn" type="button" aria-label="Add ${product.name} to cart">
          Add To Cart
        </button>
      </div>
    </article>
  `;
}

// ───────────────────────────────────────────────────────────
// NEW PRODUCTS ARRIVAL  –  load from data.json, render cards
// ───────────────────────────────────────────────────────────
async function loadNewProducts(): Promise<void> {
  const grid = document.getElementById('new-products-grid');
  if (!grid) return;

  grid.innerHTML = '<p style="text-align:center;padding:40px;color:#888;">Loading...</p>';

  try {
    const response = await fetch('assets/data.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const json = (await response.json()) as { data: Product[] };

    const newProducts = json.data.filter(p =>
      p.blocks.includes('New Products Arrival')
    );

    if (newProducts.length === 0) {
      grid.innerHTML = '<p style="text-align:center;padding:40px;">No products found.</p>';
      return;
    }

    // "View Product" cards — clicking navigates to product details
    grid.innerHTML = newProducts.map(p => buildViewProductCard(p)).join('');

    // Entire card is clickable → product details
    grid.querySelectorAll<HTMLElement>('.product-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset['productId'];
        if (id) window.location.href = `/src/html/product-details.html?id=${id}`;
      });
    });

  } catch (err) {
    console.error('Failed to load new products:', err);
    grid.innerHTML = '<p style="text-align:center;padding:40px;color:#888;">Could not load products.</p>';
  }
}

// ─── Product card with "View Product" button ──────────────
function buildViewProductCard(product: Product): string {
  const badge = product.salesStatus
    ? `<div class="product-card__badge" aria-label="Sale"><span>SALE</span></div>`
    : '';

  const imgSrc = `assets/images/homepage/${product.imageUrl}`;

  return `
    <article
      class="product-card"
      data-product-id="${product.id}"
      aria-label="${product.name}"
      tabindex="0"
    >
      <div class="product-card__img-wrap">
        ${badge}
        <img
          class="product-card__img"
          src="${imgSrc}"
          alt="${product.name}"
          loading="lazy"
          onerror="this.style.display='none'"
        />
      </div>
      <div class="product-card__body">
        <h3 class="product-card__name">${product.name}</h3>
        <p class="product-card__price">$${product.price}</p>
        <button class="product-card__btn" type="button" aria-label="View ${product.name}">
          View Product
        </button>
      </div>
    </article>
  `;
}

// ───────────────────────────────────────────────────────────
// TRAVEL SUITCASES SLIDER  –  infinite cycling rotation
// ───────────────────────────────────────────────────────────
function initTravelSlider(): void {
  const sliderEl = document.querySelector<HTMLElement>('[data-slider="travel"]');
  if (!sliderEl) return;

  const track   = sliderEl.querySelector<HTMLElement>('.slider__track');
  const prevBtn = sliderEl.querySelector<HTMLButtonElement>('.slider__btn--prev');
  const nextBtn = sliderEl.querySelector<HTMLButtonElement>('.slider__btn--next');
  const wrapper = sliderEl.querySelector<HTMLElement>('.slider__track-wrapper');

  if (!track || !prevBtn || !nextBtn || !wrapper) return;

  const getSlides = (): HTMLElement[] =>
    Array.from(track.querySelectorAll<HTMLElement>(':scope > .slider__slide'));

  const getGap = (): number =>
    parseFloat(getComputedStyle(track).gap) || 39;

  const getStep = (): number => {
    const slides = getSlides();
    return slides.length ? slides[0].offsetWidth + getGap() : 0;
  };

  let isAnimating = false;

  const setTransition = (on: boolean): void => {
    track.style.transition = on
      ? 'transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)'
      : 'none';
  };

  const reflow = (): void => { void track.offsetHeight; };

  const slideNext = (): void => {
    if (isAnimating) return;
    isAnimating = true;
    setTransition(true);
    track.style.transform = `translateX(-${getStep()}px)`;
    track.addEventListener('transitionend', () => {
      track.appendChild(getSlides()[0]);
      setTransition(false);
      track.style.transform = 'translateX(0)';
      reflow();
      setTransition(true);
      isAnimating = false;
    }, { once: true });
  };

  const slidePrev = (): void => {
    if (isAnimating) return;
    isAnimating = true;
    const slides = getSlides();
    track.prepend(slides[slides.length - 1]);
    setTransition(false);
    track.style.transform = `translateX(-${getStep()}px)`;
    reflow();
    setTransition(true);
    track.style.transform = 'translateX(0)';
    track.addEventListener('transitionend', () => {
      isAnimating = false;
    }, { once: true });
  };

  prevBtn.addEventListener('click', slidePrev);
  nextBtn.addEventListener('click', slideNext);

  let touchStartX = 0;
  wrapper.addEventListener('touchstart', (e: TouchEvent) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  wrapper.addEventListener('touchend', (e: TouchEvent) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) < 40) return;
    diff > 0 ? slideNext() : slidePrev();
  }, { passive: true });

  setTransition(true);
  track.style.transform = 'translateX(0)';
}