// ═══════════════════════════════════════════════════════════
// CART PAGE  –  rendering + all interactions
// Import shared utilities from cart.ts (the module)
// ═══════════════════════════════════════════════════════════

import { Product, getCart, saveCart, updateCartBadges } from './cart.js';

// ── A merged display entry (name + size + color grouped together)
interface CartItem {
  product: Product;
  quantity: number;
}

const SHIPPING_COST   = 30;
const DISCOUNT_RATE   = 0.1;
const DISCOUNT_THRESHOLD = 3000;

// ═══════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  renderCart();
  initButtons();

  // Re-render if another tab updates localStorage
  window.addEventListener('storage', (e: StorageEvent) => {
    if (e.key === 'cart') renderCart();
  });
});

// ═══════════════════════════════════════════════════════════
// MERGE  –  group raw Product[] into CartItem[]
// Merge rule: same name + size + color → merge (add quantities)
//             same name only           → keep separate
// ═══════════════════════════════════════════════════════════
function mergeCartItems(products: Product[]): CartItem[] {
  const items: CartItem[] = [];

  for (const product of products) {
    const existing = items.find(
      item =>
        item.product.name  === product.name &&
        item.product.size  === product.size &&
        item.product.color === product.color
    );

    if (existing) {
      existing.quantity++;
    } else {
      items.push({ product, quantity: 1 });
    }
  }

  return items;
}

// ═══════════════════════════════════════════════════════════
// SAVE merged items back to raw Product[]
// ═══════════════════════════════════════════════════════════
function saveItems(items: CartItem[]): void {
  const raw: Product[] = items.flatMap(item =>
    Array.from({ length: item.quantity }, () => ({ ...item.product }))
  );
  saveCart(raw);
  updateCartBadges(raw.length);
}

// ═══════════════════════════════════════════════════════════
// RENDER CART
// ═══════════════════════════════════════════════════════════
function renderCart(): void {
  const raw   = getCart();
  const items = mergeCartItems(raw);

  const body        = document.getElementById('cart-table-body');
  const emptyEl     = document.getElementById('cart-empty')    as HTMLElement;
  const thankyouEl  = document.getElementById('cart-thankyou') as HTMLElement;
  const bottomEl    = document.getElementById('cart-bottom')   as HTMLElement;

  if (!body) return;

  // Hide thank-you if we're just re-rendering normally
  if (!thankyouEl.hidden) return; // checkout flow — don't re-render

  if (items.length === 0) {
    body.innerHTML = '';
    emptyEl.hidden  = false;
    bottomEl.hidden = true;
    updateCartBadges(0);
    return;
  }

  emptyEl.hidden  = true;
  bottomEl.hidden = false;

  body.innerHTML = items.map((item, idx) => buildRow(item, idx)).join('');

  attachRowHandlers(items);
  updateTotals(items);
}

// ── Build a single table row ──────────────────────────────
function buildRow(item: CartItem, idx: number): string {
  const { product, quantity } = item;

  // Resolve image: try catalog first, fallback to homepage
  //const imgSrc      = `../assets/images/catalog/${product.imageUrl}`;
   const isHomepageCategory = ['suitcases'].includes(product.category);
  const folder = isHomepageCategory ? 'homepage' : 'catalog';
  
  const imgSrc = `../assets/images/${folder}/${product.imageUrl}`;
  const imgFallback = `../assets/images/homepage/${product.imageUrl}`;
  const lineTotal   = (product.price * quantity).toFixed(2);

  return `
    <div class="cart-row" data-row-idx="${idx}">

      <!-- Image -->
      <img
        class="cart-row__img"
        src="${imgSrc}"
        alt="${product.name}"
        loading="lazy"
        onerror="this.src='${imgFallback}'"
      />

      <!-- Name -->
      <div class="cart-row__name">
        ${product.name}
        ${product.size  ? `<br><small style="font-weight:400;font-size:13px;opacity:0.7;">Size: ${product.size}</small>` : ''}
        ${product.color ? `<br><small style="font-weight:400;font-size:13px;opacity:0.7;">Color: ${product.color}</small>` : ''}
      </div>

      <!-- Unit price -->
      <div class="cart-row__price">$${product.price.toFixed(2)}</div>

      <!-- Quantity -->
      <div class="cart-row__qty">
        <button
          class="cart-qty__btn cart-qty__btn--minus"
          data-row-idx="${idx}"
          type="button"
          aria-label="Decrease quantity"
        >−</button>
        <span
          class="cart-qty__value"
          id="qty-val-${idx}"
          aria-live="polite"
          aria-atomic="true"
        >${quantity}</span>
        <button
          class="cart-qty__btn cart-qty__btn--plus"
          data-row-idx="${idx}"
          type="button"
          aria-label="Increase quantity"
        >+</button>
      </div>

      <!-- Line total -->
      <div class="cart-row__total" id="row-total-${idx}">
        $${lineTotal}
      </div>

      <!-- Delete -->
      <button
        class="cart-row__delete"
        data-row-idx="${idx}"
        type="button"
        aria-label="Remove ${product.name} from cart"
      >
        <svg viewBox="0 0 18 20" aria-hidden="true">
          <polyline points="3 6 5 6 17 6"/>
          <path d="M6 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          <path d="M14 6l-1 12H5L4 6"/>
          <line x1="9" y1="10" x2="9" y2="16"/>
          <line x1="7" y1="10" x2="7.4" y2="16"/>
          <line x1="11" y1="10" x2="10.6" y2="16"/>
        </svg>
      </button>

    </div>
  `;
}

