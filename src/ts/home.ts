// ------------- Home page ---------------

document.addEventListener('DOMContentLoaded', () => {
  initDiscountBtn();
  initTravelSlider();
});

// -------------- Discount button ------------
function initDiscountBtn(): void {
  const btn = document.querySelector<HTMLButtonElement>(
    '.promo-card--discount .btn'
  );
  btn?.addEventListener('click', () => {
    window.location.href = '/src/html/catalog.html';
  });
}

// ---------------Travel suitcases slider -------------
function initTravelSlider(): void {
    const sliderEl = document.querySelector<HTMLElement>('[data-slider="travel"]');
    if (!sliderEl) return;
    
    const track   = sliderEl.querySelector<HTMLElement>('.slider__track');
    const prevBtn = sliderEl.querySelector<HTMLButtonElement>('.slider__btn--prev');
    const nextBtn = sliderEl.querySelector<HTMLButtonElement>('.slider__btn--next');
    const wrapper = sliderEl.querySelector<HTMLElement>('.slider__track-wrapper');
    
    if (!track || !prevBtn || !nextBtn || !wrapper) return;

    // Live reference to slides (order changes as DOM is mutated)
    const getSlides = (): HTMLElement[] =>
        Array.from(track.querySelectorAll<HTMLElement>(':scope > .slider__slide'));

    //// Read computed CSS gap (stays in sync with responsive breakpoints)
    const getGap = (): number =>
    parseFloat(getComputedStyle(track).gap) || 39;

    // One step = slide width + gap
    const getStep = (): number => {
        const slides = getSlides();
        if (!slides.length) return 0;
        return slides[0].offsetWidth + getGap();
    };

    // Against overlapping clicks
    let isAnimating = false;

    // Enable / disable CSS transition on track
    const setTransition = (on: boolean): void => {
        track.style.transition = on
        ? 'transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)'
        : 'none';
    };

    // change before we switch the transition back on
    const reflow = (): void => { void track.offsetHeight; };

    // Next
    // Animate track left by one step, then move the first slide
    // to the end and reset the transform instantly.
    const slideNext = (): void => {
    if (isAnimating) return;
    isAnimating = true;
 
    const step = getStep();
 
    setTransition(true);
    track.style.transform = `translateX(-${step}px)`;
 
    track.addEventListener('transitionend', () => {
      const slides = getSlides();
      // Move first slide to end
      track.appendChild(slides[0]);
      // Reset position without animation
      setTransition(false);
      track.style.transform = 'translateX(0)';
      reflow();
      // Re-enable transition for next interaction
      setTransition(true);
      isAnimating = false;
    }, { once: true });
  };


  // Prev
  // Move last slide to the front, jump it into the off-screen
  // left position (no animation), then animate back to 0.
  const slidePrev = (): void => {
    if (isAnimating) return;
    isAnimating = true;
 
    const step   = getStep();
    const slides = getSlides();
 
    // 1. Move last slide to the front (DOM, no animation yet)
    track.prepend(slides[slides.length - 1]);
 
    // 2. Instantly position track so the prepended card is off-screen left
    setTransition(false);
    track.style.transform = `translateX(-${step}px)`;
    reflow();
 
    // 3. Animate back to 0 — the prepended card slides in from the left
    setTransition(true);
    track.style.transform = 'translateX(0)';
 
    track.addEventListener('transitionend', () => {
      isAnimating = false;
    }, { once: true });
  };
  
  prevBtn.addEventListener('click', slidePrev);
  nextBtn.addEventListener('click', slideNext);

  // Swipe
  let touchStartX = 0;

  wrapper.addEventListener('touchstart', (e: TouchEvent) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
 
  wrapper.addEventListener('touchend', (e: TouchEvent) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) < 40) return;
    diff > 0 ? slideNext() : slidePrev();
  }, { passive: true });

  // Initial state
  setTransition(true);
  track.style.transform = 'translateX(0)';
}


