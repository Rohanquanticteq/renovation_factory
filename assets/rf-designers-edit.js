(function () {
  if (customElements.get('rf-designers-edit')) return;

  class RFDesignersEdit extends HTMLElement {
    connectedCallback() {
      if (this.isInitialized) return;

      this.isInitialized = true;
      this.activeTrigger = null;
      this.handleClick = this.onClick.bind(this);
      this.handleKeydown = this.onKeydown.bind(this);
      this.handleDocumentClick = this.onDocumentClick.bind(this);

      this.addEventListener('click', this.handleClick);
      this.addEventListener('keydown', this.handleKeydown);
      document.addEventListener('click', this.handleDocumentClick);
    }

    disconnectedCallback() {
      this.removeEventListener('click', this.handleClick);
      this.removeEventListener('keydown', this.handleKeydown);
      document.removeEventListener('click', this.handleDocumentClick);
      this.isInitialized = false;
    }

    onClick(event) {
      const trigger = event.target.closest('[data-rf-hotspot]');
      const closeButton = event.target.closest('[data-rf-popover-close]');

      if (trigger && this.contains(trigger)) {
        event.preventDefault();

        if (trigger.getAttribute('aria-expanded') === 'true') {
          this.closePopover(trigger);
        } else {
          this.openPopover(trigger);
        }

        return;
      }

      if (closeButton && this.contains(closeButton)) {
        event.preventDefault();

        const popover = closeButton.closest('[data-rf-popover]');
        const triggerForPopover = popover
          ? this.querySelector('[data-popover-id="' + popover.id + '"]')
          : null;

        this.closePopover(triggerForPopover);
      }
    }

    onDocumentClick(event) {
      if (!this.activeTrigger || this.contains(event.target)) return;
      this.closePopover(this.activeTrigger);
    }

    onKeydown(event) {
      if (event.key !== 'Escape' || !this.activeTrigger) return;

      const trigger = this.activeTrigger;
      this.closePopover(trigger);
      trigger.focus();
    }

    openPopover(trigger) {
      this.closeAllPopovers(trigger);

      const popoverId = trigger.dataset.popoverId;
      const popover = popoverId ? this.querySelector('#' + CSS.escape(popoverId)) : null;

      if (!popover) return;

      popover.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
      this.activeTrigger = trigger;
    }

    closePopover(trigger) {
      if (!trigger) return;

      const popoverId = trigger.dataset.popoverId;
      const popover = popoverId ? this.querySelector('#' + CSS.escape(popoverId)) : null;

      if (popover) popover.hidden = true;

      trigger.setAttribute('aria-expanded', 'false');

      if (this.activeTrigger === trigger) {
        this.activeTrigger = null;
      }
    }

    closeAllPopovers(exceptTrigger) {
      this.querySelectorAll('[data-rf-hotspot][aria-expanded="true"]').forEach((trigger) => {
        if (trigger !== exceptTrigger) this.closePopover(trigger);
      });
    }
  }

  customElements.define('rf-designers-edit', RFDesignersEdit);
})();
