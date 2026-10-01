(function () {
  const mobileQuery = window.matchMedia('(max-width: 989px)');

  function positionCategorySection(section) {
    if (!section || !section.isConnected) return;

    const markerId = section.dataset.rfPositionMarker;
    const marker = markerId ? document.getElementById(markerId) : null;

    if (mobileQuery.matches) {
      const hero = document.querySelector('#main .rf-home-hero');
      const heroSection = hero && hero.closest('.shopify-section');

      if (heroSection && heroSection.nextElementSibling !== section) {
        heroSection.insertAdjacentElement('afterend', section);
      }
    } else if (marker && marker.nextElementSibling !== section) {
      marker.insertAdjacentElement('afterend', section);
    }
  }

  function initializeCategorySection(section) {
    if (!section || section.dataset.rfPositionInitialized === 'true') return;

    const marker = document.createElement('span');
    marker.id = `RFHeaderCategoriesMarker-${Math.random().toString(36).slice(2)}`;
    marker.hidden = true;
    marker.setAttribute('aria-hidden', 'true');
    section.insertAdjacentElement('beforebegin', marker);

    section.dataset.rfPositionInitialized = 'true';
    section.dataset.rfPositionMarker = marker.id;
    positionCategorySection(section);
  }

  function initializeAll() {
    document.querySelectorAll('.shopify-section--rf-header-categories').forEach(initializeCategorySection);
  }

  document.addEventListener('DOMContentLoaded', initializeAll);
  document.addEventListener('shopify:section:load', initializeAll);
  const handleBreakpointChange = function () {
    document.querySelectorAll('.shopify-section--rf-header-categories').forEach(positionCategorySection);
  };

  if (mobileQuery.addEventListener) {
    mobileQuery.addEventListener('change', handleBreakpointChange);
  } else {
    mobileQuery.addListener(handleBreakpointChange);
  }
})();
