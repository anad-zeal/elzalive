// Slideshow module (vanilla JS, ARIA-friendly, SPA-safe)
// Usage: see init code at the bottom or call new Slideshow(el, { jsonUrl: "/path/file.json" })

export class Slideshow {
  /**
   * @param {HTMLElement} rootEl - The slideshow root container
   * @param {Object} opts
   * @param {string}  opts.jsonUrl - URL to slides JSON
   * @param {number}  [opts.interval=5000] - Autoplay ms
   * @param {number}  [opts.fadeMs=1500] - Fade duration ms
   * @param {boolean} [opts.autoplay=true]
   * @param {boolean} [opts.pauseOnHover=true]
   */
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

    if (!this.opts.jsonUrl) {
      throw new Error('Slideshow requires opts.jsonUrl (path to slides JSON).');
    }

    // Internal state
    this.slides = [];
    this.current = 0;
    this.timer = null;
    this.isPausedByHoverOrTouch = false;

    // Build DOM skeleton (or reuse existing bits if present)
    this._prepareDOM();

    // Fetch slides, then render
    this._loadSlides()
      .then(() => {
        if (!this.slides.length) return;
        this._createSlides();
        this._fadeInFirst();
        if (this.opts.autoplay) this._start();
      })
      .catch((e) => {
        console.error('Slideshow: failed to load slides JSON:', e);
        // Optionally display a message in the slideshow root
        this.root.innerHTML = `<p style="text-align:center; padding: 20px;">Failed to load slideshow. ${e.message}</p>`;
      });
  }

  /* ---------- Public API ---------- */

  next() {
    if (!this.slides.length) return;
    const nextIdx = (this.current + 1) % this.slides.length;
    this._show(nextIdx);
    this._resetAutoplay();
  }

  prev() {
    if (!this.slides.length) return;
    const prevIdx = (this.current - 1 + this.slides.length) % this.slides.length;
    this._show(prevIdx);
    this._resetAutoplay();
  }

  pause() {
    clearInterval(this.timer);
    this.timer = null;
  }

  resume() {
    if (!this.opts.autoplay) return;
    if (!this.isPausedByHoverOrTouch && !this.timer) this._start();
  }

  destroy() {
    this.pause();
    // TODO: Consider removing event listeners if you need full cleanup,
    // though for most SPA scenarios, leaving them on the root is acceptable.
  }

  /* ---------- Private ---------- */

  async _loadSlides() {
    const res = await fetch(this.opts.jsonUrl, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${this.opts.jsonUrl}`);
    const data = await res.json();

    // Expecting: [{ "src": "...", "caption": "...", "alt": "..." }, ...]
    this.slides = Array.isArray(data) ? data : [];
  }

  _prepareDOM() {
    this.root.classList.add('slideshow');
    this.root.style.position = this.root.style.position || 'relative';

    // stage for images
    this.stage = this.root.querySelector('[data-role="stage"]');
    if (!this.stage) {
      this.stage = document.createElement('div');
      this.stage.dataset.role = 'stage'; // Correct way to set a data attribute
      this.root.appendChild(this.stage);
    }

    // caption
    this.captionEl = this.root.querySelector('[data-role="caption"]');
    if (!this.captionEl) {
      this.captionEl = document.createElement('p');
      this.captionEl.dataset.role = 'caption'; // Correct way to set a data attribute
      const capWrap =
        this.root.querySelector('[data-role="caption-wrap"]') || document.createElement('div');
      if (!capWrap.dataset.role) {
        // Only set if not already present, assumes no existing div with data-role but without the specific role
        capWrap.dataset.role = 'caption-wrap'; // Correct way to set a data attribute
      }
      capWrap.appendChild(this.captionEl);
      if (!capWrap.parentNode) {
        // Append the wrapper if it's new
        this.root.appendChild(capWrap);
      }
    }
    this.root.setAttribute('aria-live', 'polite');

    // controls
    this.prevBtn = this.root.querySelector('[data-action="prev"]');
    if (!this.prevBtn) {
      this.prevBtn = this._makeButton('prev', 'Previous slide');
      const wrap = document.createElement('div');
      wrap.dataset.role = 'previous'; // Correct way to set a data attribute
      wrap.appendChild(this.prevBtn);
      this.root.appendChild(wrap);
    }

    this.nextBtn = this.root.querySelector('[data-action="next"]');
    if (!this.nextBtn) {
      this.nextBtn = this._makeButton('next', 'Next slide');
      const wrap = document.createElement('div');
      wrap.dataset.role = 'next'; // Correct way to set a data attribute
      wrap.appendChild(this.nextBtn);
      this.root.appendChild(wrap);
    }

    // Events
    // Event listeners are added here regardless if the buttons were newly created
    // or pre-existing, ensuring they always have functionality.
    // If you need to ensure they are added only once, you might check this.prevBtn.dataset.listenerAdded etc.
    this.prevBtn.addEventListener('click', () => this.prev());
    this.nextBtn.addEventListener('click', () => this.next());

    if (this.opts.pauseOnHover) {
      this.root.addEventListener('mouseenter', () => {
        this.isPausedByHoverOrTouch = true;
        this.pause();
      });
      this.root.addEventListener('mouseleave', () => {
        this.isPausedByHoverOrTouch = false;
        this.resume();
      });
      this.root.addEventListener(
        'touchstart',
        () => {
          this.isPausedByHoverOrTouch = true;
          this.pause();
        },
        { passive: true }
      );
      this.root.addEventListener(
        'touchend',
        () => {
          this.isPausedByHoverOrTouch = false;
          this.resume();
        },
        { passive: true }
      );
    }

    // Keyboard (← →)
    this.root.tabIndex = this.root.tabIndex || 0;
    this.root.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault(); // Prevent page scroll
        this.prev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault(); // Prevent page scroll
        this.next();
      }
    });

    // Minimal CSS safety (only if author hasn’t defined it)
    if (!this.root.dataset.cssInjected) {
      const s = document.createElement('style');
      s.textContent = `
        .slideshow { width: min(1200px, 90vw); margin-inline: auto; }
        .slideshow [data-role="stage"] {
          position: relative; aspect-ratio: 16 / 9; background: #f6f6f6;
          overflow: hidden; border-radius: 8px; box-shadow: 0 4px 8px rgb(0 0 0 / 0.1);
        }
        .slideshow [data-role="stage"] img {
          position: absolute; inset: 0; margin: auto; max-width: 100%; max-height: 100%;
          opacity: 0; transition: opacity ${this.opts.fadeMs}ms ease-in-out; object-fit: contain;
        }
        .slideshow [data-role="caption-wrap"] { text-align: center; padding: 0.75rem 0; color: #555; font-style: italic; }
        .slideshow [data-role="previous"], .slideshow [data-role="next"] {
          position: absolute; top: 50%; transform: translateY(-50%); z-index: 10;
        }
        .slideshow [data-role="previous"] { left: 0.5rem; }
        .slideshow [data-role="next"] { right: 0.5rem; }
        .slideshow button[data-action] {
          background: #8b0000; color: white; border: 0; border-radius: 50%;
          width: 56px; height: 56px; display: grid; place-items: center; cursor: pointer;
          transition: background-color 0.2s ease;
        }
        .slideshow button[data-action]:hover { background: #c53030; }
        .slideshow button[data-action]:focus { outline: 2px solid #c53030; outline-offset: 2px; }
      `;
      document.head.appendChild(s);
      this.root.dataset.cssInjected = '1';
    }
  }

  _makeButton(action, label) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.dataset.action = action;
    btn.setAttribute('aria-label', label);
    btn.innerHTML = action === 'prev' ? '&#9664;' : '&#9654;'; // ◀ ▶
    return btn;
  }

  _createSlides() {
    this.images = this.slides.map((item) => {
      const img = document.createElement('img');
      img.src = item.src;
      if (item.alt) img.alt = item.alt;
      else img.alt = item.caption ? String(item.caption) : ''; // Fallback alt text
      img.setAttribute('aria-hidden', 'true'); // Initially hidden from screen readers
      this.stage.appendChild(img);
      return img;
    });
    // Set the first image as not hidden for screen readers
    if (this.images.length > 0) {
      this.images[0].removeAttribute('aria-hidden');
    }
  }

  _fadeInFirst() {
    if (!this.images || !this.images.length) return;
    const first = this.images[0];
    requestAnimationFrame(() => {
      first.style.opacity = '1';
      this._setCaption(0);
      // kick off autoplay slightly later for smoother first fade
      if (this.opts.autoplay) {
        setTimeout(() => this._start(), this.opts.fadeMs + 200);
      }
    });
  }

  _show(index) {
    if (!this.images || !this.images.length) return;

    // Manage aria-hidden for screen readers
    this.images.forEach((img, i) => {
      img.style.opacity = i === index ? '1' : '0';
      if (i === index) {
        img.removeAttribute('aria-hidden');
      } else {
        img.setAttribute('aria-hidden', 'true');
      }
    });

    this._setCaption(index);
    this.current = index;
  }

  _setCaption(index) {
    const cap = this.slides[index]?.caption ?? '';
    // quick fade on caption
    this.captionEl.style.opacity = '0';
    setTimeout(() => {
      this.captionEl.textContent = cap;
      this.captionEl.style.transition = `opacity ${Math.min(this.opts.fadeMs, 1000)}ms ease-in-out`;
      this.captionEl.style.opacity = '1';
    }, 200);
  }

  _start() {
    this.pause(); // Clear existing timer
    this.timer = setInterval(() => {
      const nextIdx = (this.current + 1) % this.slides.length;
      this._show(nextIdx);
    }, this.opts.interval);
  }

  _resetAutoplay() {
    if (!this.opts.autoplay) return;
    this.pause();
    this.resume(); // Will only resume if not paused by hover/touch
  }
}

/**
 * Auto-initialize all slideshows that declare a data attribute.
 * Looks for: [data-slides], optional: data-interval, data-fade, data-autoplay
 */
export function initSlideshows(root = document) {
  const nodes = [...root.querySelectorAll('[data-slides]')];
  return nodes
    .map((el) => {
      try {
        const jsonUrl = el.getAttribute('data-slides');
        const interval = Number(el.getAttribute('data-interval') || 5000);
        const fadeMs = Number(el.getAttribute('data-fade') || 1500);
        const autoplay = el.getAttribute('data-autoplay') !== 'false'; // default true
        const pauseOnHover = el.getAttribute('data-pause-on-hover') !== 'false'; // default true

        return new Slideshow(el, {
          jsonUrl,
          interval,
          fadeMs,
          autoplay,
          pauseOnHover,
        });
      } catch (e) {
        console.error(`Error initializing slideshow on element:`, el, e);
        // Optionally display an error message directly in the element's container
        el.innerHTML = `<p style="text-align:center; padding: 20px; color: red;">Failed to load slideshow: ${e.message}</p>`;
        return null; // Return null for failed initializations
      }
    })
    .filter(Boolean); // Filter out any nulls from failed initializations
}

// This code runs as soon as the page is loaded
document.addEventListener('DOMContentLoaded', function () {
  // Get the parameters from the page's URL
  const urlParams = new URLSearchParams(window.location.search);

  // Check if the 'showSlideshow' parameter exists in the URL
  if (urlParams.get('showSlideshow') === 'true') {
    // Find the two headers on the page
    const siteHeader = document.querySelector('.site-header');
    const slideshowHeader = document.querySelector('.slidesshow-site-header');

    // If both headers are found, swap their visibility
    if (siteHeader && slideshowHeader) {
      siteHeader.style.visibility = 'hidden';
      slideshowHeader.style.visibility = 'visible';
    }
  }
});
