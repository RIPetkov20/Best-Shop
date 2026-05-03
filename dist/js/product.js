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
// ── State
let currentProduct = null;
let quantity = 1;
let selectedRating = 0;
// ═══════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    void loadProduct();
    updateCartBadges(getCart().length);
});
// ═══════════════════════════════════════════════════════════
// LOAD & RENDER PRODUCT
// ═══════════════════════════════════════════════════════════
function loadProduct() {
    return __awaiter(this, void 0, void 0, function* () {
        const id = getProductIdFromURL();
        if (!id) {
            showErrorState('No product ID provided.');
            return;
        }
        try {
            const res = yield fetch('../assets/data.json');
            if (!res.ok)
                throw new Error(`HTTP ${res.status}`);
            const json = (yield res.json());
            const product = json.data.find(p => p.id === id);
            if (!product) {
                showErrorState(`Product with ID "${id}" not found.`);
                return;
            }
            currentProduct = product;
            renderProductInfo(product);
            renderGallery(product);
            renderSelectors(product);
            renderAlsoLike(json.data, product.id);
            initQuantitySelector();
            initAddToCart();
            initTabs();
            initReviewForm();
            initStarRating();
            initReviewsTab(product);
        }
        catch (err) {
            console.error('product.ts: failed to load product', err);
            showErrorState('Could not load product data.');
        }
    });
}
// ── Read ?id= from URL
function getProductIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}
// ── Render name / stars / price / descriptions
function renderProductInfo(product) {
    var _a, _b;
    document.title = `${product.name} – Best Shop`;
    const name = document.getElementById('product-name');
    if (name)
        name.textContent = product.name;
    const price = document.getElementById('product-price');
    if (price)
        price.textContent = `$${product.price}`;
    // Stars (rating out of 5)
    const starsEl = document.getElementById('product-stars');
    if (starsEl) {
        starsEl.innerHTML = buildStars(product.rating);
        starsEl.setAttribute('aria-label', `${product.rating} out of 5 stars`);
    }
    // Review count – use static placeholder since JSON may not include it
    const reviewCount = document.getElementById('product-review-count');
    if (reviewCount)
        reviewCount.textContent = '(1 Clients Review)';
    // Descriptions – use product fields if available, else Figma placeholder text
    const desc1Text = (_a = product.description1) !== null && _a !== void 0 ? _a : 'The new product is a bold reimagining of travel essentials, designed to elevate every journey. Made with at least 30% recycled materials, its lightweight yet impact-resistant shell combines eco-conscious innovation with rugged durability.';
    const desc2Text = (_b = product.description2) !== null && _b !== void 0 ? _b : 'The ergonomic handle and spinner wheels ensure effortless mobility while making a statement in sleek design. Inside, the modular compartments and adjustable straps keep your belongings secure and neatly organized, no matter the destination.';
    const desc1 = document.getElementById('product-desc1');
    const desc2 = document.getElementById('product-desc2');
    if (desc1)
        desc1.textContent = desc1Text;
    if (desc2)
        desc2.textContent = desc2Text;
    // Update reviews title
    const reviewTitle = document.getElementById('reviews-count-title');
    if (reviewTitle)
        reviewTitle.textContent = `1 new review for ${product.name}`;
}
// ── Build filled/empty star HTML
function buildStars(rating) {
    const rounded = Math.round(rating);
    return Array.from({ length: 5 }, (_, i) => `<span class="product-star${i < rounded ? ' product-star--filled' : ''}">★</span>`).join('');
}
// ═══════════════════════════════════════════════════════════
// GALLERY  –  main image + 4 thumbnails
// ═══════════════════════════════════════════════════════════
function renderGallery(product) {
    var _a;
    const mainImg = document.getElementById('product-main-img');
    const thumbsContainer = document.getElementById('product-thumbs');
    if (!mainImg || !thumbsContainer)
        return;
    // Resolve image path – products may be in catalog or homepage subfolders
    const resolveImg = (url) => {
        if (url.startsWith('http') || url.startsWith('/'))
            return url;
        // Try catalog folder first, fall back to homepage folder
        return `../assets/images/catalog/${url}`;
    };
    // Build a thumbnail array – use product.images if available,
    // otherwise repeat the main image for 4 thumbs (Figma shows 4 thumbnails)
    const images = ((_a = product.images) === null || _a === void 0 ? void 0 : _a.length)
        ? product.images
        : [product.imageUrl, product.imageUrl, product.imageUrl, product.imageUrl];
    const primarySrc = resolveImg(images[0]);
    mainImg.src = primarySrc;
    mainImg.alt = product.name;
    // Fallback for broken images
    mainImg.onerror = () => {
        mainImg.src = `../assets/images/homepage/${product.imageUrl}`;
    };
    // Render thumbnails
    thumbsContainer.innerHTML = images.slice(0, 4).map((url, idx) => {
        const src = resolveImg(url);
        const isActive = idx === 0 ? ' product-gallery__thumb--active' : '';
        return `
      <button
        class="product-gallery__thumb${isActive}"
        data-src="${src}"
        data-idx="${idx}"
        role="listitem"
        aria-label="View image ${idx + 1} of ${Math.min(images.length, 4)}"
        aria-pressed="${idx === 0}"
        type="button"
      >
        <img
          src="${src}"
          alt="${product.name} – view ${idx + 1}"
          loading="lazy"
          onerror="this.closest('button').style.opacity='0.4'"
        />
      </button>
    `;
    }).join('');
    // Thumbnail click → update main image
    thumbsContainer.querySelectorAll('.product-gallery__thumb').forEach(btn => {
        btn.addEventListener('click', () => {
            const src = btn.dataset['src'];
            if (!src)
                return;
            mainImg.src = src;
            // Update active state
            thumbsContainer.querySelectorAll('.product-gallery__thumb').forEach(b => {
                b.classList.remove('product-gallery__thumb--active');
                b.setAttribute('aria-pressed', 'false');
            });
            btn.classList.add('product-gallery__thumb--active');
            btn.setAttribute('aria-pressed', 'true');
        });
    });
}
// ═══════════════════════════════════════════════════════════
// SELECTORS  –  pre-select size, color, category from product
// ═══════════════════════════════════════════════════════════
function renderSelectors(product) {
    const sizeSelect = document.getElementById('sel-size');
    const colorSelect = document.getElementById('sel-color');
    const categorySelect = document.getElementById('sel-category');
    if (sizeSelect && product.size)
        sizeSelect.value = product.size;
    if (colorSelect && product.color)
        colorSelect.value = product.color;
    if (categorySelect && product.category)
        categorySelect.value = product.category;
}
// ═══════════════════════════════════════════════════════════
// QUANTITY SELECTOR  –  min = 1
// ═══════════════════════════════════════════════════════════
function initQuantitySelector() {
    const minusBtn = document.getElementById('qty-minus');
    const plusBtn = document.getElementById('qty-plus');
    const valueSpan = document.getElementById('qty-value');
    if (!minusBtn || !plusBtn || !valueSpan)
        return;
    const updateDisplay = () => {
        valueSpan.textContent = String(quantity);
        minusBtn.disabled = quantity <= 1;
        minusBtn.setAttribute('aria-disabled', String(quantity <= 1));
    };
    updateDisplay();
    minusBtn.addEventListener('click', () => {
        if (quantity > 1) {
            quantity--;
            updateDisplay();
        }
    });
    plusBtn.addEventListener('click', () => {
        quantity++;
        updateDisplay();
    });
}
// ═══════════════════════════════════════════════════════════
// ADD TO CART
// ═══════════════════════════════════════════════════════════
function initAddToCart() {
    const btn = document.getElementById('add-to-cart-btn');
    if (!btn)
        return;
    btn.addEventListener('click', () => {
        if (!currentProduct)
            return;
        // Add one entry per unit of quantity
        for (let i = 0; i < quantity; i++) {
            addToCart(currentProduct);
        }
        // Visual feedback
        const original = btn.textContent;
        btn.textContent = '✓ Added!';
        btn.style.background = '#28a745';
        setTimeout(() => {
            btn.textContent = original;
            btn.style.background = '';
        }, 1500);
    });
}
// ═══════════════════════════════════════════════════════════
// TABS  –  Details | Reviews | Shipping Policy
// ═══════════════════════════════════════════════════════════
function initTabs() {
    const tabBtns = document.querySelectorAll('.product-tabs__tab');
    const tabPanels = document.querySelectorAll('.product-tabs__panel');
    if (!tabBtns.length || !tabPanels.length)
        return;
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset['tab'];
            // Deactivate all
            tabBtns.forEach(b => {
                b.classList.remove('product-tabs__tab--active');
                b.setAttribute('aria-selected', 'false');
            });
            tabPanels.forEach(p => {
                p.classList.add('product-tabs__panel--hidden');
                p.hidden = true;
            });
            // Activate selected
            btn.classList.add('product-tabs__tab--active');
            btn.setAttribute('aria-selected', 'true');
            const panel = document.getElementById(`tab-${target}`);
            if (panel) {
                panel.classList.remove('product-tabs__panel--hidden');
                panel.hidden = false;
            }
        });
        // Keyboard navigation (arrow keys)
        btn.addEventListener('keydown', (e) => {
            const btnsArr = Array.from(tabBtns);
            const idx = btnsArr.indexOf(btn);
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                const next = btnsArr[(idx + 1) % btnsArr.length];
                next.focus();
                next.click();
            }
            else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                const prev = btnsArr[(idx - 1 + btnsArr.length) % btnsArr.length];
                prev.focus();
                prev.click();
            }
        });
    });
    // Show first tab panel by default (remove hidden)
    const firstPanel = tabPanels[0];
    if (firstPanel) {
        firstPanel.classList.remove('product-tabs__panel--hidden');
        firstPanel.hidden = false;
    }
}
// ═══════════════════════════════════════════════════════════
// STAR RATING (review form)
// ═══════════════════════════════════════════════════════════
function initStarRating() {
    const container = document.getElementById('rate-stars');
    if (!container)
        return;
    const stars = Array.from(container.querySelectorAll('.rate-star'));
    const highlight = (value) => {
        stars.forEach((s, i) => {
            s.style.color = i < value
                ? 'rgba(245, 180, 35, 1)'
                : 'rgba(233, 233, 237, 1)';
        });
    };
    stars.forEach((star, idx) => {
        // Hover
        star.addEventListener('mouseenter', () => highlight(idx + 1));
        star.addEventListener('mouseleave', () => highlight(selectedRating));
        // Click
        star.addEventListener('click', () => {
            selectedRating = idx + 1;
            highlight(selectedRating);
            star.setAttribute('aria-pressed', 'true');
            container.setAttribute('aria-label', `Rated ${selectedRating} out of 5`);
        });
    });
    // Start with empty stars
    highlight(0);
}
// ═══════════════════════════════════════════════════════════
// REVIEW FORM  –  validation + submit
// ═══════════════════════════════════════════════════════════
function initReviewForm() {
    const form = document.getElementById('review-form');
    const msgEl = document.getElementById('review-msg');
    if (!form || !msgEl)
        return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const reviewText = document.getElementById('review-text').value.trim();
        const reviewName = document.getElementById('review-name').value.trim();
        const reviewEmail = document.getElementById('review-email').value.trim();
        // Validation
        if (!reviewText) {
            showFormMsg(msgEl, 'Please write your review.', 'error');
            return;
        }
        if (!reviewName) {
            showFormMsg(msgEl, 'Please enter your name.', 'error');
            return;
        }
        if (!reviewEmail || !emailRegex.test(reviewEmail)) {
            showFormMsg(msgEl, 'Please enter a valid email address.', 'error');
            return;
        }
        if (selectedRating === 0) {
            showFormMsg(msgEl, 'Please rate the product.', 'error');
            return;
        }
        // Success
        showFormMsg(msgEl, 'Thank you! Your review has been submitted.', 'success');
        form.reset();
        selectedRating = 0;
        // Reset star display
        const container = document.getElementById('rate-stars');
        if (container) {
            container.querySelectorAll('.rate-star').forEach(s => {
                s.style.color = 'rgba(233, 233, 237, 1)';
            });
        }
    });
}
function showFormMsg(el, text, type) {
    el.textContent = text;
    el.className = `review-form__message review-form__message--${type}`;
    // Auto-clear after 5 s
    setTimeout(() => {
        el.textContent = '';
        el.className = 'review-form__message';
    }, 5000);
}
// ═══════════════════════════════════════════════════════════
// REVIEWS TAB  –  update count title with real product name
// ═══════════════════════════════════════════════════════════
function initReviewsTab(product) {
    const title = document.getElementById('reviews-count-title');
    if (title)
        title.textContent = `1 new review for ${product.name}`;
}
// ═══════════════════════════════════════════════════════════
// YOU MAY ALSO LIKE  –  4 random products (excluding current)
// ═══════════════════════════════════════════════════════════
function renderAlsoLike(allProducts, currentId) {
    const grid = document.getElementById('also-like-grid');
    if (!grid)
        return;
    // Filter out current product, shuffle, take 4
    const pool = allProducts.filter(p => p.id !== currentId);
    const picked = shuffle(pool).slice(0, 4);
    if (picked.length === 0) {
        grid.innerHTML = '<p style="text-align:center;padding:20px;color:#888;">No related products found.</p>';
        return;
    }
    grid.innerHTML = picked.map(p => buildAlsoLikeCard(p)).join('');
    // Add to cart on button click
    grid.querySelectorAll('.also-like-card__btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            var _a;
            e.stopPropagation();
            const id = (_a = btn.closest('[data-product-id]')) === null || _a === void 0 ? void 0 : _a.dataset['productId'];
            const product = picked.find(p => p.id === id);
            if (product) {
                addToCart(product);
                // Quick feedback
                const orig = btn.textContent;
                btn.textContent = '✓ Added';
                setTimeout(() => { btn.textContent = orig; }, 1200);
            }
        });
    });
    // Card click → navigate to that product page
    grid.querySelectorAll('.also-like-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = card.dataset['productId'];
            if (id)
                window.location.href = `/src/html/product-details.html?id=${id}`;
        });
    });
}
function buildAlsoLikeCard(product) {
    const badge = product.salesStatus
        ? `<div class="also-like-card__badge" aria-label="Sale">SALE</div>`
        : '';
    // Resolve image – try catalog, fallback to homepage
    const imgSrc = `../assets/images/catalog/${product.imageUrl}`;
    const imgFallback = `../assets/images/homepage/${product.imageUrl}`;
    return `
    <article
      class="also-like-card"
      data-product-id="${product.id}"
      aria-label="${product.name}"
      tabindex="0"
      role="button"
    >
      <div class="also-like-card__img-wrap">
        ${badge}
        <img
          class="also-like-card__img"
          src="${imgSrc}"
          alt="${product.name}"
          loading="lazy"
          onerror="this.src='${imgFallback}'"
        />
      </div>
      <div class="also-like-card__body">
        <h3 class="also-like-card__name">${product.name}</h3>
        <p class="also-like-card__price">$${product.price}</p>
        <button class="also-like-card__btn" type="button" aria-label="Add ${product.name} to cart">
          Add To Cart
        </button>
      </div>
    </article>
  `;
}
// ═══════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════
// Fisher-Yates shuffle
function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}
function showErrorState(msg) {
    const main = document.getElementById('main-content');
    if (main) {
        main.innerHTML = `
      <div style="text-align:center;padding:80px 20px;font-family:Montserrat,sans-serif;">
        <p style="font-size:18px;color:#888;">${msg}</p>
        <a href="/src/html/catalog.html"
           style="display:inline-block;margin-top:20px;padding:12px 32px;
                  background:rgba(185,39,112,1);color:#fff;text-decoration:none;
                  font-weight:700;font-family:Montserrat,sans-serif;">
          Back to Catalog
        </a>
      </div>
    `;
    }
}
