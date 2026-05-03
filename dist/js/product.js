// ═══════════════════════════════════════════════════════════
// PRODUCT DETAILS PAGE
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
import { getCart, addToCart, updateCartBadges } from './cart.js';
// ─── State ────────────────────────────────────────────────
let currentProduct = null;
let quantity = 1;
let selectedRating = 0;
// ═══════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    updateCartBadges(getCart().length);
    void init();
});
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const id = getProductIdFromUrl();
        try {
            const res = yield fetch('../assets/data.json');
            const json = (yield res.json());
            const all = json.data;
            const product = id ? all.find(p => p.id === id) : null;
            if (product) {
                currentProduct = product;
                renderProduct(product);
                renderAlsoLike(all, product.id);
            }
            else {
                // Fallback: show first product
                currentProduct = (_a = all[0]) !== null && _a !== void 0 ? _a : null;
                if (currentProduct) {
                    renderProduct(currentProduct);
                    renderAlsoLike(all, currentProduct.id);
                }
            }
            initQuantity();
            initAddToCart();
            initTabs();
            initReviewForm();
            initStarRating();
        }
        catch (err) {
            console.error('Product page: failed to load data', err);
        }
    });
}
// ─── Get ?id= from URL ────────────────────────────────────
function getProductIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}
// ═══════════════════════════════════════════════════════════
// RENDER PRODUCT
// ═══════════════════════════════════════════════════════════
function renderProduct(product) {
    const category = product.category.toLowerCase();
    const folder = category.includes('suitcases') ? 'homepage' : 'catalog';
    // Construct the path relative to the HTML location
    const imgSrc = `../assets/images/${folder}/${product.imageUrl}`;
    // Main image
    const mainImg = document.getElementById('product-main-img');
    if (mainImg) {
        mainImg.src = imgSrc;
        mainImg.alt = product.name;
    }
    // Thumbnails — reuse same image 4 times (no extra images in JSON)
    const thumbsEl = document.getElementById('product-thumbs');
    if (thumbsEl) {
        thumbsEl.innerHTML = [imgSrc, imgSrc, imgSrc, imgSrc].map((src, i) => `
      <img class="product-thumb${i === 0 ? ' is-active' : ''}"
           src="${src}" alt="${product.name} view ${i + 1}"
           loading="lazy" onerror="this.style.display='none'" />
    `).join('');
        // Thumb click → swap main image (same image in this case)
        thumbsEl.querySelectorAll('.product-thumb').forEach(thumb => {
            thumb.addEventListener('click', () => {
                thumbsEl.querySelectorAll('.product-thumb').forEach(t => t.classList.remove('is-active'));
                thumb.classList.add('is-active');
                if (mainImg)
                    mainImg.src = thumb.src;
            });
        });
    }
    // Title
    const titleEl = document.getElementById('product-title');
    if (titleEl)
        titleEl.textContent = product.name;
    // Stars
    const starsEl = document.getElementById('product-stars');
    if (starsEl)
        starsEl.innerHTML = buildStars(product.rating);
    // Review count
    const countEl = document.getElementById('product-review-count');
    if (countEl)
        countEl.textContent = '(1 Clients Review)';
    // Price
    const priceEl = document.getElementById('product-price');
    if (priceEl)
        priceEl.textContent = `$${product.price}`;
    // Set selects to product's values
    setSelectValue('select-size', product.size);
    setSelectValue('select-color', product.color);
    setSelectValue('select-category', product.category);
    // Reviews tab heading
    const reviewNameEl = document.getElementById('reviews-product-name');
    if (reviewNameEl)
        reviewNameEl.textContent = product.name;
    // Page title
    document.title = `${product.name} – Best Shop`;
}
function setSelectValue(id, value) {
    const el = document.getElementById(id);
    if (!el)
        return;
    const opt = Array.from(el.options).find(o => o.value.toLowerCase() === value.toLowerCase());
    if (opt)
        el.value = opt.value;
}
// ─── Build star SVGs ──────────────────────────────────────
function buildStars(rating) {
    const full = `<svg viewBox="0 0 12 12" fill="rgba(245,180,35,1)" xmlns="http://www.w3.org/2000/svg"><polygon points="6,1 7.5,4.5 11,5 8.5,7.5 9,11 6,9.5 3,11 3.5,7.5 1,5 4.5,4.5"/></svg>`;
    const empty = `<svg viewBox="0 0 12 12" fill="rgba(233,233,237,1)" xmlns="http://www.w3.org/2000/svg"><polygon points="6,1 7.5,4.5 11,5 8.5,7.5 9,11 6,9.5 3,11 3.5,7.5 1,5 4.5,4.5"/></svg>`;
    return Array.from({ length: 5 }, (_, i) => i < Math.round(rating) ? full : empty).join('');
}
// ═══════════════════════════════════════════════════════════
// QUANTITY SELECTOR
// ═══════════════════════════════════════════════════════════
function initQuantity() {
    const minusBtn = document.getElementById('qty-minus');
    const plusBtn = document.getElementById('qty-plus');
    const valueEl = document.getElementById('qty-value');
    const update = () => {
        if (valueEl)
            valueEl.textContent = String(quantity);
    };
    minusBtn === null || minusBtn === void 0 ? void 0 : minusBtn.addEventListener('click', () => {
        if (quantity > 1) {
            quantity--;
            update();
        }
    });
    plusBtn === null || plusBtn === void 0 ? void 0 : plusBtn.addEventListener('click', () => {
        quantity++;
        update();
    });
}
// ═══════════════════════════════════════════════════════════
// ADD TO CART
// ═══════════════════════════════════════════════════════════
function initAddToCart() {
    const btn = document.getElementById('add-to-cart-btn');
    btn === null || btn === void 0 ? void 0 : btn.addEventListener('click', () => {
        if (!currentProduct)
            return;
        // Add `quantity` copies
        for (let i = 0; i < quantity; i++) {
            addToCart(currentProduct);
        }
    });
}
// ═══════════════════════════════════════════════════════════
// TABS
// ═══════════════════════════════════════════════════════════
function initTabs() {
    const tabs = document.querySelectorAll('.product-tabs__tab');
    const panels = document.querySelectorAll('.product-tabs__panel');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset['tab'];
            // Update tabs
            tabs.forEach(t => {
                t.classList.toggle('is-active', t === tab);
                t.setAttribute('aria-selected', String(t === tab));
            });
            // Update panels
            panels.forEach(panel => {
                const isTarget = panel.id === `tab-${target}`;
                panel.classList.toggle('is-hidden', !isTarget);
            });
        });
    });
}
// ═══════════════════════════════════════════════════════════
// STAR RATING INPUT (interactive)
// ═══════════════════════════════════════════════════════════
function initStarRating() {
    const container = document.getElementById('rating-stars');
    if (!container)
        return;
    const starBtns = container.querySelectorAll('.review-star-btn');
    const highlightUpTo = (n) => {
        starBtns.forEach((btn, i) => {
            btn.classList.toggle('is-filled', i < n);
        });
    };
    starBtns.forEach((btn, idx) => {
        btn.addEventListener('mouseenter', () => highlightUpTo(idx + 1));
        btn.addEventListener('mouseleave', () => highlightUpTo(selectedRating));
        btn.addEventListener('click', () => {
            selectedRating = idx + 1;
            highlightUpTo(selectedRating);
        });
    });
}
// ═══════════════════════════════════════════════════════════
// REVIEW FORM  –  submit without reload
// ═══════════════════════════════════════════════════════════
function initReviewForm() {
    const form = document.getElementById('review-form');
    const msgEl = document.getElementById('review-message');
    form === null || form === void 0 ? void 0 : form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = document.getElementById('review-text').value.trim();
        const name = document.getElementById('review-name').value.trim();
        const email = document.getElementById('review-email').value.trim();
        // Basic validation
        if (!text || !name || !email) {
            showMessage(msgEl, 'Please fill in all required fields.', 'error');
            return;
        }
        if (!selectedRating) {
            showMessage(msgEl, 'Please select a star rating.', 'error');
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showMessage(msgEl, 'Please enter a valid email address.', 'error');
            return;
        }
        // Success — add review to the list
        addReviewToList(name, text, selectedRating);
        form.reset();
        selectedRating = 0;
        // Reset star visuals
        document.querySelectorAll('.review-star-btn').forEach(btn => btn.classList.remove('is-filled'));
        showMessage(msgEl, 'Thank you! Your review has been submitted.', 'success');
    });
}
function showMessage(el, text, type) {
    if (!el)
        return;
    el.textContent = text;
    el.className = `review-form__message review-form__message--${type}`;
    el.removeAttribute('hidden');
    // Auto-hide after 5 seconds
    setTimeout(() => {
        el.setAttribute('hidden', '');
    }, 5000);
}
function addReviewToList(name, text, rating) {
    var _a, _b;
    const list = document.getElementById('reviews-list');
    if (!list)
        return;
    const today = new Date().toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric'
    });
    const stars = Array.from({ length: 5 }, (_, i) => `<svg viewBox="0 0 12 12" fill="${i < rating ? 'rgba(245,180,35,1)' : 'rgba(233,233,237,1)'}" xmlns="http://www.w3.org/2000/svg"><polygon points="6,1 7.5,4.5 11,5 8.5,7.5 9,11 6,9.5 3,11 3.5,7.5 1,5 4.5,4.5"/></svg>`).join('');
    const item = document.createElement('div');
    item.className = 'review-item';
    item.innerHTML = `
    <div class="review-item__header">
      <div class="review-item__meta">
        <span class="review-item__name">${name}</span>
        <span class="review-item__date">/ ${today}</span>
      </div>
      <div class="review-item__stars">${stars}</div>
    </div>
    <p class="review-item__text">${text}</p>
  `;
    list.appendChild(item);
    // Update review count heading
    const count = list.querySelectorAll('.review-item').length;
    const heading = document.getElementById('reviews-heading');
    const productName = (_b = (_a = document.getElementById('reviews-product-name')) === null || _a === void 0 ? void 0 : _a.textContent) !== null && _b !== void 0 ? _b : 'this product';
    if (heading)
        heading.innerHTML = `${count} review${count > 1 ? 's' : ''} for <span id="reviews-product-name">${productName}</span>`;
}
// ═══════════════════════════════════════════════════════════
// YOU MAY ALSO LIKE  –  4 random products (excluding current)
// ═══════════════════════════════════════════════════════════
function renderAlsoLike(all, currentId) {
    const grid = document.getElementById('also-like-grid');
    if (!grid)
        return;
    const pool = all
        .filter(p => p.id !== currentId)
        .sort(() => Math.random() - 0.5)
        .slice(0, 4);
    grid.innerHTML = pool.map(p => buildAlsoLikeCard(p)).join('');
    grid.querySelectorAll('.product-card__btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            var _a;
            e.stopPropagation();
            const id = (_a = btn.closest('[data-product-id]')) === null || _a === void 0 ? void 0 : _a.dataset['productId'];
            const product = all.find(p => p.id === id);
            if (product)
                addToCart(product);
        });
    });
    grid.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = card.dataset['productId'];
            if (id)
                window.location.href = `/src/html/product-details.html?id=${id}`;
        });
    });
}
function buildAlsoLikeCard(product) {
    const badge = product.salesStatus
        ? `<div class="product-card__badge" aria-label="Sale"><span>SALE</span></div>` : '';
    const category = product.category.toLowerCase();
    const folder = category.includes('suitcases') ? 'homepage' : 'catalog';
    // Construct the path relative to the HTML location
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
        <button class="product-card__btn" type="button">Add To Cart</button>
      </div>
    </article>`;
}
