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
  '/black-and-white': 'Black & White Artworks',
  '/drips': 'Drip Series Collection',
  '/encaustic': 'Encaustic Works',
  '/projects': 'Project Series Gallery',
  '/restoration': 'Restoration Services',
  '/decorative': 'Decorative Art',
};

document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('nav a');
  const subTitleElement =
    document.querySelector('h2.sub-title') || document.querySelector('p.sub-title');
  const mainContentFadeArea = document.getElementById('main-content-fade-area');
  let isTransitioning = false;

  async function updatePageContent(activeLink) {
    if (isTransitioning) return;
    isTransitioning = true;
    const cleanHref = activeLink.getAttribute('href').replace(/~\[|\]~/g, '');
    const pageName = cleanHref.substring(1) || 'home';
    const newSubTitleText = pageTitles[cleanHref] || 'Welcome!';
    const fadeElement = mainContentFadeArea || subTitleElement;
    if (fadeElement) {
      fadeElement.style.opacity = 0;
      await new Promise((resolve) =>
        setTimeout(resolve, getTransitionDuration(fadeElement) || 280)
      );
    }
    navLinks.forEach((link) => {
      link.classList.remove('is-active');
      link.removeAttribute('aria-current');
    });
    activeLink.classList.add('is-active');
    activeLink.setAttribute('aria-current', `${pageName} page`);
    if (subTitleElement) subTitleElement.textContent = newSubTitleText;
    if (fadeElement) fadeElement.style.opacity = 1;
    isTransitioning = false;
  }

  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      updatePageContent(link);
    });
  });

  const currentPath = window.location.pathname;
  let initialActiveLink = document.querySelector(`nav a[href="${currentPath}"]`);
  if (!initialActiveLink) initialActiveLink = document.querySelector('nav a.is-active');
  if (!initialActiveLink) initialActiveLink = document.querySelector('nav a[href="/home"]');
  if (initialActiveLink) {
    updatePageContent(initialActiveLink).then(() => {
      const fadeElement = mainContentFadeArea || subTitleElement;
      if (fadeElement) fadeElement.style.opacity = 1;
    });
  } else {
    const fadeElement = mainContentFadeArea || subTitleElement;
    if (fadeElement) fadeElement.style.opacity = 1;
    if (subTitleElement) subTitleElement.textContent = 'Welcome to the Site!';
  }
});
