(function () {
  if (customElements.get('rf-home-hero')) return;

  class RFHomeHero extends HTMLElement {
    connectedCallback() {
      if (this.swiper || !window.Swiper) return;

      this.slider = this.querySelector('.rf-home-hero__slider');
      this.playbackButton = this.querySelector('.rf-home-hero__playback');
      this.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.autoplayEnabled = this.dataset.autoplay === 'true' && !this.reduceMotion;
      this.handleBlockSelect = this.onBlockSelect.bind(this);

      var options = {
        a11y: true,
        allowTouchMove: Number(this.dataset.slideCount) > 1,
        keyboard: {
          enabled: true,
          onlyInViewport: true
        },
        loop: Number(this.dataset.slideCount) > 1,
        navigation: {
          nextEl: this.querySelector('.rf-home-hero__arrow--next'),
          prevEl: this.querySelector('.rf-home-hero__arrow--previous')
        },
        pagination: {
          el: this.querySelector('.rf-home-hero__pagination'),
          clickable: true
        },
        on: {
          init: this.handleSlideChange.bind(this),
          slideChangeTransitionStart: this.handleSlideChange.bind(this)
        }
      };

      if (this.autoplayEnabled) {
        options.autoplay = {
          delay: Number(this.dataset.autoplayDelay) || 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true
        };
      }

      this.swiper = new window.Swiper(this.slider, options);
      this.handleSlideChange();

      if (this.playbackButton) {
        if (!this.autoplayEnabled) {
          this.playbackButton.classList.add('is-paused');
          this.playbackButton.setAttribute('aria-label', 'Play slideshow');
          this.playbackButton.setAttribute('title', 'Play slideshow');
        }
        this.playbackButton.addEventListener('click', this.togglePlayback.bind(this));
      }

      if (window.Shopify && window.Shopify.designMode) {
        this.addEventListener('shopify:block:select', this.handleBlockSelect);
      }
    }

    disconnectedCallback() {
      this.removeEventListener('shopify:block:select', this.handleBlockSelect);
      if (this.swiper) {
        this.swiper.destroy(true, true);
        this.swiper = null;
      }
    }

    onBlockSelect(event) {
      if (!this.swiper) return;

      var selectedSlide = this.querySelector('[data-block-id="' + event.detail.blockId + '"]');
      if (!selectedSlide) return;

      var slideIndex = Array.prototype.indexOf.call(this.swiper.slides, selectedSlide);
      if (slideIndex >= 0) this.swiper.slideTo(slideIndex, 0);
      if (this.swiper.autoplay) this.swiper.autoplay.stop();
    }

    handleSlideChange() {
      if (!this.swiper) return;

      this.querySelectorAll('video').forEach(function (video) {
        video.pause();
      });

      var activeSlide = this.swiper.slides[this.swiper.activeIndex];
      if (!activeSlide || this.reduceMotion) return;

      activeSlide.querySelectorAll('video').forEach(function (video) {
        if (video.offsetParent === null) return;
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') promise.catch(function () {});
      });
    }

    togglePlayback() {
      if (!this.swiper || !this.swiper.autoplay) return;

      var isPaused = this.playbackButton.classList.toggle('is-paused');
      if (isPaused) {
        this.swiper.autoplay.stop();
      } else {
        this.swiper.autoplay.start();
      }

      var label = isPaused ? 'Play slideshow' : 'Pause slideshow';
      this.playbackButton.setAttribute('aria-label', label);
      this.playbackButton.setAttribute('title', label);
    }
  }

  customElements.define('rf-home-hero', RFHomeHero);
})();
