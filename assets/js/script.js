// Enhanced script.js with JSDoc, debugging logs, transitions, scroll restoration, modular structure

/**
 * assets/js/script.js
 * Main Router and Page Renderer (Enhanced)
 * Includes:
 *  - JSDoc annotations
 *  - Debug logging
 *  - Crossfade transitions
 *  - Scroll restoration per page
 *  - Internal modular organization (no external modules)
 */

/** Enable or disable debug logging */
const DEBUG = true;
const log = (...args) => DEBUG && console.log('[AEP]', ...args);

/** Apply a simple fade transition to the dynamic content area */
function fadeSwap(element, newContentCallback) {
  element.classList.add('fade-out');
  setTimeout(() => {
    newContentCallback();
    element.classList.remove('fade-out');
    element.classList.add('fade-in');
    setTimeout(() => element.classList.remove('fade-in'), 300);
  }, 300);
}

/** Stores scroll positions by page */
const scrollMemory = {};

// -----------------------------------------------------------------------------
//  Main Initialization Wrapper
// -----------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  log('Initializing site application...');

  const body = document.body;
  const navLinks = document.querySelectorAll('.main-nav-menu a');
  const dynamicContentArea = document.getElementById('dynamic-content-area');

  // Menu Elements
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const closeNavBtn = document.getElementById('close-nav-btn');
  const navMenu = document.getElementById('main-nav');
  const navBackdrop = document.getElementById('nav-backdrop');

  let siteData = null;

  // ---------------------------------------------------------------------------
  //  Script Loader
  // ---------------------------------------------------------------------------
  /**
   * Dynamically load a JavaScript file only once
   * @param {string} path
   * @param {Function} callback
   */
  function loadScript(path, callback) {
    log('Loading script:', path);

    const existingScript = document.querySelector(`script[src="${path}"]`);
    if (existingScript) {
      log('Script already loaded:', path);
      callback && callback();
      return;
    }

    const script = document.createElement('script');
    script.src = path;
    script.defer = true;
    script.setAttribute('data-dynamic-script', 'true');

    script.onload = () => {
      log('Loaded script:', path);
      callback && callback();
    };

    script.onerror = () => console.error('Failed to load script:', path);

    document.body.appendChild(script);
  }

  // ---------------------------------------------------------------------------
  //  Render Functions
  // ---------------------------------------------------------------------------

  /** Render a card grid */
  function renderCardGrid(cardGrid) {
    log('Rendering card grid...');

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

    fadeSwap(dynamicContentArea, () => {
      dynamicContentArea.innerHTML = '';
      dynamicContentArea.appendChild(sectionWrapper);
    });
  }

  /** Render a content section */
  function renderContentSection(sectionData) {
    log('Rendering content section...');

    const wrapperElement = document.createElement(sectionData.tag);
    Object.entries(sectionData.attributes).forEach(([k, v]) => wrapperElement.setAttribute(k, v));

    sectionData.paragraphs.forEach((txt) => {
      const p = document.createElement('p');
      p.textContent = txt;
      wrapperElement.appendChild(p);
    });

    fadeSwap(dynamicContentArea, () => {
      dynamicContentArea.innerHTML = '';
      dynamicContentArea.appendChild(wrapperElement);
    });
  }

  /** Render contact form */
  function renderContactForm(formData) {
    log('Rendering contact form...');

    const sectionWrapper = document.createElement(formData.wrapper.tag);
    Object.entries(formData.wrapper.attributes || {}).forEach(([k, v]) => sectionWrapper.setAttribute(k, v));

    const formEl = document.createElement(formData.form.tag);
    Object.entries(formData.form.attributes || {}).forEach(([k, v]) => formEl.setAttribute(k, v));

    ;(formData.form.headers || []).forEach((header) => {
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

    fadeSwap(dynamicContentArea, () => {
      dynamicContentArea.innerHTML = '';
      dynamicContentArea.appendChild(sectionWrapper);
    });
  }

  /** Render slideshow */
  function renderSlideshow(template, pageTitle) {
    log('Rendering slideshow:', pageTitle);

    const wrapper = document.createElement(template.wrapper.tag);
    wrapper.className = template.wrapper.class;

    wrapper.innerHTML = `
      <div class="logo"><p>The Life of an Artist</p></div>
      <div class="category"><p>${pageTitle}</p></div>

      <div class="${template.previousButton.wrapperClass}">
        <button id="${template.previousButton.buttonId}" aria-label="${template.previousButton.ariaLabel}">
          <img src="${template.previousButton.imgSrc}" alt="${template.previousButton.imgAlt}">
        </button>
      </div>

      <div class="${template.slideContainerClass}" data-gallery-source="${template.gallerySource}">
           <div class="loading-msg">Loading Gallery...</div>
      </div>

      <div class="${template.nextButton.wrapperClass}">
        <button id="${template.nextButton.buttonId}" aria-label="${template.nextButton.ariaLabel}">
          <img src="${template.nextButton.imgSrc}" alt="${template.nextButton.imgAlt}">
        </button>
      </div>

      <div class="${template.rtnArrow.wrapperClass}">
        <a href="/" data-page="home" aria-label="${template.rtnArrow.ariaLabel}">
          <img src="${template.rtnArrow.imgSrc}" alt="${template.rtnArrow.imgAlt}">
        </a>
      </div>

      <div class="description">
        <p id="${template.caption.paragraphId}"></p>
        <p id="${template.description.paragraphId}"></p>
      </div>
    `;

    fadeSwap(dynamicContentArea, () => {
      dynamicContentArea.innerHTML = '';
      dynamicContentArea.appendChild(wrapper);
    });

    if (template.scriptToLoad) {
      loadScript(template.scriptToLoad, () => {
        if (typeof initSlideshow === 'function') {
          log('Initializing slideshow logic...');
          initSlideshow();
        }
      });
    }
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

    document.title = `${data.title} | AEPaints`;
    body.classList.toggle('slideshow-active', Boolean(data.slideshowTemplate));

    if (data.cardGrid) renderCardGrid(data.cardGrid);
    else if (data.contentSection) renderContentSection(data.contentSection);
    else if (data.contactForm) renderContactForm(data.contactForm);
    else if (data.slideshowTemplate) renderSlideshow(data.slideshowTemplate, data.title);
    else dynamicContentArea.innerHTML = '<p>No content available.</p>';

    // Restore scroll if available
    setTimeout(() => {
      window.scrollTo({ top: scrollMemory[pageName] || 0, behavior: 'smooth' });
    }, 50);
  }

  async function loadPage(pageName, addToHistory = true) {
    if (!siteData) return;

    if (!pageName || pageName === '/') pageName = 'home';

    log('loadPage():', pageName);

    const pageData = siteData.pages[pageName];
    if (!pageData) return console.error('
