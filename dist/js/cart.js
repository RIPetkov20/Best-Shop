// ═══════════════════════════════════════════════════════════
// CART  –  shared utility used by home.ts and catalog.ts
// ═══════════════════════════════════════════════════════════
export function getCart() {
    const s = localStorage.getItem('cart');
    return s ? JSON.parse(s) : [];
}
export function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('storage'));
}
export function addToCart(product) {
    const cart = getCart();
    cart.push(product);
    saveCart(cart);
    updateCartBadges(cart.length);
}
export function updateCartBadges(count) {
    document.querySelectorAll('.cart-count').forEach(b => {
        b.textContent = String(count);
        b.dataset['count'] = String(count);
    });
}
