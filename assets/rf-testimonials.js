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
      this.endX = 0;

      this.handlePrev = () => this.show(this.index - 1);
      this.handleNext = () => this.show(this.index + 1);
      this.handleTouchStart = (event) => {
        this.startX = event.touches[0].clientX;
      };
      this.handleTouchEnd = (event) => {
        this.endX = event.changedTouches[0].clientX;
        const distance = this.endX - this.startX;
        if (Math.abs(distance) < 50) return;
        if (distance < 0) this.handleNext();
        else this.handlePrev();
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
        this.viewport.addEventListener('touchstart', this.handleTouchStart, { passive: true });
        this.viewport.addEventListener('touchend', this.handleTouchEnd, { passive: true });
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
        this.viewport.removeEventListener('touchstart', this.handleTouchStart);
        this.viewport.removeEventListener('touchend', this.handleTouchEnd);
      }
      document.removeEventListener('shopify:block:select', this.handleBlockSelect);
      this.stopAutoplay();
      this.initialized = false;
    }

    show(index, restartAutoplay = true) {
      if (!this.slides.length) return;

      const total = this.slides.length;
      this.index = (index + total) % total;

      this.slides.forEach((slide, slideIndex) => {
        const active = slideIndex === this.index;
        slide.classList.toggle('is-active', active);
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
