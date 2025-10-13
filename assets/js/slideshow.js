// assets/js/slideshow.js
// Vanilla JS slideshow (ES module). ARIA-friendly and SPA-safe.

function createEl(tag, dataRole) {
  const el = document.createElement(tag);
  if (dataRole) el.setAttribute('data-role', dataRole);
  return el;
}

// *** REMOVED: Core styles are now assumed to be in style.css ***
// function injectCoreStylesOnce(fadeMs = 1500) { /* ... */ }

class Slideshow {
  constructor(rootEl, opts = {}) {
    if (!rootEl) throw new Error('Slideshow root element is required.');
    this.root = rootEl;
    this.opts = {
      jsonUrl: opts.jsonUrl,
      interval: Number(opts.interval ?? 5000),
      fadeMs: Number(opts.fadeMs ?? 1500),
      autoplay: opts.autoplay ?? true,
      pauseOnHover: opts.pauseOnHover ?? true,
    };
    if (!this.opts.jsonUrl) throw new Error('opts.jsonUrl is required.');

    this.slides = [];
    this.images = [];
    this.current = 0;
    this.timer = null;
    this.isPausedByHoverOrTouch = false;

    // Core styles are now expected to be loaded via a CSS file.
    // injectCoreStylesOnce(this.opts.fadeMs);

    this._prepareDOM();
    this._loadSlides()
      .then(() => {
        if (!this.slides.length) {
          this.root.innerHTML = `<p style="text-align:center; padding:20px; color:#b00;">No slides found.</p>`;
          return;
        }
        this._createSlides();
        this._fadeInFirst(); // starts autoplay after first fade if enabled
      })
      .catch((e) => {
        console.error('Slideshow: failed to load slides JSON:', e);
        this.root.innerHTML = `<p style="text-align:center; padding:20px; color:#b00;">Failed to load slideshow. ${e.message}</p>`;
      });
  }

  next() {
    if (this.slides.length) {
      this._show((this.current + 1) % this.slides.length);
      this._resetAutoplay();
    }
  }
  prev() {
    if (this.slides.length) {
      this._show((this.current - 1 + this.slides.length) % this.slides.length);
      this._resetAutoplay();
    }
  }
  pause() {
    clearInterval(this.timer);
    this.timer = null;
  }
  resume() {
    if (this.opts.autoplay && !this.isPausedByHoverOrTouch && !this.timer) this._start();
  }
  destroy() {
    this.pause();
  }

