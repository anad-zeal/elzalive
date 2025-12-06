/**
 * assets/js/script.js
 * Combined Router, Page Renderer, and Cross-Fading Slideshow
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

/**
 * Apply a simple fade transition to the dynamic content area
 * @param {HTMLElement} element - The container to fade
 * @param {Function} newContentCallback - Function to execute when element is hidden (DOM update)
 */
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
//  Slideshow Logic (Refactored from script2.js)
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

  if (!slideshowContainer) {
    console.error('Slideshow container not found.');
    return;
  }

  // Ensure we look in the json-files directory
  const fetchPath = `json-files/${jsonFilename}`;

  fetch(fetchPath)
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to load ${fetchPath}`);
      return res.json();
    })
    .then((data) => {
      slideshowState.slides = data;

      // Clear any existing content (like loading messages)
      slideshowContainer.innerHTML = '';

      createSlides(slideshowContainer);
      setupControls(prevBtn, nextBtn, slideshowContainer);
      fadeInFirstSlide(caption);
    })
    .catch((err) => console.error(err));
}

function createSlides(container) {
  // Ensure container allows absolute positioning of children
  container.style.position = 'relative';
  // Ensure container has height (fallback if CSS doesn't set it)
  if (container.clientHeight === 0) container.style.minHeight = '500px';

  slideshowState.slides.forEach(({ src }, index) => {
    const img = document.createElement('img');
    img.src = src;
    img.className = 'slide';

    // Apply cross-fade styles defined in script2.js
    Object.assign(img.style, {
      opacity: 0,
      transition: 'opacity 1.5s ease-in-out',
      position: 'absolute',
      maxWidth: '100%',
      maxHeight: '100%',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      margin: 'auto',
      display: 'block',
    });

    container.appendChild(img);
  });
}

function fadeInFirstSlide(captionEl) {
  const slidesDOM = document.querySelectorAll('.slide');
  if (slidesDOM.length === 0) return;

  const firstSlide = slidesDOM[0];

  // Logic from script2: Specific initial fade sequence
  firstSlide.style.opacity = 0;
  firstSlide.style.transition = 'opacity 2s ease-in-out';

  setTimeout(() => {
    firstSlide.style.opacity = 1;

    if (captionEl && slideshowState.slides[0]) {
      captionEl.textContent = slideshowState.slides[0].caption || '';
      captionEl.style.transition = 'opacity 1.5s ease-in-out';
      captionEl.style.opacity = 0;
      setTimeout(() => {
        captionEl.style.opacity = 1;
      }, 300);
    }
  }, 50);

  // Start autoplay after initial fade
  setTimeout(() => {
    showSlide(0);
    startAutoPlay();
  }, 2000);
}

function showSlide(index) {
  const slidesDOM = document.querySelectorAll('.slide');
  const captionEl = document.getElementById('caption-text');

  // Handle Caption Fade
  if (captionEl) {
    captionEl.style.opacity = 0;
    setTimeout(() => {
      if (slideshowState.slides[index]) {
        captionEl.textContent = slideshowState.slides[index].caption || '';
      }
      captionEl.style.opacity = 1;
    }, 300);
  }

  // Handle Image Cross-fade
  slidesDOM.forEach((img, i) => {
    img.style.opacity = i === index ? 1 : 0;
    // Z-index management ensures the fading-in slide is on top if transparent
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
    nextBtn.onclick = () => {
      nextSlide();
      resetAutoPlay();
    };
  }

  if (prevBtn) {
    prevBtn.onclick = () => {
      prevSlide();
      resetAutoPlay();
    };
  }

  // Hover/Touch Pause Logic
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
//  Main Application Logic (DOMContentLoaded)
// ---------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  log('Initializing site application...');

  const body = document.body;
  const dynamicContentArea = document.getElementById('dynamic-content-area'); // Ensure this ID exists in your HTML container
  // Note: Based on index1.php, the "dynamic-content-area" is effectively the .container
  // or a wrapper you might need to add if swapping the ENTIRE container.
  // Assuming the script1.js logic implies a wrapper, e.g., <div class="container" id="dynamic-content-area">...</div>
  // If index1.php is strictly what is provided, we might need to target '.container' directly,
  // but usually SPA routers target a specific wrapper.
  // I will target '.container' if 'dynamic-content-area' is missing.

  const targetContainer =
    document.getElementById('dynamic-content-area') || document.querySelector('.container');

  // Menu Elements
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const closeNavBtn = document.getElementById('close-nav-btn');
  const navMenu = document.getElementById('main-nav');
  const navBackdrop = document.getElementById('nav-backdrop');

  let siteData = null;

  // ---------------------------------------------------------------------------
  //  Render Functions
  // ---------------------------------------------------------------------------

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

        // Handle SPA Routing attributes
        const pageName = content.link.href.replace(/^\//, '').trim();
        if (pageName) linkElement.dataset.page = pageName;

        if (content.link.ariaLabel) linkElement.setAttribute('aria-label', content.link.ariaLabel);
        cardContent.appendChild(linkElement);
      }

      if (content.paragraph) {
        // Handle simple text or image objects in paragraphs
        if (typeof content.paragraph === 'object' && content.paragraph.type === 'image') {
          const img = document.createElement('img');
          img.src = content.paragraph.src;
          img.alt = content.paragraph.alt || '';
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

      Object.entries(fieldData.attributes || {}).forEach(([k, v]) => {
        if (v === true) inputEl.setAttribute(k, '');
        else inputEl.setAttribute(k, v);
      });

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
    log('Rendering slideshow shell for:', pageTitle);

    // Create wrapper structure based on index1.php / site-data.json
    const wrapper = document.createElement(template.wrapper.tag || 'div');
    if (template.wrapper.class) wrapper.className = template.wrapper.class;

    // Construct HTML string matching index1.php
    wrapper.innerHTML = `
      <div class="logo"><p>The Life of an Artist</p></div>
      <div class="category"><p>${pageTitle}</p></div>

      <div class="slideshow">
           <div class="loading-msg">Loading Gallery...</div>
      </div>

      <div class="previous">
        <button id="${template.previousButton.buttonId}" class="prev-next circle" aria-label="${
      template.previousButton.ariaLabel
    }">
          <img src="${template.previousButton.imgSrc}" class="prev-nexts" width="50" alt="${
      template.previousButton.imgAlt
    }">
        </button>
      </div>

      <div class="next">
        <button id="${template.nextButton.buttonId}" class="prev-next circle" aria-label="${
      template.nextButton.ariaLabel
    }">
          <img src="${template.nextButton.imgSrc}" class="prev-nexts" width="50" alt="${
      template.nextButton.imgAlt
    }">
        </button>
      </div>

      <div class="caption">
        <p id="${template.caption.paragraphId}"></p>
      </div>

      <div class="footer">
        <footer>
          <div class="copyright">
            <p>©2025 Alexis Elza. All rights reserved.</p>
          </div>
        </footer>
      </div>

      <!-- Return Arrow if defined in template -->
      ${
        template.rtnArrow
          ? `
      <div class="${template.rtnArrow.wrapperClass || 'return-arrow'}">
        <a href="/" data-page="home" aria-label="${template.rtnArrow.ariaLabel}">
          <img src="${template.rtnArrow.imgSrc}" alt="${template.rtnArrow.imgAlt}">
        </a>
      </div>`
          : ''
      }
    `;

    fadeSwap(targetContainer, () => {
      targetContainer.innerHTML = '';
      targetContainer.appendChild(wrapper);

      // Initialize the integrated slideshow logic
      initSlideshow(gallerySource);
    });
  }

  // ---------------------------------------------------------------------------
  //  Page Controller
  // ---------------------------------------------------------------------------
  function renderPageContent(data, pageName) {
    log('Routing to page:', pageName);

    // Save scroll position for previous page
    if (history.state?.page) {
      scrollMemory[history.state.page] = window.scrollY;
    }

    // CLEANUP: Stop any running slideshow before rendering new content
    clearSlideshow();

    document.title = `${data.title} | Alexis Elza`;

    // Toggle class on body if needed for specific styling hooks
    body.classList.toggle('slideshow-active', Boolean(data.slideshowTemplate));

    if (data.cardGrid) {
      renderCardGrid(data.cardGrid);
    } else if (data.contentSection) {
      renderContentSection(data.contentSection);
    } else if (data.contactForm) {
      renderContactForm(data.contactForm);
    } else if (data.slideshowTemplate) {
      renderSlideshow(data.slideshowTemplate, data.title, data.slideshowTemplate.gallerySource);
    } else {
      targetContainer.innerHTML = '<p>No content available.</p>';
    }

    // Restore scroll if available
    setTimeout(() => {
      window.scrollTo({ top: scrollMemory[pageName] || 0, behavior: 'smooth' });
    }, 50);
  }

  async function loadPage(pageName, addToHistory = true) {
    if (!siteData) return;
    if (!pageName || pageName === '/') pageName = 'home';

    const pageData = siteData.pages[pageName];
    if (!pageData) {
      console.error('Page not found:', pageName);
      return;
    }

    let finalData = { title: pageData.title };

    if (pageData.type === 'slideshow') {
      const templateCopy = JSON.parse(JSON.stringify(siteData.slideshowTemplate));
      templateCopy.gallerySource = pageData.gallerySource;
      finalData.slideshowTemplate = templateCopy;
    } else if (pageData.type === 'cardGrid') {
      finalData.cardGrid = pageData.content;
    } else if (pageData.type === 'contentSection') {
      finalData.contentSection = pageData.content;
    } else if (pageData.type === 'contactForm') {
      finalData.contactForm = pageData.content;
    }

    renderPageContent(finalData, pageName);

    // Highlight active link in Menu
    const menuButtons = document.querySelectorAll('.gallery-menu .menu-button, .main-nav-menu a');
    menuButtons.forEach((btn) => btn.classList.remove('active', 'is-active'));

    // Try to find matching button by data-gallery or data-page
    const activeBtn = document.querySelector(
      `[data-gallery="${pageName}"], [data-page="${pageName}"]`
    );
    if (activeBtn) activeBtn.classList.add('active');

    if (addToHistory) {
      history.pushState(
        { page: pageName },
        finalData.title,
        `/${pageName === 'home' ? '' : pageName}`
      );
    }
  }

  // ---------------------------------------------------------------------------
  //  Menu Logic
  // ---------------------------------------------------------------------------
  function toggleMenu(show) {
    if (!navMenu) return;
    navMenu.classList.toggle('is-open', show);
    if (hamburgerBtn) {
      hamburgerBtn.classList.toggle('is-hidden', show);
      hamburgerBtn.setAttribute('aria-expanded', show ? 'true' : 'false');
    }
  }

  if (hamburgerBtn) hamburgerBtn.addEventListener('click', () => toggleMenu(true));
  if (closeNavBtn) closeNavBtn.addEventListener('click', () => toggleMenu(false));
  if (navBackdrop) navBackdrop.addEventListener('click', () => toggleMenu(false));

  // ---------------------------------------------------------------------------
  //  Initialization
  // ---------------------------------------------------------------------------
  async function init() {
    try {
      log('Loading site-data.json...');
      const response = await fetch('json-files/site-data.json');
      if (!response.ok) throw new Error('Bad JSON response');
      siteData = await response.json();

      const path = window.location.pathname.replace(/^\//, '');
      const initialPage = path || 'home';
      // If path is empty, load 'home', otherwise load the page
      loadPage(initialPage, false);
    } catch (err) {
      console.error('FATAL INIT ERROR:', err);
    }
  }

  // ---------------------------------------------------------------------------
  //  Global Listeners
  // ---------------------------------------------------------------------------
  document.addEventListener('click', (event) => {
    // Handle menu buttons and links
    const link = event.target.closest('a[data-page], button[data-gallery]');
    if (link) {
      // Don't prevent default if it's a standard link, but here we act as SPA
      // If it's a button
      if (link.tagName === 'BUTTON') {
        const gallery = link.dataset.gallery;
        if (gallery) loadPage(gallery);
      } else {
        event.preventDefault();
        toggleMenu(false);
        loadPage(link.dataset.page);
      }
    }
  });

  window.addEventListener('popstate', (event) => {
    const page = event.state?.page || 'home';
    loadPage(page, false);
  });

  init();
});
