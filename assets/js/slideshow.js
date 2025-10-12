/ /assets/js/slideshow.js
// No changes needed, as confirmed it does not use 'export'
// You might consider removing the DOMContentLoaded, hashchange, app:navigate listeners if you solely rely on navigation.js
// for initialization after content loads, but it's not strictly necessary for it to work.

function createEl(tag, dataRole) { /* ... */ }
function injectCoreStylesOnce(fadeMs = 1500) { /* ... */ }

class Slideshow { /* ... */ }

function initSlideshows(root = document) { /* ... */ }

document.addEventListener('DOMContentLoaded', () => {
  initSlideshows();
});
window.addEventListener('hashchange', () => initSlideshows());
window.addEventListener('app:navigate', () => initSlideshows());
```

**7. `assets/js/misc.js` (Your Miscellaneous Script):**

This file is good as is. Its logic runs on initial `DOMContentLoaded`.

```javascript
// /assets/js/misc.js
function swapHeadersViaQueryParam() { /* ... */ }

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
