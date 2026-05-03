// ═══════════════════════════════════════════════════════════
// CATALOG PAGE
// ═══════════════════════════════════════════════════════════

import { Product, getCart, addToCart, updateCartBadges } from './cart.js';

// ─── State ────────────────────────────────────────────────
let allProducts:      Product[] = [];
let filteredProducts: Product[] = [];
let currentPage   = 1;
const PAGE_SIZE   = 12;

const activeFilters: Record<string, string> = {};
let   sortValue   = 'default';
let   filtersVisible = false;

// ═══════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  void init();
  updateCartBadges(getCart().length);
});

async function init(): Promise<void> {
  try {
    const res  = await fetch('../assets/data.json');
    const json = (await res.json()) as { data: Product[] };
    allProducts      = json.data;
    filteredProducts = [...allProducts];

    renderGrid();
    renderPagination();
    renderTopBestSets();
    initFilterToggle();
    initFilterSelects();
    initSort();
    initSearch();
  } catch (err) {
    console.error('Catalog: failed to load data', err);
  }
}

// ═══════════════════════════════════════════════════════════
// FILTER TOGGLE  –  show / hide the filter panel
// ═══════════════════════════════════════════════════════════
function initFilterToggle(): void {
  const toggleBtn  = document.getElementById('catalog-filters-toggle');
  const panelBody  = document.getElementById('catalog-filter-panel-body');
  const hideBtn    = document.getElementById('catalog-hide-filters');
  const clearBtn   = document.getElementById('catalog-clear-filters');

  if (!toggleBtn || !panelBody) return;

  // Panel body starts hidden
  panelBody.hidden = true;

  toggleBtn.addEventListener('click', () => {
    const isOpen = !panelBody.hidden;
    panelBody.hidden = isOpen;
    toggleBtn.setAttribute('aria-expanded', String(!isOpen));
  });

  hideBtn?.addEventListener('click', () => {
    panelBody.hidden = true;
    toggleBtn.setAttribute('aria-expanded', 'false');
  });

  clearBtn?.addEventListener('click', () => {
    clearAllFilters();
  });
}

function clearAllFilters(): void {
  // Reset activeFilters object
  Object.keys(activeFilters).forEach(k => { delete activeFilters[k]; });

  // Reset all selects to default
  document.querySelectorAll<HTMLSelectElement>('.catalog-filter-select').forEach(sel => {
    sel.value = '';
    sel.closest('.catalog-filter-group')?.classList.remove('is-active');
  });

  // Reset sales radio
  const salesRadio = document.getElementById('filter-sales') as HTMLInputElement | null;
  if (salesRadio) {
    salesRadio.checked = false;
    salesRadio.dataset['wasChecked'] = 'false';
  }

  applyFiltersAndSort();
}

// ═══════════════════════════════════════════════════════════
// FILTER SELECTS  –  native <select> per filter key
// ═══════════════════════════════════════════════════════════
function initFilterSelects(): void {
  document.querySelectorAll<HTMLSelectElement>('.catalog-filter-select').forEach(sel => {
    sel.addEventListener('change', () => {
      const key = sel.dataset['filterKey'] as string;
      if (sel.value) {
        activeFilters[key] = sel.value;
        sel.closest('.catalog-filter-group')?.classList.add('is-active');
      } else {
        delete activeFilters[key];
        sel.closest('.catalog-filter-group')?.classList.remove('is-active');
      }
      applyFiltersAndSort();
    });
  });

  // Sales radio button
  const salesRadio = document.getElementById('filter-sales') as HTMLInputElement | null;
  salesRadio?.addEventListener('change', () => {
    if (salesRadio.checked) {
      activeFilters['salesStatus'] = 'true';
    } else {
      delete activeFilters['salesStatus'];
    }
    applyFiltersAndSort();
  });

  // Clicking again on already-checked radio deselects it (toggle)
  salesRadio?.addEventListener('click', () => {
    if (salesRadio.dataset['wasChecked'] === 'true') {
      salesRadio.checked = false;
      salesRadio.dataset['wasChecked'] = 'false';
      delete activeFilters['salesStatus'];
      applyFiltersAndSort();
    } else {
      salesRadio.dataset['wasChecked'] = 'true';
    }
  });
}

