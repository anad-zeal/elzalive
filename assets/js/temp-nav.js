// Add to your existing NavigationManager class
function setupEventListeners() {
  // Existing navigation click handler
  const navElement = document.querySelector('nav');
  if (navElement) {
    navElement.addEventListener('click', this.handleNavClick.bind(this));
  }

  // NEW: JSON link click handler
  document.addEventListener('click', this.handleJsonLinkClick.bind(this));

  // Browser back/forward handler
  window.addEventListener('popstate', this.handlePopState.bind(this));

  // Font size change handlers
  this.setupFontSizeHandlers();
}

// NEW: Handle JSON link clicks
function handleJsonLinkClick(event) {
  const link = event.target.closest('.json-link');

  if (!link) return;

  event.preventDefault();

  const category = link.getAttribute('data-category');
  const href = `/${category}`;

  // Create a temporary link element for navigation
  const tempLink = document.createElement('a');
  tempLink.href = href;
  tempLink.setAttribute('href', href);

  this.updatePageContent(tempLink, true);
}
