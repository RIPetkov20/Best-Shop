// ═══════════════════════════════════════════════════════════
// CART PAGE  –  cartPage.ts
// ═══════════════════════════════════════════════════════════

import { Product, getCart, saveCart, updateCartBadges } from './cart.js';

// ─── Cart entry (may have quantity > 1) ───────────────────
interface CartEntry {
  product:  Product;
  quantity: number;
  // Key used to decide merge vs. separate entry
  mergeKey: string;
}

// ─── Constants ────────────────────────────────────────────
const SHIPPING        = 30;
const DISCOUNT_THRESH = 3000;
const DISCOUNT_RATE   = 0.10;

// ─── State ────────────────────────────────────────────────
let entries: CartEntry[] = [];

// ═══════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  entries = buildEntries(getCart());
  render();
  initButtons();
});

// ═══════════════════════════════════════════════════════════
// BUILD ENTRIES FROM RAW CART
// Merge if name + size + color all match; keep separate otherwise.
// ═══════════════════════════════════════════════════════════
function buildEntries(cart: Product[]): CartEntry[] {
  const map = new Map<string, CartEntry>();

  cart.forEach(product => {
    const mergeKey = `${product.name}||${product.size}||${product.color}`;

    if (map.has(mergeKey)) {
      map.get(mergeKey)!.quantity++;
    } else {
      map.set(mergeKey, { product, quantity: 1, mergeKey });
    }
  });

  return Array.from(map.values());
}

// ═══════════════════════════════════════════════════════════
// PERSIST  –  flatten entries back to raw Product[] and save
// ═══════════════════════════════════════════════════════════
function persist(): void {
  const raw: Product[] = [];
  entries.forEach(e => {
    for (let i = 0; i < e.quantity; i++) raw.push(e.product);
  });
  saveCart(raw);
  updateCartBadges(raw.length);
}

// ═══════════════════════════════════════════════════════════
// RENDER EVERYTHING
// ═══════════════════════════════════════════════════════════
function render(): void {
  renderTable();
  renderSummary();
  renderVisibility();
}

// ─── Table body ───────────────────────────────────────────
function renderTable(): void {
  const body = document.getElementById('cart-table-body');
  if (!body) return;

  body.innerHTML = entries.map((entry, idx) => buildRow(entry, idx)).join('');

  // Attach listeners to newly rendered rows
  body.querySelectorAll<HTMLButtonElement>('.cart-qty__btn--minus').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset['idx']);
      if (entries[idx].quantity > 1) {
        entries[idx].quantity--;
      } else {
        entries.splice(idx, 1);
      }
      persist();
      render();
    });
  });

  body.querySelectorAll<HTMLButtonElement>('.cart-qty__btn--plus').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset['idx']);
      entries[idx].quantity++;
      persist();
      render();
    });
  });

  body.querySelectorAll<HTMLButtonElement>('.cart-row__delete').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset['idx']);
      entries.splice(idx, 1);
      persist();
      render();
    });
  });
}

function buildRow(entry: CartEntry, idx: number): string {
  const { product, quantity } = entry;
  const imgSrc    = `../assets/images/homepage/${product.imageUrl}`;
  const rowTotal  = product.price * quantity;

  return `
    <div class="cart-row">
      <img class="cart-row__img" src="${imgSrc}" alt="${product.name}"
           loading="lazy" onerror="this.style.display='none'" />

      <span class="cart-row__name">${product.name}</span>

      <span class="cart-row__price">$${product.price}</span>

      <div class="cart-row__qty">
        <button class="cart-qty__btn cart-qty__btn--minus" type="button"
                data-idx="${idx}" aria-label="Decrease quantity">−</button>
        <span class="cart-qty__value">${quantity}</span>
        <button class="cart-qty__btn cart-qty__btn--plus" type="button"
                data-idx="${idx}" aria-label="Increase quantity">+</button>
      </div>

      <span class="cart-row__total">$${rowTotal}</span>

      <button class="cart-row__delete" type="button"
              data-idx="${idx}" aria-label="Remove ${product.name}">
        <!-- Delete icon (inline SVG) -->
        <svg viewBox="0 0 18 20" aria-hidden="true">
          <polyline points="1 5 17 5"/>
          <path d="M7 5V3h4v2"/>
          <rect x="3" y="5" width="12" height="13" rx="1"/>
          <line x1="7" y1="9" x2="7" y2="15"/>
          <line x1="11" y1="9" x2="11" y2="15"/>
        </svg>
      </button>
    </div>`;
}

// ─── Summary prices ───────────────────────────────────────
function renderSummary(): void {
  const subTotal  = entries.reduce((sum, e) => sum + e.product.price * e.quantity, 0);
  const discount  = subTotal > DISCOUNT_THRESH ? Math.round(subTotal * DISCOUNT_RATE) : 0;
  const total     = subTotal - discount + SHIPPING;

  const set = (id: string, val: string): void => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  set('cart-subtotal', `$${subTotal}`);
  set('cart-shipping',  `$${SHIPPING}`);
  set('cart-total',    `$${total}`);

  // Discount row visibility
  const discountRow = document.getElementById('cart-discount-row');
  const discountDiv = document.getElementById('cart-discount-divider');
  if (discountRow && discountDiv) {
    if (discount > 0) {
      set('cart-discount', `−$${discount}`);
      discountRow.removeAttribute('hidden');
      discountDiv.removeAttribute('hidden');
    } else {
      discountRow.setAttribute('hidden', '');
      discountDiv.setAttribute('hidden', '');
    }
  }
}

// ─── Show/hide table vs empty vs thank-you ────────────────
function renderVisibility(): void {
  const tableHead   = document.querySelector<HTMLElement>('.cart-table__head');
  const tableBody   = document.getElementById('cart-table-body');
  const emptyEl     = document.getElementById('cart-empty');
  const thankyouEl  = document.getElementById('cart-thankyou');
  const bottomEl    = document.getElementById('cart-bottom');

  const isEmpty = entries.length === 0;

  if (tableHead) tableHead.style.display  = isEmpty ? 'none' : '';
  if (tableBody) tableBody.style.display  = isEmpty ? 'none' : '';
  if (emptyEl)   emptyEl.hidden           = !isEmpty;
  if (bottomEl)  bottomEl.style.display   = isEmpty ? 'none' : '';
  if (thankyouEl) thankyouEl.hidden       = true;   // only shown on checkout
}

// ═══════════════════════════════════════════════════════════
// BUTTONS
// ═══════════════════════════════════════════════════════════
function initButtons(): void {
  // Continue Shopping → catalog
  document.getElementById('cart-continue')?.addEventListener('click', () => {
    window.location.href = '/src/html/catalog.html';
  });

  // Clear Cart
  document.getElementById('cart-clear')?.addEventListener('click', () => {
    entries = [];
    persist();
    render();
  });

  // Checkout
  document.getElementById('cart-checkout')?.addEventListener('click', () => {
    entries = [];
    persist();

    // Hide table + buttons, show thank you
    const tableHead  = document.querySelector<HTMLElement>('.cart-table__head');
    const tableBody  = document.getElementById('cart-table-body');
    const emptyEl    = document.getElementById('cart-empty');
    const bottomEl   = document.getElementById('cart-bottom');
    const thankyouEl = document.getElementById('cart-thankyou');

    if (tableHead)  tableHead.style.display  = 'none';
    if (tableBody)  tableBody.style.display  = 'none';
    if (emptyEl)    emptyEl.hidden           = true;
    if (bottomEl)   bottomEl.style.display   = 'none';
    if (thankyouEl) thankyouEl.hidden        = false;
  });
}