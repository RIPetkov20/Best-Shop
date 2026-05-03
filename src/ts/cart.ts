// ═══════════════════════════════════════════════════════════
// CART  –  shared utility used by home.ts and catalog.ts
// ═══════════════════════════════════════════════════════════

export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  color: string;
  size: string;
  salesStatus: boolean;
  rating: number;
  popularity: number;
  blocks: string[];
}

export function getCart(): Product[] {
  const s = localStorage.getItem('cart');
  return s ? (JSON.parse(s) as Product[]) : [];
}

export function saveCart(cart: Product[]): void {
  localStorage.setItem('cart', JSON.stringify(cart));
  window.dispatchEvent(new Event('storage'));
}

export function addToCart(product: Product): void {
  const cart = getCart();
  cart.push(product);
  saveCart(cart);
  updateCartBadges(cart.length);
}

export function updateCartBadges(count: number): void {
  document.querySelectorAll<HTMLElement>('.cart-count').forEach(b => {
    b.textContent = String(count);
    b.dataset['count'] = String(count);
  });
}