  async _loadSlides() {
    const res = await fetch(this.opts.jsonUrl, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${this.opts.jsonUrl}`);
    const data = await res.json();
    this.slides = Array.isArray(data) ? data : [];
  }

  _prepareDOM() {
    this.root.classList.add('slideshow');
    // Ensure relative positioning for absolute children, if not already set by CSS
    if (getComputedStyle(this.root).position === 'static') this.root.style.position = 'relative';
    this.root.setAttribute('aria-live', 'polite');
    if (!this.root.hasAttribute('tabindex')) this.root.tabIndex = 0; // Allows keyboard focus

    this.stage = this.root.querySelector('[data-role="stage"]') || createEl('div', 'stage');
    if (!this.stage.parentNode) this.root.appendChild(this.stage);
    // Ensure aspect ratio and min-height for stage if not set by CSS
    const ar = getComputedStyle(this.stage).aspectRatio;
    if (!ar || ar === 'auto' || ar === '0') {
      // Added '0' check for browsers that return it for auto
      this.stage.style.aspectRatio = '16 / 9';
      if (!this.stage.style.minHeight) this.stage.style.minHeight = '320px';
    }

    let capWrap = this.root.querySelector('[data-role="caption-wrap"]');
    if (!capWrap) capWrap = createEl('div', 'caption-wrap');
    this.captionEl = this.root.querySelector('[data-role="caption"]') || createEl('p', 'caption');
    if (!this.captionEl.parentNode) capWrap.appendChild(this.captionEl);
    if (!capWrap.parentNode) this.root.appendChild(capWrap);

    this.prevBtn =
      this.root.querySelector('[data-action="prev"]') || this._makeButton('prev', 'Previous slide');
    this.nextBtn =
      this.root.querySelector('[data-action="next"]') || this._makeButton('next', 'Next slide');

    // Attach buttons to the root, possibly wrapped for positioning
    if (
      !this.prevBtn.parentNode ||
      this.prevBtn.parentNode.getAttribute('data-role') !== 'previous'
    ) {
      const w = createEl('div', 'previous');
      w.appendChild(this.prevBtn);
      this.root.appendChild(w);
    }
    if (!this.nextBtn.parentNode || this.nextBtn.parentNode.getAttribute('data-role') !== 'next') {
      const w = createEl('div', 'next');
      w.appendChild(this.nextBtn);
      this.root.appendChild(w);
    }

    this.prevBtn.addEventListener('click', () => this.prev());
    this.nextBtn.addEventListener('click', () => this.next());
    this.root.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.prev();
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.next();
      }
    });

    if (this.opts.pauseOnHover) {
      this.root.addEventListener('mouseenter', () => {
        this.isPausedByHoverOrTouch = true;
        this.pause();
      });
      this.root.addEventListener('mouseleave', () => {
        this.isPausedByHoverOrTouch = false;
        this.resume();
      });
      // Use event delegation for touch to avoid multiple listeners if slideshows are frequently added/removed
      let touchStartTimer;
      this.root.addEventListener(
        'touchstart',
        (e) => {
          this.isPausedByHoverOrTouch = true;
          this.pause();
          // Set a short timer to allow for quick taps without re-pausing immediately after touchend
          touchStartTimer = setTimeout(() => {
            this.isPausedByHoverOrTouch = false;
            this.resume();
          }, 3000); // Resume after 3 seconds if no further interaction
        },
        { passive: true }
      );
      this.root.addEventListener(
        'touchend',
        () => {
          clearTimeout(touchStartTimer); // Clear any pending resume from touchstart
          // If the slideshow is still paused by hover/touch, keep it paused.
          // Otherwise, allow resume.
          if (!this.isPausedByHoverOrTouch) this.resume();
        },
        { passive: true }
      );
    }
  }

  _makeButton(action, label) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('data-action', action);
    btn.setAttribute('aria-label', label);
    btn.innerHTML = action === 'prev' ? '&#9664;' : '&#9654;';
    return btn;
  }

  _createSlides() {
    this.images = this.slides.map((item, idx) => {
      const img = document.createElement('img');
      img.src = item.src;
      img.alt = item.alt ?? item.caption ?? '';
      img.decoding = 'async';
      img.loading = idx === 0 ? 'eager' : 'lazy'; // Eager load the first, lazy load the rest
      img.setAttribute('aria-hidden', idx === 0 ? 'false' : 'true');
      this.stage.appendChild(img);
      return img;
    });
  }

  _fadeInFirst() {
    if (!this.images.length) return;
    const first = this.images[0];
    const reveal = () => {
      first.style.opacity = '1';
      this._setCaption(0);
      if (this.opts.autoplay) setTimeout(() => this._start(), this.opts.fadeMs + 200);
    };

    // Ensure the image is loaded before revealing
    if (first.complete && first.naturalWidth > 0) {
      requestAnimationFrame(reveal);
    } else {
      first.addEventListener('load', () => requestAnimationFrame(reveal), { once: true });
      first.addEventListener(
        'error',
        () => {
          console.error('Slideshow: failed to load image:', first.src);
          // Even if image fails, try to set caption and start autoplay
          requestAnimationFrame(reveal);
        },
        { once: true }
      );
    }
  }

  _show(index) {
    if (!this.images.length || index === this.current) return; // Prevent unnecessary updates

    const target = this.images[index];
    const paint = () => {
      this.images.forEach((img, i) => {
        img.style.opacity = i === index ? '1' : '0';
        img.setAttribute('aria-hidden', i === index ? 'false' : 'true');
      });
      this._setCaption(index);
      this.current = index;
    };

    // Preload the target image if not already loaded, then show
    if (target.complete && target.naturalWidth > 0) {
      paint();
    } else {
      // Add 'eager' loading if it's not already (e.g. if it was lazy before)
      target.loading = 'eager';
      target.addEventListener('load', paint, { once: true });
      target.addEventListener(
        'error',
        () => {
          console.error('Slideshow: failed to load image:', target.src);
          paint(); // Show anyway, even if image failed
        },
        { once: true }
      );
    }
  }

  _setCaption(index) {
    const cap = this.slides[index]?.caption ?? '';
    if (this.captionEl.textContent === cap) return; // Avoid redundant updates

    this.captionEl.style.opacity = '0';
    // Slightly delay caption change to allow visual fade-out before content swap
    setTimeout(() => {
      this.captionEl.textContent = cap;
      // Re-enable transition for fade-in (it might be removed by external CSS for initial display)
      this.captionEl.style.transition = `opacity ${Math.min(this.opts.fadeMs, 1000)}ms ease-in-out`;
      this.captionEl.style.opacity = '1';
    }, this.opts.fadeMs / 3); // Faster fade out/in for caption
  }

  _start() {
    this.pause(); // Clear any existing timer
    this.timer = setInterval(() => {
      const nextIdx = (this.current + 1) % this.slides.length;
      this._show(nextIdx);
    }, this.opts.interval);
  }

  _resetAutoplay() {
    if (this.opts.autoplay && !this.isPausedByHoverOrTouch) {
      this.pause(); // Stop current timer
      this._start(); // Start a new one
    }
  }
}

function initSlideshows(root = document) {
  // Destroy existing slideshows found in the root before initializing new ones
  // This prevents multiple event listeners if initSlideshows is called multiple times on the same root
  root.querySelectorAll('.slideshow[data-slides]').forEach((el) => {
    if (el._slideshowInstance && typeof el._slideshowInstance.destroy === 'function') {
      el._slideshowInstance.destroy();
    }
  });

  const nodes = [...root.querySelectorAll('[data-slides]')];
  return nodes
    .map((el) => {
      const jsonUrl = el.getAttribute('data-slides');
      const interval = Number(el.getAttribute('data-interval') || 5000);
      const fadeMs = Number(el.getAttribute('data-fade') || 1500);
      const autoplay = el.getAttribute('data-autoplay') !== 'false';
      const pauseOnHover = el.getAttribute('data-pause-on-hover') !== 'false';
      try {
        const slideshow = new Slideshow(el, { jsonUrl, interval, fadeMs, autoplay, pauseOnHover });
        el._slideshowInstance = slideshow; // Store instance for potential destruction
        return slideshow;
      } catch (e) {
        console.error('Error initializing slideshow:', e);
        el.innerHTML = `<p style="text-align:center; padding: 20px; color:#b00;">Failed to load slideshow: ${e.message}</p>`;
        return null;
      }
    })
    .filter(Boolean);
}

/* Optional header swap via ?showSlideshow=true */
function swapHeadersViaQueryParam() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('showSlideshow') !== 'true') return;
  const siteHeader = document.querySelector('.site-header');
  const slideshowHeader = document.querySelector('.slideshow-site-header'); // Removed redundant selector
  if (siteHeader) siteHeader.style.visibility = 'hidden';
  if (slideshowHeader) slideshowHeader.style.visibility = 'visible';
  document.body.classList.add('is-slideshow');
}

document.addEventListener('DOMContentLoaded', () => {
  initSlideshows();
  swapHeadersViaQueryParam();
});

// For SPA navigation, a custom event 'app:navigate' is dispatched by navigation.js
// This ensures slideshows are re-initialized when new content is loaded into #dynamic-page-wrapper
window.addEventListener('app:navigate', (event) => {
  // Re-initialize slideshows only within the newly loaded content, if applicable
  const targetElement = event.detail?.targetElement || document;
  initSlideshows(targetElement);
});

// Keep window.addEventListener('hashchange', () => initSlideshows()); only if hashes
// are used to trigger new content loads in a non-SPA fashion or need re-init
// If the SPA handles routing, the 'app:navigate' event is sufficient.
// If you do use hashchange for content, ensure it's initializing in the correct root.
// For now, I will comment it out as 'app:navigate' seems to be the intended SPA trigger.
// window.addEventListener('hashchange', () => initSlideshows());
