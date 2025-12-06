/**
 * assets/js/script.js
 * Final Refactor: Strict Index1 Structure compliance
 */

const DEBUG = true;
const log = (...args) => DEBUG && console.log('[AEP]', ...args);

/** Stores scroll positions by page */
const scrollMemory = {};

/** Global references for slideshow cleanup */
let slideshowTimer = null;
let slideshowState = {
  current: 0,
  slides: [],
  isPaused: false,
};

// ---------------------------------------------------------------------------
//  Helper: Transition / DOM Swap
// ---------------------------------------------------------------------------

function fadeSwap(element, newContentCallback) {
  element.classList.add('fade-out');
  setTimeout(() => {
    // 1. Update the DOM
    newContentCallback();

    // 2. Fade back in
    element.classList.remove('fade-out');
    element.classList.add('fade-in');

    // 3. Cleanup class
    setTimeout(() => element.classList.remove('fade-in'), 300);
  }, 300);
}

// ---------------------------------------------------------------------------
//  Slideshow Logic
// ---------------------------------------------------------------------------

function clearSlideshow() {
  if (slideshowTimer) {
    clearInterval(slideshowTimer);
    slideshowTimer = null;
  }
  slideshowState = { current: 0, slides: [], isPaused: false };
}

function initSlideshow(jsonFilename) {
  log(`Initializing slideshow with source: ${jsonFilename}`);

  const slideshowContainer = document.querySelector('.slideshow');
  const caption = document.getElementById('caption-text');
  const prevBtn = document.getElementById('prev-slide');
  const nextBtn = document.getElementById('next-slide');

  if (!slideshowContainer) return;

  const fetchPath = `json-files/${jsonFilename}`;

  fetch(fetchPath)
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to load ${fetchPath}`);
      return res.json();
    })
    .then((data) => {
      slideshowState.slides = data;
      slideshowContainer.innerHTML = '';

      createSlides(slideshowContainer);
      setupControls(prevBtn, nextBtn, slideshowContainer);
      fadeInFirstSlide(caption);
    })
    .catch((err) => console.error(err));
}

function createSlides(container) {
  // Essential styles for the container to hold absolute images
  container.style.position = 'relative';
  container.style.width = '100%';
  container.style.height = '100%';

  // Fallback height if CSS Grid hasn't sized it yet
  if (container.clientHeight < 50) container.style.minHeight = '60vh';

  slideshowState.slides.forEach(({ src }, index) => {
    const img = document.createElement('img');
    img.src = src;
    img.className = 'slide';

    // Exact styles needed for centering and cross-fading
    Object.assign(img.style, {
      opacity: 0,
      transition: 'opacity 1.5s ease-in-out',
      position: 'absolute',
      maxWidth: '100%',
      maxHeight: '100%',
      width: 'auto',
      height: 'auto',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      margin: 'auto',
      display: 'block',
      objectFit: 'contain', // Ensures image isn't stretched
    });

    container.appendChild(img);
  });
}

function fadeInFirstSlide(captionEl) {
  const slidesDOM = document.querySelectorAll('.slide');
  if (slidesDOM.length === 0) return;

  const firstSlide = slidesDOM[0];

  firstSlide.style.opacity = 0;
  // Use a slight delay to ensure the browser registers the transition
  requestAnimationFrame(() => {
    firstSlide.style.opacity = 1;
  });

  if (captionEl && slideshowState.slides[0]) {
    captionEl.textContent = slideshowState.slides[0].caption || '';
    captionEl.style.opacity = 0;
    setTimeout(() => {
      captionEl.style.transition = 'opacity 1.5s ease-in-out';
      captionEl.style.opacity = 1;
    }, 100);
  }

  // Start autoplay
  setTimeout(() => {
    showSlide(0);
    startAutoPlay();
  }, 3000);
}

function showSlide(index) {
  const slidesDOM = document.querySelectorAll('.slide');
  const captionEl = document.getElementById('caption-text');

  // Update Caption
  if (captionEl) {
    captionEl.style.opacity = 0;
    setTimeout(() => {
      if (slideshowState.slides[index]) {
        captionEl.textContent = slideshowState.slides[index].caption || '';
      }
      captionEl.style.opacity = 1;
    }, 500); // Wait for fade out
  }

  // Update Images
  slidesDOM.forEach((img, i) => {
    img.style.opacity = i === index ? 1 : 0;
    img.style.zIndex = i === index ? 2 : 1;
  });

  slideshowState.current = index;
}

function nextSlide() {
  const next = (slideshowState.current + 1) % slideshowState.slides.length;
  showSlide(next);
}

function prevSlide() {
  const prev =
    (slideshowState.current - 1 + slideshowState.slides.length) % slideshowState.slides.length;
  showSlide(prev);
}

function startAutoPlay() {
  if (slideshowTimer) clearInterval(slideshowTimer);
  slideshowTimer = setInterval(nextSlide, 5000);
}

function resetAutoPlay() {
  if (slideshowTimer) clearInterval(slideshowTimer);
  if (!slideshowState.isPaused) startAutoPlay();
}

function setupControls(prevBtn, nextBtn, container) {
  if (nextBtn) {
    nextBtn.onclick = (e) => {
      e.preventDefault();
      nextSlide();
      resetAutoPlay();
    };
  }
  if (prevBtn) {
    prevBtn.onclick = (e) => {
      e.preventDefault();
      prevSlide();
      resetAutoPlay();
    };
  }

  container.addEventListener('mouseenter', () => {
    slideshowState.isPaused = true;
    if (slideshowTimer) clearInterval(slideshowTimer);
  });

  container.addEventListener('mouseleave', () => {
    slideshowState.isPaused = false;
    startAutoPlay();
  });

  container.addEventListener(
    'touchstart',
    () => {
      slideshowState.isPaused = true;
      if (slideshowTimer) clearInterval(slideshowTimer);
    },
    { passive: true }
  );

  container.addEventListener(
    'touchend',
    () => {
      slideshowState.isPaused = false;
      startAutoPlay();
    },
    { passive: true }
  );
}

// ---------------------------------------------------------------------------
//  Main Application Logic
// ---------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  log('Initializing site application...');

  const body = document.body;
  // Prefer the container, fall back to dynamic-content-area
  const targetContainer =
    document.querySelector('.container') || document.getElementById('dynamic-content-area');
  const navMenu = document.getElementById('main-nav');
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const closeNavBtn = document.getElementById('close-nav-btn');
  const navBackdrop = document.getElementById('nav-backdrop');

  let siteData = null;

  // Render Functions

  function renderCardGrid(cardGrid) {
    const sectionWrapper = document.createElement('section');
    sectionWrapper.className = 'card-grid';

    cardGrid.forEach((item) => {
      const card = document.createElement('div');
      card.className = item.type;
      const content = item.content;
      const cardContent = document.createElement('div');
      cardContent.className = content.type;
      if (content.class) cardContent.classList.add(...content.class.split(' '));

      if (content.link) {
        const linkElement = document.createElement('a');
        linkElement.href = content.link.href;
        linkElement.textContent = content.link.text;
        linkElement.className = content.link.class || 'page-link';
        const pageName = content.link.href.replace(/^\//, '').trim();
        if (pageName) linkElement.dataset.page = pageName;
        if (content.link.ariaLabel) linkElement.setAttribute('aria-label', content.link.ariaLabel);
        cardContent.appendChild(linkElement);
      }

      if (content.paragraph) {
        if (typeof content.paragraph === 'object' && content.paragraph.type === 'image') {
          const img = document.createElement('img');
          img.src = content.paragraph.src;
          if (content.paragraph.class) img.className = content.paragraph.class;
          cardContent.appendChild(img);
        } else {
          const p = document.createElement('p');
          p.textContent = content.paragraph;
          cardContent.appendChild(p);
        }
      }

      card.appendChild(cardContent);
      sectionWrapper.appendChild(card);
    });

    fadeSwap(targetContainer, () => {
      targetContainer.innerHTML = '';
      targetContainer.appendChild(sectionWrapper);
    });
  }

  function renderContentSection(sectionData) {
    const wrapperElement = document.createElement(sectionData.tag);
    Object.entries(sectionData.attributes || {}).forEach(([k, v]) =>
      wrapperElement.setAttribute(k, v)
    );

    sectionData.paragraphs.forEach((txt) => {
      const p = document.createElement('p');
      p.textContent = txt;
      wrapperElement.appendChild(p);
    });

    fadeSwap(targetContainer, () => {
      targetContainer.innerHTML = '';
      targetContainer.appendChild(wrapperElement);
    });
  }

  function renderContactForm(formData) {
    const sectionWrapper = document.createElement(formData.wrapper.tag);
    Object.entries(formData.wrapper.attributes || {}).forEach(([k, v]) =>
      sectionWrapper.setAttribute(k, v)
    );
    const formEl = document.createElement(formData.form.tag);
    Object.entries(formData.form.attributes || {}).forEach(([k, v]) => formEl.setAttribute(k, v));

    (formData.form.headers || []).forEach((header) => {
      const h = document.createElement(header.tag);
      h.textContent = header.text;
      formEl.appendChild(h);
    });

    formData.fields.forEach((fieldData) => {
      const wrapperEl = document.createElement(fieldData.wrapperTag || 'div');
      const inputEl = document.createElement(fieldData.tag);
      if (fieldData.text) inputEl.textContent = fieldData.text;
      Object.entries(fieldData.attributes || {}).forEach(([k, v]) => inputEl.setAttribute(k, v));
      wrapperEl.appendChild(inputEl);
      formEl.appendChild(wrapperEl);
    });

    sectionWrapper.appendChild(formEl);
    fadeSwap(targetContainer, () => {
      targetContainer.innerHTML = '';
      targetContainer.appendChild(sectionWrapper);
    });
  }

  /** Render slideshow */
  function renderSlideshow(template, pageTitle, gallerySource) {
    // FIX: EXACT Match to index1.php Structure.
    // Omitted: Logo, Category, Return Arrow (these break the CSS Grid for .container)

    // We use hardcoded HTML matching index1.php exactly,
    // plugging in IDs and Srcs from the JSON template.
    const htmlContent = `
      <div class="slideshow">
           <div class="loading-msg">Loading...</div>
      </div>

      <div class="previous">
        <button id="${
          template.previousButton.buttonId || 'prev-slide'
        }" class="prev-next circle" aria-label="Previous">
          <img src="${template.previousButton.imgSrc}" class="prev-nexts" width="50" alt="Previous">
        </button>
      </div>

      <div class="next">
        <button id="${
          template.nextButton.buttonId || 'next-slide'
        }" class="prev-next circle" aria-label="Next">
          <img src="${template.nextButton.imgSrc}" class="prev-nexts" width="50" alt="Next">
        </button>
      </div>

      <div class="caption">
        <p id="${template.caption.paragraphId || 'caption-text'}"></p>
      </div>

      <div class="footer">
        <footer>
          <div class="copyright">
            <p>©2025 Alexis Elza. All rights reserved.</p>
          </div>
        </footer>
      </div>
    `;

    fadeSwap(targetContainer, () => {
      targetContainer.innerHTML = htmlContent;
      initSlideshow(gallerySource);
    });
  }

  // Page Controller
  function renderPageContent(data, pageName) {
    if (history.state?.page) scrollMemory[history.state.page] = window.scrollY;

    clearSlideshow();
    document.title = `${data.title} | Alexis Elza`;
    body.classList.toggle('slideshow-active', Boolean(data.slideshowTemplate));

    if (data.cardGrid) renderCardGrid(data.cardGrid);
    else if (data.contentSection) renderContentSection(data.contentSection);
    else if (data.contactForm) renderContactForm(data.contactForm);
    else if (data.slideshowTemplate) {
      renderSlideshow(data.slideshowTemplate, data.title, data.slideshowTemplate.gallerySource);
    } else {
      targetContainer.innerHTML = '<p>No content available.</p>';
    }

    setTimeout(() => {
      window.scrollTo({ top: scrollMemory[pageName] || 0, behavior: 'smooth' });
    }, 50);
  }

  async function loadPage(pageName, addToHistory = true) {
    if (!siteData) return;
    if (!pageName || pageName === '/') pageName = 'home';

    const pageData = siteData.pages[pageName];
    if (!pageData) return console.error('Page not found:', pageName);

    let finalData = { title: pageData.title };
    if (pageData.type === 'slideshow') {
      const templateCopy = JSON.parse(JSON.stringify(siteData.slideshowTemplate));
      templateCopy.gallerySource = pageData.gallerySource;
      finalData.slideshowTemplate = templateCopy;
    } else if (pageData.type === 'cardGrid') finalData.cardGrid = pageData.content;
    else if (pageData.type === 'contentSection') finalData.contentSection = pageData.content;
    else if (pageData.type === 'contactForm') finalData.contactForm = pageData.content;

    renderPageContent(finalData, pageName);

    // Update Menu Active States
    const menuButtons = document.querySelectorAll('.gallery-menu .menu-button, .main-nav-menu a');
    menuButtons.forEach((btn) => btn.classList.remove('active', 'is-active'));
    // Try to find matching button
    const activeBtn = document.querySelector(
      `[data-gallery="${pageName}"], [data-page="${pageName}"]`
    );
    if (activeBtn) activeBtn.classList.add('active');

    if (addToHistory)
      history.pushState(
        { page: pageName },
        finalData.title,
        `/${pageName === 'home' ? '' : pageName}`
      );
  }

  // Initialization
  async function init() {
    try {
      const response = await fetch('json-files/site-data.json');
      if (!response.ok) throw new Error('Bad JSON response');
      siteData = await response.json();

      const path = window.location.pathname.replace(/^\//, '');
      const initialPage = path || 'home';
      loadPage(initialPage, false);
    } catch (err) {
      console.error('FATAL INIT ERROR:', err);
    }
  }

  // Global Listeners
  document.addEventListener('click', (event) => {
    // 1. Handle Navigation Links/Buttons
    const link = event.target.closest('a[data-page], button[data-gallery]');
    if (link) {
      if (link.tagName === 'BUTTON') {
        const gallery = link.dataset.gallery;
        if (gallery) loadPage(gallery);
      } else {
        event.preventDefault();
        loadPage(link.dataset.page);
      }
    }
    // 2. Handle Mobile Menu Toggles
    if (event.target.closest('#hamburger-btn')) {
      if (navMenu) navMenu.classList.add('is-open');
    }
    if (event.target.closest('#close-nav-btn') || event.target.closest('#nav-backdrop')) {
      if (navMenu) navMenu.classList.remove('is-open');
    }
  });

  window.addEventListener('popstate', (event) => {
    const page = event.state?.page || 'home';
    loadPage(page, false);
  });

  init();
});
