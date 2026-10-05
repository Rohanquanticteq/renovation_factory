(function () {
  if (customElements.get('rf-testimonials')) return;

  class RFTestimonials extends HTMLElement {
    connectedCallback() {
      if (this.initialized) return;
      this.initialized = true;

      this.slides = Array.from(this.querySelectorAll('[data-rf-testimonial]'));
      this.currentEl = this.querySelector('[data-rf-testimonials-current]');
      this.prevButton = this.querySelector('[data-rf-testimonials-prev]');
      this.nextButton = this.querySelector('[data-rf-testimonials-next]');
      this.viewport = this.querySelector('[data-rf-testimonials-viewport]');
      this.index = Math.max(0, this.slides.findIndex((slide) => slide.classList.contains('is-active')));
      this.startX = 0;
      this.dragX = 0;
      this.pointerId = null;
      this.didDrag = false;
      this.wheelAccumulator = 0;
      this.wheelLocked = false;
      this.wheelTimer = null;

      this.handlePrev = () => this.show(this.index - 1);
      this.handleNext = () => this.show(this.index + 1);
      this.handlePointerDown = (event) => {
        if (event.pointerType === 'mouse' && event.button !== 0) return;

        this.pointerId = event.pointerId;
        this.startX = event.clientX;
        this.dragX = 0;
        this.didDrag = false;

        this.viewport.classList.add('is-dragging');
        this.viewport.setPointerCapture?.(event.pointerId);
      };

      this.handlePointerMove = (event) => {
        if (this.pointerId !== event.pointerId) return;

        this.dragX = event.clientX - this.startX;

        if (Math.abs(this.dragX) > 5) {
          this.didDrag = true;
        }

        const limitedDrag = Math.max(-180, Math.min(180, this.dragX));
        this.track.style.transform = `translate3d(${limitedDrag}px, 0, 0)`;
      };

      this.handlePointerEnd = (event) => {
        if (this.pointerId !== event.pointerId) return;

        const distance = this.dragX;

        this.viewport.releasePointerCapture?.(event.pointerId);
        this.viewport.classList.remove('is-dragging');
        this.pointerId = null;
        this.dragX = 0;
        this.track.style.transform = '';

        if (Math.abs(distance) < 45) return;

        if (distance < 0) this.handleNext();
        else this.handlePrev();
      };

      this.handleWheel = (event) => {
        const horizontalDelta =
          Math.abs(event.deltaX) > Math.abs(event.deltaY)
            ? event.deltaX
            : event.shiftKey
              ? event.deltaY
              : 0;

        if (!horizontalDelta) return;

        event.preventDefault();

        if (this.wheelLocked) return;

        this.wheelAccumulator += horizontalDelta;

        if (Math.abs(this.wheelAccumulator) < 35) return;

        if (this.wheelAccumulator > 0) this.handleNext();
        else this.handlePrev();

        this.wheelAccumulator = 0;
        this.wheelLocked = true;

        window.clearTimeout(this.wheelTimer);
        this.wheelTimer = window.setTimeout(() => {
          this.wheelLocked = false;
        }, 420);
      };
      this.handleSlideClick = (event) => {
        if (this.didDrag) {
          this.didDrag = false;
          return;
        }

        const slide = event.target.closest('[data-rf-testimonial]');
        if (!slide || !this.contains(slide) || slide.classList.contains('is-active')) return;
        const slideIndex = Number(slide.dataset.index);
        if (!Number.isNaN(slideIndex)) this.show(slideIndex);
      };
      this.handleBlockSelect = (event) => {
        const block = event.target.closest('[data-rf-testimonial]');
        if (!block || !this.contains(block)) return;
        const blockIndex = Number(block.dataset.index);
        if (!Number.isNaN(blockIndex)) this.show(blockIndex, false);
      };

      if (this.prevButton) this.prevButton.addEventListener('click', this.handlePrev);
      if (this.nextButton) this.nextButton.addEventListener('click', this.handleNext);
      if (this.viewport) {
        this.viewport.addEventListener('pointerdown', this.handlePointerDown);
        this.viewport.addEventListener('pointermove', this.handlePointerMove);
        this.viewport.addEventListener('pointerup', this.handlePointerEnd);
        this.viewport.addEventListener('pointercancel', this.handlePointerEnd);
        this.viewport.addEventListener('wheel', this.handleWheel, { passive: false });
        this.viewport.addEventListener('click', this.handleSlideClick);
      }
      document.addEventListener('shopify:block:select', this.handleBlockSelect);

      this.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.autoplay = this.dataset.autoplay === 'true' && !this.reduceMotion;
      this.delay = Number(this.dataset.autoplayDelay) || 6000;

      this.show(this.index, false);
      this.startAutoplay();
    }

    disconnectedCallback() {
      if (this.prevButton) this.prevButton.removeEventListener('click', this.handlePrev);
      if (this.nextButton) this.nextButton.removeEventListener('click', this.handleNext);
      if (this.viewport) {
        this.viewport.removeEventListener('pointerdown', this.handlePointerDown);
        this.viewport.removeEventListener('pointermove', this.handlePointerMove);
        this.viewport.removeEventListener('pointerup', this.handlePointerEnd);
        this.viewport.removeEventListener('pointercancel', this.handlePointerEnd);
        this.viewport.removeEventListener('wheel', this.handleWheel);
        this.viewport.removeEventListener('click', this.handleSlideClick);
      }

      window.clearTimeout(this.wheelTimer);
      document.removeEventListener('shopify:block:select', this.handleBlockSelect);
      this.stopAutoplay();
      this.initialized = false;
    }

    show(index, restartAutoplay = true) {
      if (!this.slides.length) return;

      const total = this.slides.length;
      this.index = (index + total) % total;
      const prevIndex = (this.index - 1 + total) % total;
      const nextIndex = (this.index + 1) % total;

      this.slides.forEach((slide, slideIndex) => {
        const active = slideIndex === this.index;
        const prev = total > 1 && slideIndex === prevIndex;
        const next = total > 1 && slideIndex === nextIndex;

        slide.classList.toggle('is-active', active);
        slide.classList.toggle('is-prev', prev && !active);
        slide.classList.toggle('is-next', next && !active);
        slide.setAttribute('aria-hidden', active ? 'false' : 'true');
      });

      if (this.currentEl) this.currentEl.textContent = String(this.index + 1);

      if (restartAutoplay) {
        this.stopAutoplay();
        this.startAutoplay();
      }
    }

    startAutoplay() {
      if (!this.autoplay || this.slides.length < 2) return;
      this.timer = window.setInterval(() => this.show(this.index + 1, false), this.delay);
    }

    stopAutoplay() {
      if (!this.timer) return;
      window.clearInterval(this.timer);
      this.timer = null;
    }
  }

  customElements.define('rf-testimonials', RFTestimonials);
})();
