function getTransitionDuration(element) {
  if (!element) return 0;
  const style = window.getComputedStyle(element);
  const duration = style.transitionDuration;
  return parseFloat(duration) * 1000 || 0;
}

const pageTitles = {
  '/home': 'The life of an artist',
  '/artworks': 'Artwork Categories',
  '/biography': 'How I became an artist',
  '/contact': 'Send me a message',
  '/drips': 'Drip Series Collection',
  '/encaustic': 'Encaustic Works',
  '/projects': 'Project Series Gallery',
  '/restoration': 'Restoration Services',
  '/decorative': 'Decorative Art',
};

const mainContentArea = document.getElementById('main-content-area');

document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('nav a');
  const subTitleElement =
    document.querySelector('h2.sub-title') || document.querySelector('p.sub-title');
  const mainContentFadeArea = document.getElementById('main-content-fade-area');
  let isTransitioning = false;

  async function loadPageContent(path) {
  if (loadingSpinner) loadingSpinner.style.display = 'block'; // Show spinner
  mainContentArea.innerHTML = ''; // Clear previous content immediately

  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to load page: ${response.status} ${response.statusText}`);
    }
    const html = await response.text();
    mainContentArea.innerHTML = html; // Inject new HTML

    // After injecting new content, re-initialize any components like slideshows
    initSlideshows(mainContentArea); // Pass the new content area as root
  } catch (error) {
    console.error('Error loading page content:', error);
    mainContentArea.innerHTML = `<p style="color:red;">Failed to load content. ${error.message}</p>`;
  } finally {
    if (loadingSpinner) loadingSpinner.style.display = 'none'; // Hide spinner
  }
}

async function updatePageContent(activeLink, pushState = true) { // Added pushState parameter
  if (isTransitioning) return;
  isTransitioning = true;

  const cleanHref = activeLink.getAttribute('href').replace(/~\[|\]~/g, '');
  const pageName = cleanHref.substring(1) || 'home';

  let newSubTitleText = pageTitles[cleanHref] || activeLink.textContent; // Use pageTitles or fallback to link text

  const fadeElement = mainContentFadeArea || subTitleElement;
  if (fadeElement) {
    fadeElement.style.opacity = 0;
    await new Promise((resolve) =>
      setTimeout(resolve, getTransitionDuration(fadeElement) || 280)
    );
  }

  // Clear active classes from old links
  navLinks.forEach((link) => {
    link.classList.remove('is-active');
    link.removeAttribute('aria-current');
  });

  // Set active class on the new link
  activeLink.classList.add('is-active');
  activeLink.setAttribute('aria-current', `${pageName} page`);

  // Update URL in browser history if not explicitly prevented (e.g., for initial load)
  if (pushState) {
    history.pushState({ path: cleanHref }, '', cleanHref);
  }

  // Update the subtitle
  if (subTitleElement) subTitleElement.textContent = newSubTitleText;

  // *** NEW: Load and inject the main content ***
  await loadPageContent(cleanHref);

  // Fade in the subtitle/fade area
  if (fadeElement) fadeElement.style.opacity = 1;

  isTransitioning = false;
}

// Handle browser's back/forward buttons
window.addEventListener('popstate', (event) => {
  const currentPath = window.location.pathname;
  let activeLink = document.querySelector(`nav a[href="${currentPath}"]`);
  if (!activeLink) activeLink = document.querySelector('nav a[href="/home"]'); // Fallback to home
  if (activeLink) {
    // When navigating via back/forward, we don't push a new state
    updatePageContent(activeLink, false);
  }
});

// Modify the initial page load logic
document.addEventListener('DOMContentLoaded', () => {
  // ... (existing code for navLinks, subTitleElement, mainContentFadeArea, isTransitioning)

  const currentPath = window.location.pathname;
  let initialActiveLink = document.querySelector(`nav a[href="${currentPath}"]`);
  if (!initialActiveLink) initialActiveLink = document.querySelector('nav a[href="/home"]'); // Default to home

  if (initialActiveLink) {
    // Initial load, no pushState needed as the URL is already set
    updatePageContent(initialActiveLink, false).then(() => { // Pass false for pushState
      const fadeElement = mainContentFadeArea || subTitleElement;
      if (fadeElement) fadeElement.style.opacity = 1;
    });
  } else {
    // If no initial active link found and no default, maybe just show home content
    loadPageContent('/home').then(() => { // Load home content
        const fadeElement = mainContentFadeArea || subTitleElement;
        if (fadeElement) fadeElement.style.opacity = 1;
        if (subTitleElement) subTitleElement.textContent = pageTitles['/home']; // Set home title
        document.querySelector('nav a[href="/home"]').classList.add('is-active');
        document.querySelector('nav a[href="/home"]').setAttribute('aria-current', 'home page');
    });
  }

  // Remove these event listeners if you plan to rely solely on the above logic
  // window.addEventListener('hashchange', () => initSlideshows());
  // window.addEventListener('app:navigate', () => initSlideshows());
});
