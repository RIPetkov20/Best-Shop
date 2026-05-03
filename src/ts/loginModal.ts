// ═══════════════════════════════════════════════════════════
// LOGIN MODAL
// Listens for the 'openLoginModal' custom event dispatched
// by main.ts when the account icon is clicked.
// ═══════════════════════════════════════════════════════════

// ── Email RegEx (RFC-compliant practical pattern)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ── DOM references (set once after modal is created)
let backdrop:    HTMLElement | null = null;
let emailInput:  HTMLInputElement | null = null;
let passInput:   HTMLInputElement | null = null;
let emailError:  HTMLElement | null = null;
let passError:   HTMLElement | null = null;
let eyeBtn:      HTMLButtonElement | null = null;
let formMsg:     HTMLElement | null = null;

// ═══════════════════════════════════════════════════════════
// PUBLIC INIT  –  called from main.ts after partials load
// ═══════════════════════════════════════════════════════════
export function initLoginModal(): void {
  createModal();
  bindEvents();
}

// ═══════════════════════════════════════════════════════════
// CREATE MODAL HTML  –  appended once to <body>
// ═══════════════════════════════════════════════════════════
function createModal(): void {
  // Guard against duplicate creation
  if (document.getElementById('login-modal-backdrop')) return;

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

  document.body.appendChild(div.firstElementChild as Node);

  // Cache references
  backdrop   = document.getElementById('login-modal-backdrop');
  emailInput = document.getElementById('login-email')    as HTMLInputElement;
  passInput  = document.getElementById('login-password') as HTMLInputElement;
  emailError = document.getElementById('login-email-error');
  passError  = document.getElementById('login-password-error');
  eyeBtn     = document.getElementById('login-eye-btn')  as HTMLButtonElement;
  formMsg    = document.getElementById('login-form-msg');
}

// ═══════════════════════════════════════════════════════════
// BIND EVENTS
// ═══════════════════════════════════════════════════════════
function bindEvents(): void {

  // ── Open modal via custom event from main.ts
  document.addEventListener('openLoginModal', openModal);

  // ── Close on backdrop click (outside modal box)
  backdrop?.addEventListener('click', (e: MouseEvent) => {
    if (e.target === backdrop) closeModal();
  });

  // ── Close button
  document.getElementById('login-modal-close')?.addEventListener('click', closeModal);

  // ── Escape key
  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape' && backdrop && !backdrop.hidden) closeModal();
  });

  // ── Eye toggle
  eyeBtn?.addEventListener('click', togglePasswordVisibility);

  // ── Real-time email validation (on blur)
  emailInput?.addEventListener('blur', () => validateEmail(true));
  emailInput?.addEventListener('input', () => {
    if (emailError?.textContent) validateEmail(false);
  });

  // ── Real-time password validation (on blur)
  passInput?.addEventListener('blur', () => validatePassword(true));
  passInput?.addEventListener('input', () => {
    if (passError?.textContent) validatePassword(false);
  });

  // ── Form submit
  document.getElementById('login-form')?.addEventListener('submit', handleSubmit);
}

// ═══════════════════════════════════════════════════════════
// OPEN / CLOSE
// ═══════════════════════════════════════════════════════════
function openModal(): void {
  if (!backdrop) return;

  backdrop.hidden = false;
  backdrop.classList.add('is-visible');
  document.body.style.overflow = 'hidden';

  // Focus email input after animation
  setTimeout(() => emailInput?.focus(), 80);
}

function closeModal(): void {
  if (!backdrop) return;

  backdrop.hidden = true;
  backdrop.classList.remove('is-visible');
  document.body.style.overflow = '';

  // Clear form
  resetForm();
}

function resetForm(): void {
  const form = document.getElementById('login-form') as HTMLFormElement | null;
  form?.reset();
  clearError(emailError);
  clearError(passError);
  if (formMsg) { formMsg.textContent = ''; formMsg.className = 'login-form__message'; }

  // Reset eye toggle back to hidden
  if (passInput) passInput.type = 'password';
  if (eyeBtn) {
    eyeBtn.setAttribute('aria-pressed', 'false');
    eyeBtn.setAttribute('aria-label', 'Show password');
    document.getElementById('eye-open')!.style.display  = '';
    document.getElementById('eye-closed')!.style.display = 'none';
  }
}

// ═══════════════════════════════════════════════════════════
// EYE TOGGLE  –  show / hide password
// ═══════════════════════════════════════════════════════════
function togglePasswordVisibility(): void {
  if (!passInput || !eyeBtn) return;

  const isVisible = passInput.type === 'text';

  passInput.type = isVisible ? 'password' : 'text';
  eyeBtn.setAttribute('aria-pressed', String(!isVisible));
  eyeBtn.setAttribute('aria-label', isVisible ? 'Show password' : 'Hide password');

  const openIcon   = document.getElementById('eye-open');
  const closedIcon = document.getElementById('eye-closed');
  if (openIcon && closedIcon) {
    openIcon.style.display   = isVisible ? '' : 'none';
    closedIcon.style.display = isVisible ? 'none' : '';
  }
}

// ═══════════════════════════════════════════════════════════
// VALIDATION
// ═══════════════════════════════════════════════════════════
function validateEmail(showError: boolean): boolean {
  const value = emailInput?.value.trim() ?? '';

  if (!value) {
    if (showError) setError(emailInput, emailError, 'Email address is required.');
    return false;
  }
  if (!EMAIL_REGEX.test(value)) {
    if (showError) setError(emailInput, emailError, 'Please enter a valid email address.');
    return false;
  }

  clearError(emailError);
  emailInput?.classList.remove('is-error');
  return true;
}

function validatePassword(showError: boolean): boolean {
  const value = passInput?.value ?? '';

  if (!value) {
    if (showError) setError(passInput, passError, 'Password is required.');
    return false;
  }

  clearError(passError);
  passInput?.classList.remove('is-error');
  return true;
}

function setError(input: HTMLInputElement | null, errorEl: HTMLElement | null, msg: string): void {
  if (errorEl) errorEl.textContent = msg;
  input?.classList.add('is-error');
}

function clearError(errorEl: HTMLElement | null): void {
  if (errorEl) errorEl.textContent = '';
}

// ═══════════════════════════════════════════════════════════
// SUBMIT
// ═══════════════════════════════════════════════════════════
function handleSubmit(e: SubmitEvent): void {
  e.preventDefault();

  const emailOk = validateEmail(true);
  const passOk  = validatePassword(true);

  if (!emailOk || !passOk) return;

  // ── Simulate successful login (replace with real auth if needed)
  if (formMsg) {
    formMsg.textContent = 'Logged in successfully!';
    formMsg.className   = 'login-form__message login-form__message--success';
  }

  // Close modal after short delay so user sees the success message
  setTimeout(() => closeModal(), 900);
}