function applyFiltersAndSort(): void {
  filteredProducts = allProducts.filter(p => {
    let match = true;
    Object.keys(activeFilters).forEach(key => {
      const value = activeFilters[key];
      if (key === 'salesStatus') {
        if (String(p.salesStatus) !== value) match = false;
      } else {
        const pVal = String(p[key as keyof Product]).toLowerCase();
        if (pVal !== value.toLowerCase()) match = false;
      }
    });
    return match;
  });

  applySortToFiltered();
  currentPage = 1;
  renderGrid();
  renderPagination();
}

// ═══════════════════════════════════════════════════════════
// SORTING
// ═══════════════════════════════════════════════════════════
function initSort(): void {
  document.getElementById('catalog-sort')?.addEventListener('change', (e) => {
    sortValue = (e.target as HTMLSelectElement).value;
    applySortToFiltered();
    currentPage = 1;
    renderGrid();
    renderPagination();
  });
}

function applySortToFiltered(): void {
  switch (sortValue) {
    case 'price-asc':
      filteredProducts.sort((a, b) => a.price - b.price); break;
    case 'price-desc':
      filteredProducts.sort((a, b) => b.price - a.price); break;
    case 'popularity':
      filteredProducts.sort((a, b) => b.popularity - a.popularity); break;
    case 'rating':
      filteredProducts.sort((a, b) => b.rating - a.rating); break;
  }
}

// ═══════════════════════════════════════════════════════════
// SEARCH
// ═══════════════════════════════════════════════════════════
function initSearch(): void {
  const input = document.getElementById('catalog-search-input') as HTMLInputElement;
  const btn   = document.getElementById('catalog-search-btn');

  const doSearch = (): void => {
    const query = input.value.trim().toLowerCase();
    if (!query) return;
    const found = allProducts.find(p => p.name.toLowerCase().includes(query));
    if (found) {
      window.location.href = `/src/html/product-details.html?id=${found.id}`;
    } else {
      showPopup();
    }
  };

  btn?.addEventListener('click', doSearch);
  input?.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter') doSearch();
  });
}

function showPopup(): void {
  const popup = document.getElementById('catalog-popup');
  if (!popup) return;
  popup.removeAttribute('hidden');

  const close = (): void => popup.setAttribute('hidden', '');
  document.getElementById('catalog-popup-close')?.addEventListener('click', close, { once: true });
  popup.addEventListener('click', (e) => { if (e.target === popup) close(); }, { once: true });
}

// ═══════════════════════════════════════════════════════════
// GRID RENDER
// ═══════════════════════════════════════════════════════════
function renderGrid(): void {
  const grid = document.getElementById('catalog-grid');
  if (!grid) return;
  updateResultsText();

  const start    = (currentPage - 1) * PAGE_SIZE;
  const pageData = filteredProducts.slice(start, start + PAGE_SIZE);

  if (pageData.length === 0) {
    grid.innerHTML = `<div class="catalog-grid--empty">No products match your filters.</div>`;
    return;
  }

  grid.innerHTML = pageData.map(p => buildCard(p)).join('');

  grid.querySelectorAll<HTMLButtonElement>('.product-card__btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.closest<HTMLElement>('[data-product-id]')?.dataset['productId'];
      const product = allProducts.find(p => p.id === id);
      if (product) addToCart(product);
    });
  });

  grid.querySelectorAll<HTMLElement>('.product-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset['productId'];
      if (id) window.location.href = `/src/html/product-details.html?id=${id}`;
    });
  });
}

function updateResultsText(): void {
  const el    = document.getElementById('catalog-results-text');
  if (!el) return;
  const total = filteredProducts.length;
  const start = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const end   = Math.min(currentPage * PAGE_SIZE, total);
  el.textContent = `Showing ${start}–${end} of ${total} Results`;
}

