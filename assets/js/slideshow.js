function createEl(tag, dataRole) {
  /* ... */
}
function injectCoreStylesOnce(fadeMs = 1500) {
  /* ... */
}

class Slideshow {
  /* ... */
}

function initSlideshows(root = document) {
  /* ... */
}

document.addEventListener('DOMContentLoaded', () => {
  initSlideshows();
});
window.addEventListener('hashchange', () => initSlideshows());
window.addEventListener('app:navigate', () => initSlideshows());
// /assets/js/misc.js
function swapHeadersViaQueryParam() {
  /* ... */
}

document.addEventListener('DOMContentLoaded', () => {
  swapHeadersViaQueryParam();
});

function swapHeadersViaQueryParam() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('showSlideshow') !== 'true') return;
  const siteHeader = document.querySelector('.site-header');
  const slideshowHeader = document.querySelector('.slideshow-site-header');
  if (siteHeader) siteHeader.style.visibility = 'hidden';
  if (slideshowHeader) slideshowHeader.style.visibility = 'visible';
  document.body.classList.add('is-slideshow');
}
// /assets/js/misc.js
function swapHeadersViaQueryParam() {
  /* ... */
}

document.addEventListener('DOMContentLoaded', () => {
  swapHeadersViaQueryParam();
});

function swapHeadersViaQueryParam() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('showSlideshow') !== 'true') return;
  const siteHeader = document.querySelector('.site-header');
  const slideshowHeader = document.querySelector('.slideshow-site-header');
  if (siteHeader) siteHeader.style.visibility = 'hidden';
  if (slideshowHeader) slideshowHeader.style.visibility = 'visible';
  document.body.classList.add('is-slideshow');
}