// ═══════════════════════════════════════════════════════════
// ROW EVENT HANDLERS  –  qty +/- and delete
// ═══════════════════════════════════════════════════════════
function attachRowHandlers(items: CartItem[]): void {
  const body = document.getElementById('cart-table-body');
  if (!body) return;

  // ── Minus buttons
  body.querySelectorAll<HTMLButtonElement>('.cart-qty__btn--minus').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset['rowIdx']);
      if (items[idx].quantity > 1) {
        items[idx].quantity--;
        saveItems(items);
        updateRowDisplay(idx, items[idx]);
        updateTotals(items);
      }
    });
  });

  // ── Plus buttons
  body.querySelectorAll<HTMLButtonElement>('.cart-qty__btn--plus').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset['rowIdx']);
      items[idx].quantity++;
      saveItems(items);
      updateRowDisplay(idx, items[idx]);
      updateTotals(items);
    });
  });

  // ── Delete buttons
  body.querySelectorAll<HTMLButtonElement>('.cart-row__delete').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset['rowIdx']);
      items.splice(idx, 1);
      saveItems(items);
      renderCart(); // full re-render to reset indices
    });
  });
}

// ── Update qty display + row total without full re-render
function updateRowDisplay(idx: number, item: CartItem): void {
  const qtyEl   = document.getElementById(`qty-val-${idx}`);
  const totalEl = document.getElementById(`row-total-${idx}`);
  if (qtyEl)   qtyEl.textContent   = String(item.quantity);
  if (totalEl) totalEl.textContent = `$${(item.product.price * item.quantity).toFixed(2)}`;
}

// ═══════════════════════════════════════════════════════════
// TOTALS
// ═══════════════════════════════════════════════════════════
function updateTotals(items: CartItem[]): void {
  const subTotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity, 0
  );

  const discountApplied = subTotal > DISCOUNT_THRESHOLD;
  const discountAmount  = discountApplied ? subTotal * DISCOUNT_RATE : 0;
  const grandTotal      = subTotal - discountAmount + SHIPPING_COST;

  // Sub total
  const subEl = document.getElementById('cart-subtotal');
  if (subEl) subEl.textContent = `$${subTotal.toFixed(2)}`;

  // Discount row
  const discountRow  = document.getElementById('cart-discount-row')     as HTMLElement;
  const discountDiv  = document.getElementById('cart-discount-divider') as HTMLElement;
  const discountVal  = document.getElementById('cart-discount');

  if (discountRow && discountDiv) {
    discountRow.hidden = !discountApplied;
    discountDiv.hidden = !discountApplied;
  }
  if (discountVal && discountApplied) {
    discountVal.textContent = `−$${discountAmount.toFixed(2)}`;
  }

  // Grand total
  const totalEl = document.getElementById('cart-total');
  if (totalEl) totalEl.textContent = `$${grandTotal.toFixed(2)}`;
}

// ═══════════════════════════════════════════════════════════
// ACTION BUTTONS
// ═══════════════════════════════════════════════════════════
function initButtons(): void {

  // Continue shopping
  document.getElementById('cart-continue')?.addEventListener('click', () => {
    window.location.href = '/src/html/catalog.html';
  });

  // Clear cart
  document.getElementById('cart-clear')?.addEventListener('click', () => {
    saveCart([]);
    updateCartBadges(0);

    const body       = document.getElementById('cart-table-body') as HTMLElement;
    const emptyEl    = document.getElementById('cart-empty')      as HTMLElement;
    const bottomEl   = document.getElementById('cart-bottom')     as HTMLElement;
    const thankyouEl = document.getElementById('cart-thankyou')   as HTMLElement;

    body.innerHTML     = '';
    thankyouEl.hidden  = true;
    emptyEl.hidden     = false;
    bottomEl.hidden    = true;
  });

  // Checkout
  document.getElementById('cart-checkout')?.addEventListener('click', () => {
    saveCart([]);
    updateCartBadges(0);

    const body       = document.getElementById('cart-table-body') as HTMLElement;
    const emptyEl    = document.getElementById('cart-empty')      as HTMLElement;
    const bottomEl   = document.getElementById('cart-bottom')     as HTMLElement;
    const thankyouEl = document.getElementById('cart-thankyou')   as HTMLElement;

    body.innerHTML    = '';
    emptyEl.hidden    = true;
    bottomEl.hidden   = true;
    thankyouEl.hidden = false;
  });
}