function buildCard(product: Product): string {
  const badge  = product.salesStatus
    ? `<div class="product-card__badge" aria-label="Sale"><span>SALE</span></div>` : '';
  const isHomepageCategory = ['suitcases'].includes(product.category);
  const folder = isHomepageCategory ? 'homepage' : 'catalog';
  
  const imgSrc = `../assets/images/${folder}/${product.imageUrl}`;
  return `
    <article class="product-card" data-product-id="${product.id}"
             aria-label="${product.name}" tabindex="0">
      <div class="product-card__img-wrap">
        ${badge}
        <img class="product-card__img" src="${imgSrc}" alt="${product.name}"
             loading="lazy" onerror="this.style.display='none'" />
      </div>
      <div class="product-card__body">
        <h3 class="product-card__name">${product.name}</h3>
        <p class="product-card__price">$${product.price}</p>
        <button class="product-card__btn" type="button"
                aria-label="Add ${product.name} to cart">Add To Cart</button>
      </div>
    </article>`;
}

// ═══════════════════════════════════════════════════════════
// PAGINATION
// ═══════════════════════════════════════════════════════════
function renderPagination(): void {
  const pagesEl = document.getElementById('catalog-pages');
  const prevBtn = document.getElementById('catalog-prev') as HTMLButtonElement;
  const nextBtn = document.getElementById('catalog-next') as HTMLButtonElement;
  if (!pagesEl || !prevBtn || !nextBtn) return;

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));

  pagesEl.innerHTML = Array.from({ length: totalPages }, (_, i) => {
    const n = i + 1;
    return `<button class="catalog-pagination__page${n === currentPage ? ' is-active' : ''}"
                    type="button" data-page="${n}">${n}</button>`;
  }).join('');

  pagesEl.querySelectorAll<HTMLButtonElement>('.catalog-pagination__page').forEach(btn => {
    btn.addEventListener('click', () => {
      currentPage = Number(btn.dataset['page']);
      renderGrid(); renderPagination();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;

  prevBtn.onclick = () => { if (currentPage > 1) { currentPage--; renderGrid(); renderPagination(); } };
  nextBtn.onclick = () => { if (currentPage < totalPages) { currentPage++; renderGrid(); renderPagination(); } };
}

// ═══════════════════════════════════════════════════════════
// TOP BEST SETS
// ═══════════════════════════════════════════════════════════
function renderTopBestSets(): void {
  const container = document.getElementById('top-best-sets');
  if (!container) return;

  let pool = allProducts.filter(p => p.category === 'luggage sets');
  if (pool.length < 5) {
    const extra = allProducts
      .filter(p => p.category !== 'luggage sets')
      .sort(() => Math.random() - 0.5);
    pool = [...pool, ...extra].slice(0, 5);
  }

  container.innerHTML = pool.slice(0, 5).map(p => buildBestSetRow(p)).join('');

  container.querySelectorAll<HTMLElement>('.best-set').forEach(row => {
    row.addEventListener('click', () => {
      const id = row.dataset['productId'];
      if (id) window.location.href = `/src/html/product-details.html?id=${id}`;
    });
  });
}

function buildBestSetRow(product: Product): string {
  const isHomepageCategory = ['suitcases'].includes(product.category);
  const folder = isHomepageCategory ? 'homepage' : 'catalog';
  
  const imgSrc = `../assets/images/${folder}/${product.imageUrl}`;
  return `
    <div class="best-set" data-product-id="${product.id}" tabindex="0">
      <div class="best-set__img-wrap">
        <img class="best-set__img" src="${imgSrc}" alt="${product.name}"
             loading="lazy" onerror="this.style.display='none'" />
      </div>
      <div class="best-set__info">
        <p class="best-set__name">${product.name}</p>
        <div class="best-set__stars">${buildStars(product.rating)}</div>
        <p class="best-set__price">$${product.price}</p>
      </div>
    </div>`;
}

function buildStars(rating: number): string {
  const full  = `<svg viewBox="0 0 12 12" fill="rgba(245,180,35,1)" xmlns="http://www.w3.org/2000/svg"><polygon points="6,1 7.5,4.5 11,5 8.5,7.5 9,11 6,9.5 3,11 3.5,7.5 1,5 4.5,4.5"/></svg>`;
  const empty = `<svg viewBox="0 0 12 12" fill="rgba(233,233,237,1)" xmlns="http://www.w3.org/2000/svg"><polygon points="6,1 7.5,4.5 11,5 8.5,7.5 9,11 6,9.5 3,11 3.5,7.5 1,5 4.5,4.5"/></svg>`;
  return Array.from({ length: 5 }, (_, i) => i < Math.round(rating) ? full : empty).join('');
}