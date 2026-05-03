// ═══════════════════════════════════════════════════════════
// LOGIN MODAL
// Listens for the 'openLoginModal' custom event dispatched
// by main.ts when the account icon is clicked.
// ═══════════════════════════════════════════════════════════
// ── Email RegEx (RFC-compliant practical pattern)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// ── DOM references (set once after modal is created)
let backdrop = null;
let emailInput = null;
let passInput = null;
let emailError = null;
let passError = null;
let eyeBtn = null;
let formMsg = null;
// ═══════════════════════════════════════════════════════════
// PUBLIC INIT  –  called from main.ts after partials load
// ═══════════════════════════════════════════════════════════
export function initLoginModal() {
    createModal();
    bindEvents();
}
// ═══════════════════════════════════════════════════════════
// CREATE MODAL HTML  –  appended once to <body>
// ═══════════════════════════════════════════════════════════
function createModal() {
    // Guard against duplicate creation
    if (document.getElementById('login-modal-backdrop'))
        return;
    const div = document.createElement('div');
    div.innerHTML = `
    <div
      class="modal-backdrop"
      id="login-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
      hidden
    >
      <div class="login-modal" id="login-modal">

        <!-- Close button -->
        <button
          class="login-modal__close"
          id="login-modal-close"
          type="button"
          aria-label="Close log in window"
        >&#x2715;</button>

        <!-- Form -->
        <form class="login-form" id="login-form" novalidate>

          <!-- Email -->
          <label class="login-form__label" for="login-email">
            Email address
            <span class="login-form__label-required" aria-hidden="true">*</span>
          </label>
          <div class="login-form__input-wrap">
            <input
              class="login-form__input"
              id="login-email"
              type="email"
              name="email"
              autocomplete="email"
              placeholder=""
              aria-required="true"
              aria-describedby="login-email-error"
            />
          </div>
          <p class="login-form__error" id="login-email-error" role="alert" aria-live="polite"></p>

          <!-- Password -->
          <label class="login-form__label" for="login-password">
            Password
            <span class="login-form__label-required" aria-hidden="true">*</span>
          </label>
          <div class="login-form__input-wrap">
            <input
              class="login-form__input login-form__input--password"
              id="login-password"
              type="password"
              name="password"
              autocomplete="current-password"
              placeholder=""
              aria-required="true"
              aria-describedby="login-password-error"
            />
            <!-- Eye icon toggle -->
            <button
              class="login-form__eye-btn"
              id="login-eye-btn"
              type="button"
              aria-label="Show password"
              aria-pressed="false"
            >
              <!-- Eye open SVG -->
              <svg id="eye-open" viewBox="0 0 18 14" aria-hidden="true">
                <path d="M1 7S3.909 1 9 1s8 6 8 6-2.909 6-8 6S1 7 1 7z"/>
                <circle cx="9" cy="7" r="2.5"/>
              </svg>
              <!-- Eye closed SVG (shown when password is visible) -->
              <svg id="eye-closed" viewBox="0 0 18 14" aria-hidden="true" style="display:none">
                <path d="M1 1l16 12"/>
                <path d="M6.5 3.2A7.4 7.4 0 0 1 9 3c5.1 0 8 4 8 4s-.8 1.4-2.3 2.7"/>
                <path d="M11.3 10.6A7.3 7.3 0 0 1 9 11c-5.1 0-8-4-8-4s.8-1.4 2.3-2.7"/>
              </svg>
            </button>
          </div>
          <p class="login-form__error" id="login-password-error" role="alert" aria-live="polite"></p>

          <!-- Remember me + Forgot password -->
          <div class="login-form__meta">
            <label class="login-form__remember">
              <input
                class="login-form__checkbox"
                id="login-remember"
                type="checkbox"
                name="remember"
              />
              <span class="login-form__remember-label">Remember me</span>
            </label>
            <button class="login-form__forgot" type="button">
              Forgot Your Password?
            </button>
          </div>

          <!-- Submit -->
          <button class="login-form__submit" type="submit">
            LOG IN
          </button>

          <!-- General message -->
          <p class="login-form__message" id="login-form-msg" role="alert" aria-live="polite"></p>

        </form>
      </div>
    </div>
  `;
    document.body.appendChild(div.firstElementChild);
    // Cache references
    backdrop = document.getElementById('login-modal-backdrop');
    emailInput = document.getElementById('login-email');
    passInput = document.getElementById('login-password');
    emailError = document.getElementById('login-email-error');
    passError = document.getElementById('login-password-error');
    eyeBtn = document.getElementById('login-eye-btn');
    formMsg = document.getElementById('login-form-msg');
}
// ═══════════════════════════════════════════════════════════
// BIND EVENTS
// ═══════════════════════════════════════════════════════════
function bindEvents() {
    var _a, _b;
    // ── Open modal via custom event from main.ts
    document.addEventListener('openLoginModal', openModal);
    // ── Close on backdrop click (outside modal box)
    backdrop === null || backdrop === void 0 ? void 0 : backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop)
            closeModal();
    });
    // ── Close button
    (_a = document.getElementById('login-modal-close')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', closeModal);
    // ── Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && backdrop && !backdrop.hidden)
            closeModal();
    });
    // ── Eye toggle
    eyeBtn === null || eyeBtn === void 0 ? void 0 : eyeBtn.addEventListener('click', togglePasswordVisibility);
    // ── Real-time email validation (on blur)
    emailInput === null || emailInput === void 0 ? void 0 : emailInput.addEventListener('blur', () => validateEmail(true));
    emailInput === null || emailInput === void 0 ? void 0 : emailInput.addEventListener('input', () => {
        if (emailError === null || emailError === void 0 ? void 0 : emailError.textContent)
            validateEmail(false);
    });
    // ── Real-time password validation (on blur)
    passInput === null || passInput === void 0 ? void 0 : passInput.addEventListener('blur', () => validatePassword(true));
    passInput === null || passInput === void 0 ? void 0 : passInput.addEventListener('input', () => {
        if (passError === null || passError === void 0 ? void 0 : passError.textContent)
            validatePassword(false);
    });
    // ── Form submit
    (_b = document.getElementById('login-form')) === null || _b === void 0 ? void 0 : _b.addEventListener('submit', handleSubmit);
}
// ═══════════════════════════════════════════════════════════
// OPEN / CLOSE
// ═══════════════════════════════════════════════════════════
function openModal() {
    if (!backdrop)
        return;
    backdrop.hidden = false;
    backdrop.classList.add('is-visible');
    document.body.style.overflow = 'hidden';
    // Focus email input after animation
    setTimeout(() => emailInput === null || emailInput === void 0 ? void 0 : emailInput.focus(), 80);
}
function closeModal() {
    if (!backdrop)
        return;
    backdrop.hidden = true;
    backdrop.classList.remove('is-visible');
    document.body.style.overflow = '';
    // Clear form
    resetForm();
}
function resetForm() {
    const form = document.getElementById('login-form');
    form === null || form === void 0 ? void 0 : form.reset();
    clearError(emailError);
    clearError(passError);
    if (formMsg) {
        formMsg.textContent = '';
        formMsg.className = 'login-form__message';
    }
    // Reset eye toggle back to hidden
    if (passInput)
        passInput.type = 'password';
    if (eyeBtn) {
        eyeBtn.setAttribute('aria-pressed', 'false');
        eyeBtn.setAttribute('aria-label', 'Show password');
        document.getElementById('eye-open').style.display = '';
        document.getElementById('eye-closed').style.display = 'none';
    }
}
// ═══════════════════════════════════════════════════════════
// EYE TOGGLE  –  show / hide password
// ═══════════════════════════════════════════════════════════
function togglePasswordVisibility() {
    if (!passInput || !eyeBtn)
        return;
    const isVisible = passInput.type === 'text';
    passInput.type = isVisible ? 'password' : 'text';
    eyeBtn.setAttribute('aria-pressed', String(!isVisible));
    eyeBtn.setAttribute('aria-label', isVisible ? 'Show password' : 'Hide password');
    const openIcon = document.getElementById('eye-open');
    const closedIcon = document.getElementById('eye-closed');
    if (openIcon && closedIcon) {
        openIcon.style.display = isVisible ? '' : 'none';
        closedIcon.style.display = isVisible ? 'none' : '';
    }
}
// ═══════════════════════════════════════════════════════════
// VALIDATION
// ═══════════════════════════════════════════════════════════
function validateEmail(showError) {
    var _a;
    const value = (_a = emailInput === null || emailInput === void 0 ? void 0 : emailInput.value.trim()) !== null && _a !== void 0 ? _a : '';
    if (!value) {
        if (showError)
            setError(emailInput, emailError, 'Email address is required.');
        return false;
    }
    if (!EMAIL_REGEX.test(value)) {
        if (showError)
            setError(emailInput, emailError, 'Please enter a valid email address.');
        return false;
    }
    clearError(emailError);
    emailInput === null || emailInput === void 0 ? void 0 : emailInput.classList.remove('is-error');
    return true;
}
function validatePassword(showError) {
    var _a;
    const value = (_a = passInput === null || passInput === void 0 ? void 0 : passInput.value) !== null && _a !== void 0 ? _a : '';
    if (!value) {
        if (showError)
            setError(passInput, passError, 'Password is required.');
        return false;
    }
    clearError(passError);
    passInput === null || passInput === void 0 ? void 0 : passInput.classList.remove('is-error');
    return true;
}
function setError(input, errorEl, msg) {
    if (errorEl)
        errorEl.textContent = msg;
    input === null || input === void 0 ? void 0 : input.classList.add('is-error');
}
function clearError(errorEl) {
    if (errorEl)
        errorEl.textContent = '';
}
// ═══════════════════════════════════════════════════════════
// SUBMIT
// ═══════════════════════════════════════════════════════════
function handleSubmit(e) {
    e.preventDefault();
    const emailOk = validateEmail(true);
    const passOk = validatePassword(true);
    if (!emailOk || !passOk)
        return;
    // ── Simulate successful login (replace with real auth if needed)
    if (formMsg) {
        formMsg.textContent = 'Logged in successfully!';
        formMsg.className = 'login-form__message login-form__message--success';
    }
    // Close modal after short delay so user sees the success message
    setTimeout(() => closeModal(), 900);
}
